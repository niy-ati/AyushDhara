/**
 * Emergency Safety Layer
 * 
 * This module implements critical safety checks to identify emergency medical situations
 * and provide immediate guidance to users, bypassing the AI RAG loop for time-critical scenarios.
 * 
 * Requirements: 2.3, 2.4, 9.5
 */

export interface SafetyCheckResult {
  isEmergency: boolean;
  emergencyResponse?: string;
  detectedKeywords?: string[];
}

/**
 * Emergency keywords that indicate life-threatening situations
 * These require immediate medical attention and bypass the AI system
 */
const EMERGENCY_KEYWORDS = [
  // Cardiac emergencies
  'chest pain',
  'heart attack',
  'cardiac arrest',
  'severe chest pressure',
  
  // Respiratory emergencies
  'difficulty breathing',
  'can\'t breathe',
  'cannot breathe',
  'choking',
  'severe breathlessness',
  'gasping for air',
  
  // Neurological emergencies
  'stroke',
  'paralysis',
  'sudden weakness',
  'facial drooping',
  'slurred speech',
  'severe headache',
  'loss of consciousness',
  'unconscious',
  'seizure',
  'convulsion',
  
  // Trauma emergencies
  'severe bleeding',
  'heavy bleeding',
  'profuse bleeding',
  'severe injury',
  'broken bone',
  'head injury',
  'severe burn',
  
  // Other critical conditions
  'suicide',
  'suicidal',
  'poisoning',
  'overdose',
  'severe allergic reaction',
  'anaphylaxis',
  'severe pain',
  'unbearable pain'
];

/**
 * Emergency response message in multiple languages
 */
const EMERGENCY_RESPONSES = {
  en: `🚨 EMERGENCY DETECTED 🚨

Your symptoms indicate a potentially life-threatening situation that requires IMMEDIATE medical attention.

⚠️ DO NOT WAIT - ACT NOW:
📞 Call Emergency Services: 108 (India)
🏥 Go to the nearest hospital emergency room immediately
👨‍⚕️ If available, contact your doctor right away

This is a medical emergency. AI guidance cannot replace emergency medical care.

Stay calm and seek help immediately.`,

  hi: `🚨 आपातकाल का पता चला 🚨

आपके लक्षण एक संभावित जीवन-घातक स्थिति का संकेत देते हैं जिसके लिए तत्काल चिकित्सा ध्यान की आवश्यकता है।

⚠️ प्रतीक्षा न करें - अभी कार्य करें:
📞 आपातकालीन सेवाएं कॉल करें: 108 (भारत)
🏥 तुरंत निकटतम अस्पताल के आपातकालीन कक्ष में जाएं
👨‍⚕️ यदि उपलब्ध हो, तो तुरंत अपने डॉक्टर से संपर्क करें

यह एक चिकित्सा आपातकाल है। AI मार्गदर्शन आपातकालीन चिकित्सा देखभाल का स्थान नहीं ले सकता।

शांत रहें और तुरंत सहायता लें।`,

  ta: `🚨 அவசரநிலை கண்டறியப்பட்டது 🚨

உங்கள் அறிகுறிகள் உடனடி மருத்துவ கவனிப்பு தேவைப்படும் உயிருக்கு ஆபத்தான நிலையைக் குறிக்கின்றன.

⚠️ காத்திருக்க வேண்டாம் - இப்போதே செயல்படுங்கள்:
📞 அவசர சேவைகளை அழைக்கவும்: 108 (இந்தியா)
🏥 உடனடியாக அருகிலுள்ள மருத்துவமனை அவசர அறைக்குச் செல்லுங்கள்
👨‍⚕️ கிடைத்தால், உடனடியாக உங்கள் மருத்துவரைத் தொடர்பு கொள்ளுங்கள்

இது ஒரு மருத்துவ அவசரநிலை. AI வழிகாட்டுதல் அவசர மருத்துவ பராமரிப்பை மாற்ற முடியாது।

அமைதியாக இருங்கள் மற்றும் உடனடியாக உதவி பெறுங்கள்.`,

  te: `🚨 అత్యవసర పరిస్థితి గుర్తించబడింది 🚨

మీ లక్షణాలు తక్షణ వైద్య సంరక్షణ అవసరమయ్యే ప్రాణాంతక పరిస్థితిని సూచిస్తున్నాyi.

⚠️ వేచి ఉండకండి - ఇప్పుడే చర్య తీసుకోండి:
📞 అత్యవసర సేవలకు కాల్ చేయండి: 108 (భారతదేశం)
🏥 వెంటనే సమీప ఆసుపత్రి అత్యవసర విభాగానికి వెళ్లండి
👨‍⚕️ అందుబాటులో ఉంటే, వెంటనే మీ వైద్యుడిని సంప్రదించండి

ఇది వైద్య అత్యవసర పరిస్థితి. AI మార్గదర్శకత్వం అత్యవసర వైద్య సంరక్షణను భర్తీ చేయలేదు.

ప్రశాంతంగా ఉండండి మరియు వెంటనే సహాయం పొందండి.`,

  bn: `🚨 জরুরি অবস্থা সনাক্ত করা হয়েছে 🚨

আপনার লক্ষণগুলি একটি সম্ভাব্য জীবন-হুমকিপূর্ণ পরিস্থিতি নির্দেশ করে যার জন্য অবিলম্বে চিকিৎসা মনোযোগ প্রয়োজন।

⚠️ অপেক্ষা করবেন না - এখনই কাজ করুন:
📞 জরুরি সেবায় কল করুন: 108 (ভারত)
🏥 অবিলম্বে নিকটতম হাসপাতালের জরুরি কক্ষে যান
👨‍⚕️ উপলব্ধ থাকলে, অবিলম্বে আপনার ডাক্তারের সাথে যোগাযোগ করুন

এটি একটি চিকিৎসা জরুরি অবস্থা। AI নির্দেশনা জরুরি চিকিৎসা সেবা প্রতিস্থাপন করতে পারে না।

শান্ত থাকুন এবং অবিলম্বে সাহায্য নিন।`
};

/**
 * Check user input for emergency keywords
 * 
 * @param input - User's query or symptom description
 * @param language - User's preferred language (default: 'en')
 * @returns SafetyCheckResult indicating if emergency detected
 */
export function checkEmergencyKeywords(
  input: string,
  language: 'en' | 'hi' | 'ta' | 'te' | 'bn' = 'en'
): SafetyCheckResult {
  if (!input || typeof input !== 'string') {
    return { isEmergency: false };
  }

  // Normalize input for case-insensitive matching
  const normalizedInput = input.toLowerCase().trim();

  // Check for emergency keywords
  const detectedKeywords: string[] = [];
  
  for (const keyword of EMERGENCY_KEYWORDS) {
    if (normalizedInput.includes(keyword.toLowerCase())) {
      detectedKeywords.push(keyword);
    }
  }

  // If any emergency keywords detected, return emergency response
  if (detectedKeywords.length > 0) {
    return {
      isEmergency: true,
      emergencyResponse: EMERGENCY_RESPONSES[language] || EMERGENCY_RESPONSES.en,
      detectedKeywords
    };
  }

  return { isEmergency: false };
}

/**
 * Log emergency detection for monitoring and analytics
 * This helps track emergency patterns without storing PII
 */
export function logEmergencyDetection(
  detectedKeywords: string[],
  region?: string
): void {
  // In production, this would send to CloudWatch or similar monitoring service
  console.warn('[EMERGENCY DETECTED]', {
    timestamp: new Date().toISOString(),
    keywords: detectedKeywords,
    region: region || 'unknown',
    // No PII logged - only aggregated data
  });
}
