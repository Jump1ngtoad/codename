export interface Module {
  id: string;
  title: string;
  description: string;
  type: 'flashcards' | 'sentence-completion';
  questions: (FlashcardQuestion | ImageFlashcardQuestion | SentenceQuestion)[];
}

export interface FlashcardQuestion {
  type: 'flashcards';
  variant: 'text';
  prompt: string;
  correctAnswer: string;
  options: string[];
}

export interface ImageFlashcardQuestion {
  type: 'flashcards';
  variant: 'image';
  imagePath: string;
  correctAnswer: string;
  options: string[];
}

export interface SentenceQuestion {
  type: 'sentence-completion';
  prompt: string;
  correctAnswer: string;
  hint?: string;
}

export interface ModuleManifest {
  modules: {
    id: string;
    title: string;
    description: string;
    type: 'flashcards' | 'sentence-completion';
  }[];
}

export interface UserProgress {
  completedModules: string[];
} 