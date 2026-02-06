/**
 * DynamoDB Data Access Layer Utilities
 * Provides helper functions for PK/SK generation and query builders
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  QueryCommand,
  UpdateCommand,
  DeleteCommand,
  PutCommandInput,
  GetCommandInput,
  QueryCommandInput,
  UpdateCommandInput,
  DeleteCommandInput,
} from '@aws-sdk/lib-dynamodb';
import {
  UserEntity,
  PrakritiEntity,
  SymptomEntity,
  PrakritiProfile,
  SymptomReport,
  SupportedLanguage,
} from '../types';

// Initialize DynamoDB Document Client
const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
});

export const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true,
    convertClassInstanceToMap: true,
  },
});

// Table name from environment or default
export const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || 'AyushDhara-Main';

/**
 * PK/SK Generation Helper Functions
 */

export const generateUserPK = (userId: string): string => {
  return `USER#${userId}`;
};

export const generateProfileSK = (): string => {
  return 'PROFILE';
};

export const generatePrakritiSK = (timestamp?: number): string => {
  const ts = timestamp || Date.now();
  return `PRAKRITI#${ts}`;
};

export const generateQuerySK = (timestamp?: number): string => {
  const ts = timestamp || Date.now();
  return `QUERY#${ts}`;
};

export const generateRegionPK = (pincode: string): string => {
  return `REGION#${pincode}`;
};

export const generateSymptomSK = (symptomType: string, date: string): string => {
  return `SYMPTOM#${symptomType}#${date}`;
};

export const generateWellnessPlanSK = (date: string): string => {
  return `PLAN#${date}`;
};

export const generateSymptomGSI1PK = (symptomType: string): string => {
  return `SYMPTOM#${symptomType}`;
};

export const generateSymptomGSI1SK = (date: string): string => {
  return `DATE#${date}`;
};

/**
 * User Entity Operations
 */

export interface CreateUserParams {
  userId: string;
  language: SupportedLanguage;
  consentGiven: boolean;
  encryptedData?: string;
}

export const createUser = async (params: CreateUserParams): Promise<UserEntity> => {
  const entity: UserEntity = {
    PK: generateUserPK(params.userId),
    SK: generateProfileSK(),
    userId: params.userId,
    language: params.language,
    createdAt: new Date().toISOString(),
    consentGiven: params.consentGiven,
    encryptedData: params.encryptedData,
  };

  const command = new PutCommand({
    TableName: TABLE_NAME,
    Item: entity,
  });

  await docClient.send(command);
  return entity;
};

export const getUser = async (userId: string): Promise<UserEntity | null> => {
  const command = new GetCommand({
    TableName: TABLE_NAME,
    Key: {
      PK: generateUserPK(userId),
      SK: generateProfileSK(),
    },
  });

  const result = await docClient.send(command);
  return (result.Item as UserEntity) || null;
};

/**
 * Prakriti Entity Operations
 */

export interface CreatePrakritiParams {
  userId: string;
  profile: PrakritiProfile;
}

export const createPrakriti = async (params: CreatePrakritiParams): Promise<PrakritiEntity> => {
  const timestamp = Date.now();
  const entity: PrakritiEntity = {
    PK: generateUserPK(params.userId),
    SK: generatePrakritiSK(timestamp),
    scores: params.profile.scores,
    dominant: params.profile.dominant,
    assessmentDate: params.profile.assessmentDate,
  };

  const command = new PutCommand({
    TableName: TABLE_NAME,
    Item: entity,
  });

  await docClient.send(command);
  return entity;
};

export const getLatestPrakriti = async (userId: string): Promise<PrakritiEntity | null> => {
  const command = new QueryCommand({
    TableName: TABLE_NAME,
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
    ExpressionAttributeValues: {
      ':pk': generateUserPK(userId),
      ':sk': 'PRAKRITI#',
    },
    ScanIndexForward: false, // Sort descending to get latest first
    Limit: 1,
  });

  const result = await docClient.send(command);
  return (result.Items?.[0] as PrakritiEntity) || null;
};

