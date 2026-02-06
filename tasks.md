# Implementation Plan: AyushDhara AI

## Overview

This implementation plan breaks down the AyushDhara AI platform into discrete, manageable tasks. The approach follows a bottom-up strategy: building core infrastructure first, then implementing individual features, and finally integrating everything into a cohesive system. Each task builds incrementally to ensure continuous validation.

## Tasks

- [x] 1. Set up project structure and core infrastructure
  - Initialize Next.js 15 project with App Router and TypeScript
  - Configure Tailwind CSS with Nature-Tech theme (#F0F4F1, #2D5A27)
  - Set up AWS CDK project for infrastructure as code
  - Configure environment variables and AWS SDK v3
  - Install dependencies: Lucide React, Recharts, fast-check, AWS SDK
  - _Requirements: 10.1, 10.2_

- [x] 2. Implement DynamoDB data layer
  - [x] 2.1 Create DynamoDB single-table schema with CDK
    - Define table with PK, SK, and GSI1 structure
    - Configure on-demand billing and encryption
    - Set up TTL for temporary data
    - _Requirements: 6.4, 7.2_
  
  - [x] 2.2 Implement data access layer utilities
    - Create TypeScript interfaces for all entities (User, Prakriti, Symptom)
    - Write helper functions for PK/SK generation
    - Implement query builders for access patterns
    - _Requirements: 6.4_
  
  - [x] 2.3 Write property test for data access layer

    - **Property 10: Data encryption at rest**
    - **Validates: Requirements 7.2**

- [x] 3. Build Prakriti Assessment system
  - [x] 3.1 Create Prakriti calculation algorithm
    - Implement scoring logic for Vata/Pitta/Kapha
    - Determine dominant and secondary doshas
    - Create TypeScript types for quiz answers and profiles
    - _Requirements: 1.3, 1.4_
  
  - [x] 3.2 Write property test for Prakriti calculation
    - **Property 1: Prakriti Assessment Consistency**
    - **Validates: Requirements 1.3, 1.4**

- [-] 4. Implement Public Health Sentinel Dashboard
  - [x] 4.1 Create SentinelMap component with Nature-Tech glassmorphism
    - Build trend visualization using Recharts (line charts, bar charts, pie charts)
    - Implement symptom hotspot heatmap with severity indicators
    - Add regional filtering and date range selection
    - Use Nature-Tech color palette (#2D5A27, #F0F4F1, #8BC34A)
    - _Requirements: 4.1, 4.2, 4.3, 9.1, 9.2_
  
  - [x] 4.2 Implement data anonymization utilities
    - Create `anonymizeForSentinel` function to strip PII
    - Hash user IDs with salt before logging to regional GSI
    - Validate DPDP Act 2023 compliance
    - Add FHIR-compliant data structures for ABDM integration
    - _Requirements: 7.1, 7.3, 4.4_
  
  - [ ]* 4.3 Write property test for anonymization
    - **Property 3: PII Anonymization Completeness**
    - **Validates: Requirements 7.3, 4.4**
  
  - [ ] 4.4 Create dashboard API route
    - Implement `/api/sentinel/hotspots` endpoint
    - Aggregate anonymized symptom data by region
    - Return trend data for visualization
    - _Requirements: 4.2, 4.3_

- [-] 5. Implement Emergency Safety Guardrails
  - [x] 5.1 Create safety keyword detection system
    - Implement `checkEmergencyKeywords` function in `lib/safety.ts`
    - Define critical emergency keywords (chest pain, difficulty breathing, etc.)
    - Support multilingual emergency detection (Hindi, Tamil, Telugu, Bengali, English)
    - _Requirements: 2.3, 2.4, 9.5_
  
  - [x] 5.2 Integrate safety checks into chat API
    - Add emergency check at start of POST handler in `/api/chat/route.ts`
    - Bypass Bedrock RAG loop for emergency situations
    - Return immediate emergency response directing to 108
    - Log emergency detections for monitoring (no PII)
    - _Requirements: 2.3, 2.4, 8.1_
  
  - [ ]* 5.3 Write property test for safety detection
    - **Property 9: Guardrail Safety Enforcement**
    - **Validates: Requirements 2.3, 2.4**
  
  - [ ] 5.4 Create safety monitoring dashboard
    - Track emergency keyword detection rates
    - Monitor false positive/negative rates
    - Alert system for unusual emergency patterns
    - _Requirements: 2.4, 8.3_

- [ ] 6. Checkpoint - Public Impact Track Compliance Review
  - Verify all emergency safety guardrails are functional
  - Confirm Sentinel Dashboard displays anonymized data correctly
  - Validate DPDP Act 2023 compliance for all data flows
  - Test FHIR data structure compatibility
  - Ensure all tests pass, ask the user if questions arise.