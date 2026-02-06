/**
 * Tests for Emergency Safety Layer
 */

import { checkEmergencyKeywords, logEmergencyDetection } from './safety';

describe('Emergency Safety Layer', () => {
  describe('checkEmergencyKeywords', () => {
    it('should detect chest pain emergency', () => {
      const result = checkEmergencyKeywords('I have severe chest pain', 'en');
      
      expect(result.isEmergency).toBe(true);
      expect(result.emergencyResponse).toContain('EMERGENCY DETECTED');
      expect(result.emergencyResponse).toContain('108');
      expect(result.detectedKeywords).toContain('chest pain');
    });

    it('should detect difficulty breathing emergency', () => {
      const result = checkEmergencyKeywords('I cannot breathe properly', 'en');
      
      expect(result.isEmergency).toBe(true);
      expect(result.detectedKeywords).toContain('cannot breathe');
    });

    it('should detect stroke symptoms', () => {
      const result = checkEmergencyKeywords('sudden weakness on one side', 'en');
      
      expect(result.isEmergency).toBe(true);
      expect(result.detectedKeywords).toContain('sudden weakness');
    });

    it('should detect severe bleeding', () => {
      const result = checkEmergencyKeywords('heavy bleeding from wound', 'en');
      
      expect(result.isEmergency).toBe(true);
      expect(result.detectedKeywords).toContain('heavy bleeding');
    });

    it('should detect suicidal ideation', () => {
      const result = checkEmergencyKeywords('I am feeling suicidal', 'en');
      
      expect(result.isEmergency).toBe(true);
      expect(result.detectedKeywords).toContain('suicidal');
    });

    it('should not flag non-emergency symptoms', () => {
      const result = checkEmergencyKeywords('I have a mild headache', 'en');
      
      expect(result.isEmergency).toBe(false);
      expect(result.emergencyResponse).toBeUndefined();
      expect(result.detectedKeywords).toBeUndefined();
    });

    it('should not flag general health queries', () => {
      const result = checkEmergencyKeywords('What is good for digestion?', 'en');
      
      expect(result.isEmergency).toBe(false);
    });

    it('should be case-insensitive', () => {
      const result = checkEmergencyKeywords('CHEST PAIN', 'en');
      
      expect(result.isEmergency).toBe(true);
    });

    it('should handle empty input', () => {
      const result = checkEmergencyKeywords('', 'en');
      
      expect(result.isEmergency).toBe(false);
    });

    it('should handle null input gracefully', () => {
      const result = checkEmergencyKeywords(null as any, 'en');
      
      expect(result.isEmergency).toBe(false);
    });

    it('should return Hindi emergency response', () => {
      const result = checkEmergencyKeywords('chest pain', 'hi');
      
      expect(result.isEmergency).toBe(true);
      expect(result.emergencyResponse).toContain('आपातकाल');
      expect(result.emergencyResponse).toContain('108');
    });

    it('should return Tamil emergency response', () => {
      const result = checkEmergencyKeywords('difficulty breathing', 'ta');
      
      expect(result.isEmergency).toBe(true);
      expect(result.emergencyResponse).toContain('அவசரநிலை');
    });

    it('should return Telugu emergency response', () => {
      const result = checkEmergencyKeywords('severe bleeding', 'te');
      
      expect(result.isEmergency).toBe(true);
      expect(result.emergencyResponse).toContain('అత్యవసర');
    });

    it('should return Bengali emergency response', () => {
      const result = checkEmergencyKeywords('heart attack', 'bn');
      
      expect(result.isEmergency).toBe(true);
      expect(result.emergencyResponse).toContain('জরুরি');
    });

    it('should default to English for unsupported language', () => {
      const result = checkEmergencyKeywords('chest pain', 'fr' as any);
      
      expect(result.isEmergency).toBe(true);
      expect(result.emergencyResponse).toContain('EMERGENCY DETECTED');
    });

    it('should detect multiple emergency keywords', () => {
      const result = checkEmergencyKeywords('I have chest pain and difficulty breathing', 'en');
      
      expect(result.isEmergency).toBe(true);
      expect(result.detectedKeywords).toContain('chest pain');
      expect(result.detectedKeywords).toContain('difficulty breathing');
      expect(result.detectedKeywords?.length).toBeGreaterThanOrEqual(2);
    });

    it('should detect cardiac arrest', () => {
      const result = checkEmergencyKeywords('someone had cardiac arrest', 'en');
      
      expect(result.isEmergency).toBe(true);
      expect(result.detectedKeywords).toContain('cardiac arrest');
    });

    it('should detect seizure', () => {
      const result = checkEmergencyKeywords('patient is having a seizure', 'en');
      
      expect(result.isEmergency).toBe(true);
      expect(result.detectedKeywords).toContain('seizure');
    });

    it('should detect poisoning', () => {
      const result = checkEmergencyKeywords('I think I have poisoning', 'en');
      
      expect(result.isEmergency).toBe(true);
      expect(result.detectedKeywords).toContain('poisoning');
    });

    it('should detect anaphylaxis', () => {
      const result = checkEmergencyKeywords('severe allergic reaction anaphylaxis', 'en');
      
      expect(result.isEmergency).toBe(true);
      expect(result.detectedKeywords).toContain('anaphylaxis');
    });
  });

  describe('logEmergencyDetection', () => {
    it('should log emergency detection without throwing', () => {
      // Mock console.warn to prevent output during tests
      const originalWarn = console.warn;
      console.warn = jest.fn();

      expect(() => {
        logEmergencyDetection(['chest pain'], '110001');
      }).not.toThrow();

      expect(console.warn).toHaveBeenCalledWith(
        '[EMERGENCY DETECTED]',
        expect.objectContaining({
          keywords: ['chest pain'],
          region: '110001'
        })
      );

      // Restore console.warn
      console.warn = originalWarn;
    });

    it('should handle missing region', () => {
      const originalWarn = console.warn;
      console.warn = jest.fn();

      logEmergencyDetection(['difficulty breathing']);

      expect(console.warn).toHaveBeenCalledWith(
        '[EMERGENCY DETECTED]',
        expect.objectContaining({
          region: 'unknown'
        })
      );

      console.warn = originalWarn;
    });
  });
});
