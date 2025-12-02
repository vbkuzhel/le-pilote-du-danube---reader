export interface Chapter {
  id: number;
  original_title: string;
  modern_content: string;
}

export interface TranslationResponse {
  responseData: {
    translatedText: string;
  };
  responseStatus: number;
}
