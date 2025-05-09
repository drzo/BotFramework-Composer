// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// LLMConnectorService - Connects the system to LLM providers
// This service manages all interactions with external LLM APIs
// and handles the transformation of dialog structures into prompts
// and back into structural suggestions

import { AdaptiveKinds } from '../constants/AdaptiveKinds';
import { EchoSuggestion, EchoPattern } from './DeepTreeEchoService';

// Supported LLM providers
export enum LLMProvider {
  AZURE_OPENAI = 'azure-openai',
  OPENAI = 'openai',
  LOCAL_MODEL = 'local-model',
  MOCK = 'mock' // For development/testing
}

export interface LLMRequestOptions {
  provider: LLMProvider;
  model: string;
  temperature?: number;
  maxTokens?: number;
  stopSequences?: string[];
  apiKey?: string;
  apiEndpoint?: string;
}

export interface LLMRequest {
  prompt: string;
  options: LLMRequestOptions;
  context?: any;
}

export interface LLMResponse {
  completion: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model?: string;
}

// Default options for LLM requests
const DEFAULT_OPTIONS: LLMRequestOptions = {
  provider: LLMProvider.MOCK, // Default to mock for safety
  model: 'gpt-4',
  temperature: 0.7,
  maxTokens: 1000
};

// Singleton class for LLM interactions
class LLMConnectorService {
  private options: LLMRequestOptions = DEFAULT_OPTIONS;
  private mockExamples: Map<string, EchoSuggestion[]> = new Map();

  constructor() {
    this.initializeMockExamples();
  }

  // Initialize with connection options
  setOptions(options: Partial<LLMRequestOptions>): void {
    this.options = { ...this.options, ...options };
  }

  // Complete a prompt using the configured LLM
  async completePrompt(request: Partial<LLMRequest>): Promise<LLMResponse> {
    const fullRequest: LLMRequest = {
      prompt: request.prompt || '',
      options: { ...this.options, ...request.options },
      context: request.context
    };

    // Route to the appropriate provider
    switch (fullRequest.options.provider) {
      case LLMProvider.AZURE_OPENAI:
        return this.completeWithAzureOpenAI(fullRequest);
      case LLMProvider.OPENAI:
        return this.completeWithOpenAI(fullRequest);
      case LLMProvider.LOCAL_MODEL:
        return this.completeWithLocalModel(fullRequest);
      case LLMProvider.MOCK:
      default:
        return this.completeWithMock(fullRequest);
    }
  }

  // Generate dialog suggestions based on context
  async generateDialogSuggestions(dialogData: any, context: string): Promise<EchoSuggestion[]> {
    const kind = dialogData.$kind || '';

    // For mock mode, return preconfigured examples if available
    if (this.options.provider === LLMProvider.MOCK) {
      return this.getMockSuggestionsForKind(kind) || [];
    }

    // For real LLM interactions, generate a prompt based on the dialog data
    const prompt = this.generatePromptFromDialog(dialogData, kind, context);

    // Send the prompt to the LLM
    const response = await this.completePrompt({
      prompt,
      context: { dialogData, kind, context }
    });

    // Parse the response into suggestions
    return this.parseSuggestionsFromCompletion(response.completion, kind);
  }

  // Generate patterns from dialog data
  async generatePatterns(dialogData: any[], context: string): Promise<EchoPattern[]> {
    if (this.options.provider === LLMProvider.MOCK) {
      return this.getMockPatterns();
    }

    // For real LLM interactions, we would analyze the dialog corpus
    const prompt = this.generatePromptForPatternAnalysis(dialogData, context);

    const response = await this.completePrompt({
      prompt,
      context: { dialogData, context }
    });

    return this.parsePatternsFromCompletion(response.completion);
  }

  // Private methods for different providers
  private async completeWithAzureOpenAI(request: LLMRequest): Promise<LLMResponse> {
    try {
      // In a real implementation, this would make an API call to Azure OpenAI
      console.warn('Azure OpenAI integration not yet implemented');
      return this.completeWithMock(request);
    } catch (error) {
      console.error('Error calling Azure OpenAI:', error);
      return { completion: 'Error: Unable to complete with Azure OpenAI' };
    }
  }