export const getAllPrakritiHistory = async (userId: string): Promise<PrakritiEntity[]> => {
  const command = new QueryCommand({
    TableName: TABLE_NAME,
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
    ExpressionAttributeValues: {
      ':pk': generateUserPK(userId),
      ':sk': 'PRAKRITI#',
    },
    ScanIndexForward: false, // Sort descending (newest first)
  });

  const result = await docClient.send(command);
  return (result.Items as PrakritiEntity[]) || [];
};

/**
 * Symptom Entity Operations (Anonymized)
 */

export interface CreateSymptomParams {
  pincode: string;
  symptomType: string;
  count: number;
  severity: 'low' | 'medium' | 'high';
  date: string;
}

export const createSymptom = async (params: CreateSymptomParams): Promise<SymptomEntity> => {
  const entity: SymptomEntity = {
    PK: generateRegionPK(params.pincode),
    SK: generateSymptomSK(params.symptomType, params.date),
    symptomType: params.symptomType,
    count: params.count,
    severity: params.severity,
    date: params.date,
    GSI1PK: generateSymptomGSI1PK(params.symptomType),
    GSI1SK: generateSymptomGSI1SK(params.date),
  };

  const command = new PutCommand({
    TableName: TABLE_NAME,
    Item: entity,
  });

  await docClient.send(command);
  return entity;
};

export const getSymptomsByRegion = async (
  pincode: string,
  startDate?: string,
  endDate?: string
): Promise<SymptomEntity[]> => {
  let keyConditionExpression = 'PK = :pk AND begins_with(SK, :sk)';
  const expressionAttributeValues: Record<string, any> = {
    ':pk': generateRegionPK(pincode),
    ':sk': 'SYMPTOM#',
  };

  const command = new QueryCommand({
    TableName: TABLE_NAME,
    KeyConditionExpression: keyConditionExpression,
    ExpressionAttributeValues: expressionAttributeValues,
  });

  const result = await docClient.send(command);
  let items = (result.Items as SymptomEntity[]) || [];

  // Filter by date range if provided
  if (startDate || endDate) {
    items = items.filter((item) => {
      if (startDate && item.date < startDate) return false;
      if (endDate && item.date > endDate) return false;
      return true;
    });
  }

  return items;
};

export const getSymptomsByType = async (
  symptomType: string,
  startDate?: string,
  endDate?: string
): Promise<SymptomEntity[]> => {
  let keyConditionExpression = 'GSI1PK = :gsi1pk';
  const expressionAttributeValues: Record<string, any> = {
    ':gsi1pk': generateSymptomGSI1PK(symptomType),
  };

  if (startDate && endDate) {
    keyConditionExpression += ' AND GSI1SK BETWEEN :startDate AND :endDate';
    expressionAttributeValues[':startDate'] = generateSymptomGSI1SK(startDate);
    expressionAttributeValues[':endDate'] = generateSymptomGSI1SK(endDate);
  } else if (startDate) {
    keyConditionExpression += ' AND GSI1SK >= :startDate';
    expressionAttributeValues[':startDate'] = generateSymptomGSI1SK(startDate);
  } else if (endDate) {
    keyConditionExpression += ' AND GSI1SK <= :endDate';
    expressionAttributeValues[':endDate'] = generateSymptomGSI1SK(endDate);
  }

  const command = new QueryCommand({
    TableName: TABLE_NAME,
    IndexName: 'GSI1',
    KeyConditionExpression: keyConditionExpression,
    ExpressionAttributeValues: expressionAttributeValues,
  });

  const result = await docClient.send(command);
  return (result.Items as SymptomEntity[]) || [];
};

