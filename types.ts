
export interface PhotoState {
  file: File | null;
  preview: string | null;
}

export interface GenerationResult {
  imageUrl: string;
  prompt: string;
}

export enum LoadingStep {
  IDLE = 'IDLE',
  PROCESSING_IMAGES = 'PROCESSING_IMAGES',
  GENERATING_REUNION = 'GENERATING_REUNION',
  APPLYING_EDITS = 'APPLYING_EDITS',
  FINISHING = 'FINISHING'
}