  private async completeWithOpenAI(request: LLMRequest): Promise<LLMResponse> {
    try {
      // In a real implementation, this would make an API call to OpenAI
      console.warn('OpenAI integration not yet implemented');
      return this.completeWithMock(request);
    } catch (error) {
      console.error('Error calling OpenAI:', error);
      return { completion: 'Error: Unable to complete with OpenAI' };
    }
  }

  private async completeWithLocalModel(request: LLMRequest): Promise<LLMResponse> {
    try {
      // In a real implementation, this would use a local model
      console.warn('Local model integration not yet implemented');
      return this.completeWithMock(request);
    } catch (error) {
      console.error('Error using local model:', error);
      return { completion: 'Error: Unable to complete with local model' };
    }
  }

  private async completeWithMock(request: LLMRequest): Promise<LLMResponse> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    const { context } = request;
    const dialogKind = context?.dialogData?.$kind || '';

    // Get mock suggestions for this kind
    const suggestions = this.getMockSuggestionsForKind(dialogKind);

    // Serialize to a completion string
    const completion = suggestions
      ? JSON.stringify(suggestions, null, 2)
      : JSON.stringify([
          {
            type: 'enhancement',
            content: {
              suggestion: 'This is a mock completion response for ' + dialogKind
            },
            confidence: 0.85,
            description: 'Mock suggestion'
          }
        ], null, 2);

