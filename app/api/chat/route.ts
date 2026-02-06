/**
 * Chat API Route
 * 
 * Handles user health queries with emergency safety checks and RAG-based responses
 * 
 * Requirements: 2.1, 2.2, 2.3, 3.1, 8.1
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkEmergencyKeywords, logEmergencyDetection } from '@/lib/safety';
import type { QueryRequest, QueryResponse, SupportedLanguage } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: QueryRequest = await request.json();
    const { userId, query, language, location } = body;

    // Validate required fields
    if (!userId || !query) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'INVALID_REQUEST', 
            message: 'userId and query are required' 
          } 
        },
        { status: 400 }
      );
    }

    // CRITICAL: Emergency Safety Check - Bypass RAG for life-threatening situations
    const safetyCheck = checkEmergencyKeywords(query, language as any);
    
    if (safetyCheck.isEmergency) {
      // Log emergency detection for monitoring (no PII)
      logEmergencyDetection(
        safetyCheck.detectedKeywords || [],
        location?.pincode
      );

      // Return immediate emergency response
      return NextResponse.json({
        success: true,
        data: {
          response: safetyCheck.emergencyResponse,
          sources: ['Emergency Safety Protocol'],
          confidence: 1.0,
          isEmergency: true
        } as QueryResponse
      });
    }

    // TODO: Implement Bedrock RAG query logic
    // For now, return a placeholder response
    const response: QueryResponse = {
      response: 'This is a placeholder response. Bedrock RAG integration pending.',
      sources: ['Placeholder'],
      confidence: 0.5
    };

    return NextResponse.json({
      success: true,
      data: response
    });

  } catch (error) {
    console.error('[Chat API Error]', error);
    
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred processing your request'
        }
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({}, { status: 200 });
}
