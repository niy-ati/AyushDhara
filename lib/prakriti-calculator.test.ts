/**
 * Tests for Prakriti Calculator
 */

import { calculatePrakriti, createQuizAnswer } from './prakriti-calculator';
import { QuizAnswer } from '../types';
import * as fc from 'fast-check';

describe('Prakriti Calculator', () => {
  describe('calculatePrakriti', () => {
    it('should calculate Vata-dominant profile correctly', () => {
      const answers: QuizAnswer[] = [
        createQuizAnswer(1, 5, 1.0, 0.2, 0.1),
        createQuizAnswer(2, 4, 1.0, 0.3, 0.2),
        createQuizAnswer(3, 5, 1.0, 0.1, 0.1),
      ];

      const profile = calculatePrakriti('user-123', answers);

      expect(profile.userId).toBe('user-123');
      expect(profile.dominant).toBe('vata');
      expect(profile.scores.vata).toBeGreaterThan(profile.scores.pitta);
      expect(profile.scores.vata).toBeGreaterThan(profile.scores.kapha);
      expect(profile.assessmentDate).toBeDefined();
    });

    it('should calculate Pitta-dominant profile correctly', () => {
      const answers: QuizAnswer[] = [
        createQuizAnswer(1, 5, 0.2, 1.0, 0.1),
        createQuizAnswer(2, 4, 0.3, 1.0, 0.2),
        createQuizAnswer(3, 5, 0.1, 1.0, 0.1),
      ];

      const profile = calculatePrakriti('user-456', answers);

      expect(profile.dominant).toBe('pitta');
      expect(profile.scores.pitta).toBeGreaterThan(profile.scores.vata);
      expect(profile.scores.pitta).toBeGreaterThan(profile.scores.kapha);
    });

    it('should calculate Kapha-dominant profile correctly', () => {
      const answers: QuizAnswer[] = [
        createQuizAnswer(1, 5, 0.1, 0.2, 1.0),
        createQuizAnswer(2, 4, 0.2, 0.3, 1.0),
        createQuizAnswer(3, 5, 0.1, 0.1, 1.0),
      ];

      const profile = calculatePrakriti('user-789', answers);

      expect(profile.dominant).toBe('kapha');
      expect(profile.scores.kapha).toBeGreaterThan(profile.scores.vata);
      expect(profile.scores.kapha).toBeGreaterThan(profile.scores.pitta);
    });

    it('should detect balanced constitution', () => {
      const answers: QuizAnswer[] = [
        createQuizAnswer(1, 3, 1.0, 1.0, 1.0),
        createQuizAnswer(2, 3, 1.0, 1.0, 1.0),
        createQuizAnswer(3, 3, 1.0, 1.0, 1.0),
      ];

      const profile = calculatePrakriti('user-balanced', answers);

      expect(profile.dominant).toBe('balanced');
      expect(profile.secondary).toBeUndefined();
    });

    it('should identify secondary dosha when close to dominant', () => {
      const answers: QuizAnswer[] = [
        createQuizAnswer(1, 5, 1.0, 0.9, 0.2),
        createQuizAnswer(2, 4, 1.0, 0.85, 0.3),
        createQuizAnswer(3, 5, 1.0, 0.9, 0.1),
      ];

      const profile = calculatePrakriti('user-secondary', answers);

      expect(profile.dominant).toBe('vata');
      expect(profile.secondary).toBe('pitta');
    });

    it('should normalize scores to 0-100 scale', () => {
      const answers: QuizAnswer[] = [
        createQuizAnswer(1, 5, 1.0, 0.5, 0.3),
      ];

      const profile = calculatePrakriti('user-normalize', answers);

      expect(profile.scores.vata).toBe(100);
      expect(profile.scores.pitta).toBeLessThanOrEqual(100);
      expect(profile.scores.kapha).toBeLessThanOrEqual(100);
    });

    it('should throw error for empty userId', () => {
      const answers: QuizAnswer[] = [createQuizAnswer(1, 3, 1, 1, 1)];

      expect(() => calculatePrakriti('', answers)).toThrow('userId is required');
    });

    it('should throw error for empty answers array', () => {
      expect(() => calculatePrakriti('user-123', [])).toThrow('At least one answer is required');
    });

    it('should throw error for invalid answer value', () => {
      const answers: QuizAnswer[] = [
        createQuizAnswer(1, 6, 1, 1, 1), // Invalid: > 5
      ];

      expect(() => calculatePrakriti('user-123', answers)).toThrow('Invalid answer value');
    });

    it('should handle edge case of all zero weights', () => {
      const answers: QuizAnswer[] = [
        createQuizAnswer(1, 5, 0, 0, 0),
        createQuizAnswer(2, 4, 0, 0, 0),
      ];

      const profile = calculatePrakriti('user-zero', answers);

      // Should return balanced when all scores are zero
      expect(profile.scores.vata).toBeCloseTo(33.33, 1);
      expect(profile.scores.pitta).toBeCloseTo(33.33, 1);
      expect(profile.scores.kapha).toBeCloseTo(33.33, 1);
    });
  });

  describe('createQuizAnswer', () => {
    it('should create quiz answer with default weights', () => {
      const answer = createQuizAnswer(1, 3);

      expect(answer.questionId).toBe(1);
      expect(answer.answer).toBe(3);
      expect(answer.doshaWeights.vata).toBe(1);
      expect(answer.doshaWeights.pitta).toBe(1);
      expect(answer.doshaWeights.kapha).toBe(1);
    });

    it('should create quiz answer with custom weights', () => {
      const answer = createQuizAnswer(2, 4, 0.8, 0.5, 0.3);

      expect(answer.questionId).toBe(2);
      expect(answer.answer).toBe(4);
      expect(answer.doshaWeights.vata).toBe(0.8);
      expect(answer.doshaWeights.pitta).toBe(0.5);
      expect(answer.doshaWeights.kapha).toBe(0.3);
    });
  });

  /**
   * Property-Based Tests
   * Feature: ayushdhara-ai, Property 1: Prakriti Assessment Consistency
   * Validates: Requirements 1.3, 1.4
   */
  describe('Property-Based Tests', () => {
    it('Feature: ayushdhara-ai, Property 1: Prakriti assessment consistency', () => {
      // Arbitrary generator for quiz answers
      const quizAnswerArbitrary = fc.record({
        questionId: fc.integer({ min: 1, max: 50 }),
        answer: fc.integer({ min: 1, max: 5 }),
        doshaWeights: fc.record({
          vata: fc.float({ min: 0, max: 1, noNaN: true }),
          pitta: fc.float({ min: 0, max: 1, noNaN: true }),
          kapha: fc.float({ min: 0, max: 1, noNaN: true })
        })
      });

      // Generate array of 1-20 quiz answers
      const answersArrayArbitrary = fc.array(quizAnswerArbitrary, { minLength: 1, maxLength: 20 });

      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }), // userId
          answersArrayArbitrary,
          (userId, answers) => {
            // Calculate Prakriti twice with the same inputs
            const result1 = calculatePrakriti(userId, answers);
            const result2 = calculatePrakriti(userId, answers);

            // Verify consistency: same inputs should produce identical outputs
            expect(result1.userId).toBe(result2.userId);
            expect(result1.scores.vata).toBe(result2.scores.vata);
            expect(result1.scores.pitta).toBe(result2.scores.pitta);
            expect(result1.scores.kapha).toBe(result2.scores.kapha);
            expect(result1.dominant).toBe(result2.dominant);
            expect(result1.secondary).toBe(result2.secondary);

            // Additional invariants
            // All scores should be between 0 and 100
            expect(result1.scores.vata).toBeGreaterThanOrEqual(0);
            expect(result1.scores.vata).toBeLessThanOrEqual(100);
            expect(result1.scores.pitta).toBeGreaterThanOrEqual(0);
            expect(result1.scores.pitta).toBeLessThanOrEqual(100);
            expect(result1.scores.kapha).toBeGreaterThanOrEqual(0);
            expect(result1.scores.kapha).toBeLessThanOrEqual(100);

            // Dominant dosha should have the highest or equal score (unless balanced)
            if (result1.dominant !== 'balanced') {
              const dominantScore = result1.scores[result1.dominant];
              expect(dominantScore).toBeGreaterThanOrEqual(result1.scores.vata);
              expect(dominantScore).toBeGreaterThanOrEqual(result1.scores.pitta);
              expect(dominantScore).toBeGreaterThanOrEqual(result1.scores.kapha);
            }

            // If there's a secondary dosha, it should be different from dominant
            if (result1.secondary) {
              expect(result1.secondary).not.toBe(result1.dominant);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
