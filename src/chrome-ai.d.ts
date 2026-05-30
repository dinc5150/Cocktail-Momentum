export {};

declare global {
  var LanguageModel: {
    availability(options?: {
      expectedInputs?: Array<{ type: string; languages?: string[] }>;
      expectedOutputs?: Array<{ type: string; languages?: string[] }>;
    }): Promise<'unavailable' | 'downloadable' | 'downloading' | 'available'>;

    create(options?: {
      signal?: AbortSignal;
      initialPrompts?: ReadonlyArray<{
        role: 'system' | 'user' | 'assistant';
        content: string;
      }>;
      monitor?: (monitor: EventTarget) => void;
    }): Promise<LanguageModelSession>;
  };

  interface LanguageModelSession {
    promptStreaming(
      input: string,
      options?: { signal?: AbortSignal }
    ): AsyncIterable<string>;
    destroy(): void;
  }
}
