import Tesseract from 'tesseract.js';

export interface OCRResult {
  text: string;
  confidence: number;
  isVerified: boolean;
}

export const OCRService = {
  /**
   * Process image and extract text
   */
  processImage: async (imageUrl: string): Promise<OCRResult> => {
    try {
      const result = await Tesseract.recognize(
        imageUrl,
        'eng',
        { logger: m => console.log(m) }
      );

      return {
        text: result.data.text,
        confidence: result.data.confidence,
        isVerified: false // To be determined by comparing with expected text
      };
    } catch (error) {
      console.error('OCR Error:', error);
      throw new Error('Failed to process image');
    }
  },

  /**
   * Verify if extracted text contains the expected username
   */
  verifyUsername: (extractedText: string, expectedUsername: string): boolean => {
    if (!extractedText || !expectedUsername) return false;
    
    // Normalize text: remove special chars, lowercase
    const normalizedText = extractedText.toLowerCase().replace(/[^a-z0-9]/g, '');
    const normalizedUsername = expectedUsername.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    return normalizedText.includes(normalizedUsername);
  }
};