    return {
      completion,
      usage: {
        promptTokens: request.prompt.length / 4,
        completionTokens: completion.length / 4,
        totalTokens: (request.prompt.length + completion.length) / 4
      },
      model: 'mock-gpt-4'
    };
  }

  // Prompt generation logic
  private generatePromptFromDialog(dialogData: any, kind: string, context: string): string {
    return `
You are an expert in Microsoft Bot Framework dialog authoring.
Below is a dialog node from a bot conversation flow.
Dialog kind: ${kind}
Dialog data: ${JSON.stringify(dialogData, null, 2)}
Context: ${context}

Generate 2-3 improvements, alternatives, or enhancements for this dialog node.
Format your response as a JSON array of suggestion objects with the following structure:
[
  {
    "type": "enhancement" | "alternative" | "completion" | "branch",
    "content": { object with suggested changes },
    "confidence": number between 0 and 1,
    "description": "Short description of the suggestion"
  }
]
    `;
  }

  private generatePromptForPatternAnalysis(dialogData: any[], context: string): string {
    return `
You are an expert in Microsoft Bot Framework dialog authoring.
Below is a collection of dialog nodes from a bot conversation flow.
Dialog data: ${JSON.stringify(dialogData.slice(0, 3), null, 2)}
Context: ${context}

Analyze these dialogs and identify common patterns that could be improved or enhanced.
Format your response as a JSON array of pattern objects with the following structure:
[
  {
    "name": "pattern name",
    "frequency": number between 0 and 1,
    "dialogPaths": ["path1", "path2", ...]
  }
]
    `;
  }

  // Response parsing logic
  private parseSuggestionsFromCompletion(completion: string, kind: string): EchoSuggestion[] {
    try {
      // Try to parse JSON from the completion
      const parsed = JSON.parse(completion);

      if (Array.isArray(parsed)) {
        return parsed.map(suggestion => {
          // Validate and normalize the suggestion
          return {
            type: suggestion.type || 'enhancement',
            content: suggestion.content || {},
            confidence: suggestion.confidence || 0.5,
            description: suggestion.description || 'Generated suggestion'
          };
        });
      }

      // If not an array, construct a single suggestion
      return [{
        type: 'enhancement',
        content: parsed,
        confidence: 0.5,
        description: 'Generated suggestion'
      }];

    } catch (error) {
      console.error('Error parsing LLM completion:', error);
      // Return a fallback suggestion
      return [{
        type: 'enhancement',
        content: {
          suggestion: completion
        },
        confidence: 0.3,
        description: 'Unparseable suggestion (fallback)'
      }];
    }
  }

  private parsePatternsFromCompletion(completion: string): EchoPattern[] {
    try {
      // Try to parse JSON from the completion
      const parsed = JSON.parse(completion);

      if (Array.isArray(parsed)) {
        return parsed.map(pattern => {
          // Validate and normalize the pattern
          return {
            name: pattern.name || 'Unknown pattern',
            frequency: pattern.frequency || 0.5,
            dialogPaths: pattern.dialogPaths || []
          };
        });
      }

      return [];

    } catch (error) {
      console.error('Error parsing LLM completion for patterns:', error);
      return [];
    }
  }

  // Initialize mock examples for testing
  private initializeMockExamples(): void {
    // TextInput examples
    this.mockExamples.set(AdaptiveKinds.TextInput, [
      {
        type: 'enhancement',
        content: {
          rephrasing: "May I ask what your {property} is?",
          variations: [
            "What's your {property}, if I may ask?",
            "Could you share your {property} with me?",
            "I'd like to know your {property}."
          ]
        },
        confidence: 0.88,
        description: 'More conversational phrasing options'
      },
      {
        type: 'completion',
        content: {
          invalidPrompt: "I'm having trouble understanding your {property}. Could you try again?",
          validations: [
            {
              $kind: AdaptiveKinds.OnIntent,
              intent: "Help",
              actions: [
                {
                  $kind: AdaptiveKinds.SendActivity,
                  activity: "To provide your {property}, simply type it in. For example: 'My {property} is...'"
                }
              ]
            }
          ]
        },
        confidence: 0.72,
        description: 'Add validation and help responses'
      }
    ]);

    // IfCondition examples
    this.mockExamples.set(AdaptiveKinds.IfCondition, [
      {
        type: 'alternative',
        content: {
          switchCondition: {
            $kind: AdaptiveKinds.SwitchCondition,
            condition: "dialog.result",
            cases: [
              { value: "true", actions: [] },
              { value: "false", actions: [] }
            ],
            default: [
              {
                $kind: AdaptiveKinds.SendActivity,
                activity: "I'm not sure how to proceed."
              }
            ]
          }
        },
        confidence: 0.65,
        description: 'Convert to Switch condition with default case'
      },
      {
        type: 'enhancement',
        content: {
          elseActions: [
            {
              $kind: AdaptiveKinds.SendActivity,
              activity: "I'll need more information before we can continue."
            }
          ]
        },
        confidence: 0.85,
        description: 'Add explicit else action for clarity'
      }
    ]);

    // SendActivity examples
    this.mockExamples.set(AdaptiveKinds.SendActivity, [
      {
        type: 'enhancement',
        content: {
          variations: [
            "Here's what I found for you.",
            "I've found this information.",
            "Based on your request, here's what I have.",
            "This is what I discovered."
          ]
        },
        confidence: 0.82,
        description: 'Add response variations for natural conversation'
      },
      {
        type: 'enhancement',
        content: {
          enrich: {
            $kind: AdaptiveKinds.SetProperty,
            property: "conversation.lastResponse",
            value: "=turn.activity.text"
          }
        },
        confidence: 0.68,
        description: 'Track responses for conversation history'
      }
    ]);
  }

  // Get mock suggestions for a specific kind
  private getMockSuggestionsForKind(kind: string): EchoSuggestion[] | undefined {
    return this.mockExamples.get(kind);
  }

  // Get mock patterns
  private getMockPatterns(): EchoPattern[] {
    return [
      {
        name: 'multi-turn-question',
        frequency: 0.75,
        dialogPaths: ['TextInput', 'IfCondition', 'SendActivity']
      },
      {
        name: 'clarification-request',
        frequency: 0.62,
        dialogPaths: ['SendActivity', 'TextInput', 'TextInput']
      },
      {
        name: 'confirmation-pattern',
        frequency: 0.88,
        dialogPaths: ['SendActivity', 'ConfirmInput', 'IfCondition']
      }
    ];
  }
}

// Singleton instance
export const llmConnector = new LLMConnectorService();
