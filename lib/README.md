# Data Access Layer

This directory contains utilities for interacting with AWS services, particularly DynamoDB, and core business logic for the AyushDhara AI platform.

## Prakriti Calculator (`prakriti-calculator.ts`)

Implements the core algorithm for calculating a user's Ayurvedic constitution (Prakriti) based on quiz answers.

### Key Features

- **Dosha Scoring**: Calculates weighted scores for Vata, Pitta, and Kapha doshas
- **Normalization**: Normalizes scores to 0-100 scale for consistency
- **Dominant/Secondary Detection**: Determines primary and secondary doshas
- **Balanced Detection**: Identifies balanced constitutions (all doshas within 10%)
- **Type Safety**: Full TypeScript support with proper validation

### Usage Examples

```typescript
import { calculatePrakriti, createQuizAnswer } from './lib/prakriti-calculator';

// Create quiz answers with dosha weights
const answers = [
  createQuizAnswer(1, 4, 1.0, 0.5, 0.3), // Question 1: answer=4, vata-dominant
  createQuizAnswer(2, 3, 0.4, 1.0, 0.6), // Question 2: answer=3, pitta-dominant
  createQuizAnswer(3, 5, 0.2, 0.3, 1.0), // Question 3: answer=5, kapha-dominant
];

// Calculate Prakriti profile
const profile = calculatePrakriti('user-123', answers);

console.log(profile);
// {
//   userId: 'user-123',
//   scores: { vata: 85, pitta: 62, kapha: 73 },
//   dominant: 'vata',
//   secondary: 'kapha',
//   assessmentDate: '2026-02-06T...'
// }
```

### Algorithm Details

1. **Raw Score Calculation**: Multiplies each answer (1-5) by dosha weights and sums
2. **Normalization**: Scales scores to 0-100 based on maximum score
3. **Dominant Determination**: Highest scoring dosha becomes dominant
4. **Secondary Determination**: Second-highest dosha if within 15% of dominant
5. **Balanced Detection**: All doshas within 10% range = balanced constitution

### Requirements

- Validates: Requirements 1.3, 1.4

## DynamoDB Utilities (`dynamodb-utils.ts`)

Provides a comprehensive data access layer for the AyushDhara AI single-table DynamoDB design.

### Key Features

- **PK/SK Generation**: Helper functions to generate consistent partition and sort keys
- **Entity Operations**: CRUD operations for User, Prakriti, and Symptom entities
- **Query Builders**: Flexible query construction for complex access patterns
- **Type Safety**: Full TypeScript support with proper entity interfaces

### Usage Examples

#### User Operations

```typescript
import { createUser, getUser } from './lib/dynamodb-utils';

// Create a new user
const user = await createUser({
  userId: 'user-123',
  language: 'hi',
  consentGiven: true,
});

// Retrieve user
const existingUser = await getUser('user-123');
```

#### Prakriti Operations

```typescript
import { createPrakriti, getLatestPrakriti } from './lib/dynamodb-utils';

// Store Prakriti assessment
await createPrakriti({
  userId: 'user-123',
  profile: {
    userId: 'user-123',
    scores: { vata: 45, pitta: 30, kapha: 25 },
    dominant: 'vata',
    assessmentDate: new Date().toISOString(),
  },
});

// Get latest assessment
const prakriti = await getLatestPrakriti('user-123');
```

#### Symptom Operations (Anonymized)

```typescript
import { createSymptom, getSymptomsByRegion, getSymptomsByType } from './lib/dynamodb-utils';

// Record anonymized symptom data
await createSymptom({
  pincode: '110001',
  symptomType: 'fever',
  count: 5,
  severity: 'medium',
  date: '2026-02-06',
});

// Query by region
const regionalSymptoms = await getSymptomsByRegion('110001', '2026-02-01', '2026-02-06');

// Query by symptom type (uses GSI1)
const feverCases = await getSymptomsByType('fever', '2026-02-01', '2026-02-06');
```

#### Query Builder

```typescript
import { buildQuery, docClient } from './lib/dynamodb-utils';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';

// Build complex queries
const queryInput = buildQuery({
  pk: 'USER#user-123',
  sk: 'QUERY#',
  skCondition: 'begins_with',
  limit: 10,
  scanIndexForward: false,
});

const result = await docClient.send(new QueryCommand(queryInput));
```

### Access Patterns Supported

1. **Get User Profile**: `PK = USER#{userId}, SK = PROFILE`
2. **Get Latest Prakriti**: `PK = USER#{userId}, SK begins_with PRAKRITI#` (descending)
3. **Get Prakriti History**: `PK = USER#{userId}, SK begins_with PRAKRITI#`
4. **Get Symptoms by Region**: `PK = REGION#{pincode}, SK begins_with SYMPTOM#`
5. **Get Symptoms by Type**: `GSI1: GSI1PK = SYMPTOM#{type}, GSI1SK = DATE#{date}`
6. **Get Wellness Plans**: `PK = USER#{userId}, SK begins_with PLAN#`

### Environment Variables

- `AWS_REGION`: AWS region for DynamoDB (default: us-east-1)
- `DYNAMODB_TABLE_NAME`: Table name (default: AyushDhara-Main)

### Data Privacy

All symptom data stored through these utilities is anonymized:
- No user IDs are stored with symptom data
- Only pincode (not full address) is retained
- PII is encrypted using AWS KMS before storage