export const incrementSymptomCount = async (
  pincode: string,
  symptomType: string,
  date: string,
  incrementBy: number = 1
): Promise<void> => {
  const command = new UpdateCommand({
    TableName: TABLE_NAME,
    Key: {
      PK: generateRegionPK(pincode),
      SK: generateSymptomSK(symptomType, date),
    },
    UpdateExpression: 'ADD #count :increment',
    ExpressionAttributeNames: {
      '#count': 'count',
    },
    ExpressionAttributeValues: {
      ':increment': incrementBy,
    },
  });

  await docClient.send(command);
};

/**
 * Query Builder Utilities
 */

export interface QueryBuilderOptions {
  tableName?: string;
  indexName?: string;
  pk: string;
  sk?: string;
  skCondition?: 'begins_with' | 'between' | 'equals' | 'greater_than' | 'less_than';
  skValue?: string | [string, string]; // Single value or tuple for BETWEEN
  limit?: number;
  scanIndexForward?: boolean;
  filterExpression?: string;
  filterValues?: Record<string, any>;
}

export const buildQuery = (options: QueryBuilderOptions): QueryCommandInput => {
  let keyConditionExpression = 'PK = :pk';
  const expressionAttributeValues: Record<string, any> = {
    ':pk': options.pk,
  };

  // Add SK condition if provided
  if (options.sk && options.skCondition) {
    switch (options.skCondition) {
      case 'begins_with':
        keyConditionExpression += ' AND begins_with(SK, :sk)';
        expressionAttributeValues[':sk'] = options.sk;
        break;
      case 'equals':
        keyConditionExpression += ' AND SK = :sk';
        expressionAttributeValues[':sk'] = options.sk;
        break;
      case 'greater_than':
        keyConditionExpression += ' AND SK > :sk';
        expressionAttributeValues[':sk'] = options.sk;
        break;
      case 'less_than':
        keyConditionExpression += ' AND SK < :sk';
        expressionAttributeValues[':sk'] = options.sk;
        break;
      case 'between':
        if (Array.isArray(options.skValue) && options.skValue.length === 2) {
          keyConditionExpression += ' AND SK BETWEEN :sk1 AND :sk2';
          expressionAttributeValues[':sk1'] = options.skValue[0];
          expressionAttributeValues[':sk2'] = options.skValue[1];
        }
        break;
    }
  }

  const queryInput: QueryCommandInput = {
    TableName: options.tableName || TABLE_NAME,
    KeyConditionExpression: keyConditionExpression,
    ExpressionAttributeValues: expressionAttributeValues,
  };

  if (options.indexName) {
    queryInput.IndexName = options.indexName;
  }

  if (options.limit) {
    queryInput.Limit = options.limit;
  }

  if (options.scanIndexForward !== undefined) {
    queryInput.ScanIndexForward = options.scanIndexForward;
  }

  if (options.filterExpression && options.filterValues) {
    queryInput.FilterExpression = options.filterExpression;
    Object.assign(expressionAttributeValues, options.filterValues);
  }

  return queryInput;
};

/**
 * Batch Operations
 */

export const batchGetUsers = async (userIds: string[]): Promise<UserEntity[]> => {
  const results: UserEntity[] = [];

  // DynamoDB BatchGet has a limit of 100 items
  for (let i = 0; i < userIds.length; i += 100) {
    const batch = userIds.slice(i, i + 100);
    const promises = batch.map((userId) => getUser(userId));
    const batchResults = await Promise.all(promises);
    results.push(...batchResults.filter((item): item is UserEntity => item !== null));
  }

  return results;
};

/**
 * Data Privacy & ABDM Compliance Utilities
 * Implements anonymization for public health surveillance
 * Complies with Digital Personal Data Protection (DPDP) Act 2023
 * 
 * Requirements: 7.1, 7.3, 4.4
 */

import { createHash } from 'crypto';

