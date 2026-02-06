/**
 * AWS SDK v3 Configuration
 * Centralized configuration for all AWS services used in AyushDhara AI
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { BedrockRuntimeClient } from '@aws-sdk/client-bedrock-runtime';
import { TranscribeClient } from '@aws-sdk/client-transcribe';
import { PollyClient } from '@aws-sdk/client-polly';

// AWS Region Configuration
const AWS_REGION = process.env.AWS_REGION || 'ap-south-1';

// DynamoDB Client Configuration
const dynamoDBClient = new DynamoDBClient({
  region: AWS_REGION,
});

export const docClient = DynamoDBDocumentClient.from(dynamoDBClient, {
  marshallOptions: {
    removeUndefinedValues: true,
    convertClassInstanceToMap: true,
  },
  unmarshallOptions: {
    wrapNumbers: false,
  },
});

// Bedrock Runtime Client Configuration
export const bedrockClient = new BedrockRuntimeClient({
  region: AWS_REGION,
});

// Transcribe Client Configuration
export const transcribeClient = new TranscribeClient({
  region: AWS_REGION,
});

// Polly Client Configuration
export const pollyClient = new PollyClient({
  region: AWS_REGION,
});

// Configuration Constants
export const AWS_CONFIG = {
  region: AWS_REGION,
  dynamodb: {
    tableName: process.env.DYNAMODB_TABLE_NAME || 'AyushDhara-Main',
  },
  bedrock: {
    modelId: process.env.BEDROCK_MODEL_ID || 'anthropic.claude-3-5-sonnet-20241022-v2:0',
    knowledgeBaseId: process.env.BEDROCK_KNOWLEDGE_BASE_ID || '',
    guardrailsEnabled: process.env.ENABLE_GUARDRAILS === 'true',
  },
  transcribe: {
    languageCodes: (process.env.TRANSCRIBE_LANGUAGE_CODES || 'hi-IN,ta-IN,te-IN,bn-IN,en-IN').split(','),
  },
  polly: {
    voices: {
      hi: process.env.POLLY_VOICE_ID_HINDI || 'Aditi',
      ta: process.env.POLLY_VOICE_ID_TAMIL || 'Kajal',
      te: process.env.POLLY_VOICE_ID_TELUGU || 'Kajal',
      bn: process.env.POLLY_VOICE_ID_BENGALI || 'Aditi',
      en: process.env.POLLY_VOICE_ID_ENGLISH || 'Kajal',
    },
  },
  api: {
    rateLimit: parseInt(process.env.API_RATE_LIMIT || '100', 10),
  },
} as const;

export type AWSConfig = typeof AWS_CONFIG;
