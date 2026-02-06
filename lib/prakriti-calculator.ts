/**
 * Prakriti Calculation Algorithm
 * 
 * This module implements the core logic for calculating a user's Ayurvedic constitution
 * (Prakriti) based on quiz answers. The algorithm scores three doshas (Vata, Pitta, Kapha)
 * and determines dominant and secondary doshas.
 */

import { 
  QuizAnswer, 
  PrakritiProfile, 
  PrakritiScores, 
  DoshaType 
} from '../types';

/**
 * Calculate Prakriti profile from quiz answers
 * 
 * @param userId - User identifier
 * @param answers - Array of quiz answers with dosha weights
 * @returns PrakritiProfile with scores and dominant/secondary doshas
 * 
 * Requirements: 1.3, 1.4
 */
export function calculatePrakriti(
  userId: string,
  answers: QuizAnswer[]
): PrakritiProfile {
  // Validate input
  if (!userId || userId.trim() === '') {
    throw new Error('userId is required');
  }
  
  if (!answers || answers.length === 0) {
    throw new Error('At least one answer is required');
  }

  // Calculate raw scores by summing weighted answers
  const rawScores = calculateRawScores(answers);
  
  // Normalize scores to 0-100 scale
  const normalizedScores = normalizeScores(rawScores);
  
  // Determine dominant and secondary doshas
  const { dominant, secondary } = determineDoshas(normalizedScores);
  
  return {
    userId,
    scores: normalizedScores,
    dominant,
    secondary,
    assessmentDate: new Date().toISOString()
  };
}

/**
 * Calculate raw scores by summing weighted answers
 */
function calculateRawScores(answers: QuizAnswer[]): PrakritiScores {
  const scores: PrakritiScores = {
    vata: 0,
    pitta: 0,
    kapha: 0
  };

  for (const answer of answers) {
    // Validate answer value is in range 1-5
    if (answer.answer < 1 || answer.answer > 5) {
      throw new Error(`Invalid answer value: ${answer.answer}. Must be between 1 and 5.`);
    }

    // Multiply answer value by dosha weights and accumulate
    scores.vata += answer.answer * answer.doshaWeights.vata;
    scores.pitta += answer.answer * answer.doshaWeights.pitta;
    scores.kapha += answer.answer * answer.doshaWeights.kapha;
  }

  return scores;
}

/**
 * Normalize scores to 0-100 scale
 */
function normalizeScores(rawScores: PrakritiScores): PrakritiScores {
  // Find the maximum score to use as normalization factor
  const maxScore = Math.max(rawScores.vata, rawScores.pitta, rawScores.kapha);
  
  // Handle edge case where all scores are zero
  if (maxScore === 0) {
    return {
      vata: 33.33,
      pitta: 33.33,
      kapha: 33.33
    };
  }

  // Normalize each score to 0-100 scale
  return {
    vata: Math.round((rawScores.vata / maxScore) * 100 * 100) / 100,
    pitta: Math.round((rawScores.pitta / maxScore) * 100 * 100) / 100,
    kapha: Math.round((rawScores.kapha / maxScore) * 100 * 100) / 100
  };
}

/**
 * Determine dominant and secondary doshas based on scores
 */
function determineDoshas(scores: PrakritiScores): {
  dominant: DoshaType;
  secondary?: DoshaType;
} {
  // Create array of [dosha, score] pairs for sorting
  const doshaScores: Array<[DoshaType, number]> = [
    ['vata', scores.vata],
    ['pitta', scores.pitta],
    ['kapha', scores.kapha]
  ];

  // Sort by score descending
  doshaScores.sort((a, b) => b[1] - a[1]);

  const [firstDosha, firstScore] = doshaScores[0];
  const [secondDosha, secondScore] = doshaScores[1];
  const [, thirdScore] = doshaScores[2];

  // Check if balanced (all scores within 10% of each other)
  const scoreRange = firstScore - thirdScore;
  const isBalanced = scoreRange <= 10;

  if (isBalanced) {
    return {
      dominant: 'balanced',
      secondary: undefined
    };
  }

  // Check if there's a clear secondary dosha (within 15% of dominant)
  const hasSecondary = (firstScore - secondScore) <= 15 && secondScore > thirdScore;

  return {
    dominant: firstDosha,
    secondary: hasSecondary ? secondDosha : undefined
  };
}

/**
 * Helper function to create quiz answer with weights
 * Useful for testing and quiz construction
 */
export function createQuizAnswer(
  questionId: number,
  answer: number,
  vataWeight: number = 1,
  pittaWeight: number = 1,
  kaphaWeight: number = 1
): QuizAnswer {
  return {
    questionId,
    answer,
    doshaWeights: {
      vata: vataWeight,
      pitta: pittaWeight,
      kapha: kaphaWeight
    }
  };
}