export interface AnonymizedSymptomData {
  hashedUserId: string;
  symptomType: string;
  severity: 'low' | 'medium' | 'high';
  pincode: string; // Only pincode retained, not full address
  timestamp: number;
  // NO PII: name, phone, email, full address removed
}

/**
 * Anonymize symptom report for Sentinel Dashboard
 * Strips all PII and hashes user identifiers
 * 
 * @param report - Original symptom report with potential PII
 * @param salt - Salt for hashing (should be environment-specific)
 * @returns Anonymized data safe for public health analytics
 */
export function anonymizeForSentinel(
  report: SymptomReport & { name?: string; phone?: string; email?: string; fullAddress?: string },
  salt: string = process.env.HASH_SALT || 'default-salt-change-in-production'
): AnonymizedSymptomData {
  // Hash the userId with salt to prevent re-identification
  const hashedUserId = createHash('sha256')
    .update(`${report.userId}${salt}`)
    .digest('hex');

  // Return only anonymized, aggregatable data
  return {
    hashedUserId,
    symptomType: report.symptomType,
    severity: report.severity,
    pincode: report.location.pincode, // Only pincode, not full address
    timestamp: report.timestamp,
    // Explicitly exclude: name, phone, email, fullAddress, state
  };
}

/**
 * Validate that data is properly anonymized before storage
 * Throws error if PII detected
 */
export function validateAnonymization(data: any): boolean {
  const piiFields = ['name', 'phone', 'email', 'fullAddress', 'address'];
  
  for (const field of piiFields) {
    if (data.hasOwnProperty(field)) {
      throw new Error(`PII field '${field}' detected in anonymized data. DPDP Act 2023 violation.`);
    }
  }

  // Ensure userId is hashed (should be 64 characters for SHA-256)
  if (data.userId && data.userId.length !== 64) {
    throw new Error('userId must be hashed before storage in public health database');
  }

  return true;
}

/**
 * Aggregate anonymized symptom data by region and date
 * Used for Sentinel Dashboard visualization
 */
export async function aggregateSymptomsByRegion(
  pincode: string,
  date: string
): Promise<Map<string, number>> {
  const symptoms = await getSymptomsByRegion(pincode, date, date);
  
  const aggregation = new Map<string, number>();
  
  for (const symptom of symptoms) {
    const current = aggregation.get(symptom.symptomType) || 0;
    aggregation.set(symptom.symptomType, current + symptom.count);
  }

  return aggregation;
}

/**
 * FHIR-compliant data structure for future ABDM integration
 * Follows Fast Healthcare Interoperability Resources (FHIR) R4 standard
 */
export interface FHIRObservation {
  resourceType: 'Observation';
  id: string;
  status: 'registered' | 'preliminary' | 'final' | 'amended';
  code: {
    coding: Array<{
      system: string; // e.g., "http://snomed.info/sct"
      code: string;
      display: string;
    }>;
  };
  subject: {
    reference: string; // Anonymized reference
  };
  effectiveDateTime: string;
  valueString?: string;
  interpretation?: Array<{
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  }>;
}

/**
 * Convert anonymized symptom data to FHIR Observation format
 * Prepares data for future ABDM (Ayushman Bharat Digital Mission) integration
 */
export function toFHIRObservation(data: AnonymizedSymptomData): FHIRObservation {
  return {
    resourceType: 'Observation',
    id: data.hashedUserId,
    status: 'final',
    code: {
      coding: [
        {
          system: 'http://snomed.info/sct',
          code: 'symptom-code', // Would map to actual SNOMED CT codes
          display: data.symptomType,
        },
      ],
    },
    subject: {
      reference: `Patient/${data.hashedUserId}`, // Anonymized reference
    },
    effectiveDateTime: new Date(data.timestamp).toISOString(),
    valueString: data.symptomType,
    interpretation: [
      {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation',
            code: data.severity === 'high' ? 'H' : data.severity === 'low' ? 'L' : 'N',
            display: data.severity,
          },
        ],
      },
    ],
  };
}
