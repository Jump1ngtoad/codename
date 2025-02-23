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
  words: string[];  // The words available for constructing the sentence
  hint?: string;
}

export interface DraggableWordItem {
  id: string;
  content: string;
  isCorrect?: boolean;
}

export interface SentenceConstructionState {
  availableWords: DraggableWordItem[];
  constructedSentence: DraggableWordItem[];
  attemptCount: number;
  showHint: boolean;
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