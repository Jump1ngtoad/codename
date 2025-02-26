export interface Module {
  id: string;
  title: string;
  description: string;
  type: 'flashcards' | 'sentence-completion' | 'puzzle';
  difficulty: 'easy' | 'hard';
  questions: (FlashcardQuestion | ImageFlashcardQuestion | SentenceQuestion | PuzzleQuestion)[];
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
}

export interface PuzzleQuestion {
  type: 'puzzle';
  prompt?: string;  // Making prompt optional since we'll rely on the image
  imagePath?: string;
  correctAnswer: string;
  englishTranslation: string;  // Adding English translation
  fragments: string[];  // The fragments available for constructing the story
  hint?: string;  // Hint is optional and won't be displayed in the UI
}

export interface DraggableWordItem {
  id: string;
  content: string;
  isCorrect?: boolean;
  isPartiallyCorrect?: boolean;
}

export interface SentenceConstructionState {
  availableWords: DraggableWordItem[];
  constructedSentence: DraggableWordItem[];
  attemptCount: number;
}

export interface ModuleManifest {
  modules: {
    id: string;
    title: string;
    description: string;
    type: 'flashcards' | 'sentence-completion' | 'puzzle';
    difficulty: 'easy' | 'hard';
  }[];
}

export interface UserProgress {
  completedModules: string[];
} 