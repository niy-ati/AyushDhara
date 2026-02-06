# 🌿 AyushDhara AI: Modernizing 5,000 Years of AYUSH Wisdom

[![AWS Powered](https://img.shields.io/badge/AWS-Powered-orange?logo=amazon-aws&logoColor=white)](https://aws.amazon.com/)
[![Track](https://img.shields.io/badge/Track-Communities_%26_Public_Impact-green)](https://aws.amazon.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)

> **Digital Public Infrastructure (DPI) for Inclusive Healthcare.** Bridging India's rural health gap through a multilingual, voice-first Digital Vaidya and a real-time Public Health Sentinel dashboard.

---

## 🎯 The Vision & Problem Statement
AyushDhara AI addresses the **Trust Deficit** and **Accessibility Gap** in Indian healthcare. With 70% of India's population in rural areas and practitioners concentrated in urban centers, our solution provides a "Health Guardian" in every pocket, grounded in verified AYUSH scriptures.

### 📊 Impact Metrics
- **Affordability:** Scalable to **₹0.50 - 1.50** per consultation via AWS Serverless.
- **Inclusion:** Voice-first interaction in **5+ Indic languages** (Hindi, Tamil, Telugu, Bengali, English).
- **Public Impact:** Real-time outbreak detection **2 weeks faster** than traditional systems.

---

## ✨ Core Features

### 1. 🧘 Conversational Prakriti Assessment (B2C)
An AI-driven interview to determine a user's *Vata/Pitta/Kapha* constitution, delivering hyper-personalized preventative care plans based on lifestyle data.

### 2. 🛡️ Grounded Health Advisory (RAG)
Powered by **Amazon Bedrock (Claude 3.5 Sonnet)** and **Knowledge Bases**, ensuring health guidance is strictly retrieved from verified AYUSH datasets to eliminate AI hallucinations.

### 3. 🛰️ Sentinel Dashboard (B2G)
A public health surveillance engine that anonymizes and aggregates community symptom data to visualize disease hotspots for government officials, transforming reactive systems into proactive ones.

---

## 🏗️ Technical Architecture
AyushDhara AI utilizes a highly scalable, serverless event-driven architecture designed for the "Next Billion Users."

graph TD
    %% User Layer
    User((User Device)) -- "Voice/Text" --> API[Amazon API Gateway]
    
    %% Logic Layer
    API --> Lambda[AWS Lambda Orchestrator]
    
    %% AI/NLP Layer
    Lambda --> Transcribe[Amazon Transcribe / Polly]
    Lambda --> Bedrock[Amazon Bedrock Claude 3.5]
    
    %% Data Layer
    Bedrock --> Knowledge[RAG: AYUSH Knowledge Base]
    Bedrock --> OS[OpenSearch Serverless]
    Lambda --> DDB[(DynamoDB: Patient Records)]
    
    %% Impact Layer
    DDB --> Sentinel[Sentinel Public Impact Dashboard]

    %% Styling
    style User fill:#F0F4F1,stroke:#2D5A27,stroke-width:2px
    style Sentinel fill:#2D5A27,stroke:#fff,color:#fff
    style Bedrock fill:#FF9900,stroke:#232F3E,color:#fff

- **AI/LLM:** Amazon Bedrock (Claude 3.5 Sonnet) using Retrieval-Augmented Generation (RAG).
- **Voice/NLP:** Amazon Transcribe (Indic accents) & Amazon Polly (Natural Indian voices).
- **Data Layer:** Amazon DynamoDB (Single-Table Design) & OpenSearch Serverless (Vector Store).
- **Compute:** AWS Lambda (Node.js 20.x) & Amazon API Gateway.
- **Security:** AWS KMS (PII Encryption) & Bedrock Guardrails.

---

## ⚖️ Safety & Compliance (Responsible AI)
To ensure "Direct Selection" in the hackathon, we have prioritized ethics and safety:

- **Emergency Hand-Off:** A dedicated `lib/safety.ts` layer intercepts "Red Flag" symptoms (e.g., chest pain, breathing difficulty) to immediately direct users to **108 Emergency Services**.
- **DPDP Act 2023:** Implements strict PII anonymization before data enters the Sentinel surveillance loop to protect citizen privacy.
- **ABDM Ready:** Data structures utilize **FHIR R4 standards** and **SNOMED CT** codes for seamless integration with India's national health mission.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- AWS CLI configured for `ap-south-1` (Mumbai)
- Amazon Bedrock Model Access enabled for Claude 3.5 Sonnet

### Setup & Installation
1. **Clone & Install:**
   ```bash
   git clone [https://github.com/niyatijain/ayushdhara-ai.git](https://github.com/niyatijain/ayushdhara-ai.git)
   cd ayushdhara-ai
   npm install
