export interface Chapter {
  number: number;
  title: string;
  text: string;
}

export interface TranslationResponse {
  responseData: {
    translatedText: string;
  };
  responseStatus: number;
}
