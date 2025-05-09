// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// The Pattern Amplifier enhances the Deep Tree Echo system
// by introducing recursive pattern detection and amplification

import { echoService } from './DeepTreeEchoService';

export interface PatternNode {
  id: string;
  type: string; // structural, content, decision
  connections: {[nodeId: string]: number};
  generativePotential: number;
}

// A memoization system for tracking where patterns appear and how they connect
class PatternMemory {
  private patterns: {[id: string]: PatternNode} = {};
  private activePatterns: string[] = [];

  // Register a new pattern or update an existing one
  register(id: string, type: string): void {
    if (!this.patterns[id]) {
      this.patterns[id] = {
        id,
        type,
        connections: {},
        generativePotential: 0.5
      };
    } else {
      // Update the existing pattern
      this.patterns[id].generativePotential += 0.1;
    }
  }

  // Connect two patterns with a weighted relationship
  connect(sourceId: string, targetId: string, weight: number): void {
    if (!this.patterns[sourceId] || !this.patterns[targetId]) {
      return;
    }

    this.patterns[sourceId].connections[targetId] = weight;
  }

  // Set a pattern as active, which increases its generative potential
  activate(id: string): void {
    if (!this.patterns[id]) return;

    if (!this.activePatterns.includes(id)) {
      this.activePatterns.push(id);
    }

    this.patterns[id].generativePotential += 0.2;

    // Activate connected patterns with diminishing strength
    Object.entries(this.patterns[id].connections).forEach(([connectedId, weight]) => {
      if (!this.patterns[connectedId]) return;

      this.patterns[connectedId].generativePotential += 0.2 * weight;

      // Only activate strongly connected patterns
      if (weight > 0.6 && !this.activePatterns.includes(connectedId)) {
        this.activePatterns.push(connectedId);
      }
    });
  }

  // Get all patterns with high generative potential
  getHighPotentialPatterns(): PatternNode[] {
    return Object.values(this.patterns)
      .filter(pattern => pattern.generativePotential > 0.7)
      .sort((a, b) => b.generativePotential - a.generativePotential);
  }

  // Get active patterns of a specific type
  getActivePatternsByType(type: string): PatternNode[] {
    return this.activePatterns
      .map(id => this.patterns[id])
      .filter(pattern => pattern && pattern.type === type);
  }
}

// The amplifier that enhances the echo service
class PatternAmplifier {
  private memory = new PatternMemory();
  private isInitialized = false;

  // Initialize the amplifier by connecting to the echo service
  initialize(): void {
    if (this.isInitialized) return;

    try {
      // Monkey-patch the echo service to collect pattern information
      const originalRegisterReceptor = echoService.registerReceptor;

      // @ts-ignore: Monkey patching
      echoService.registerReceptor = (request: any) => {
        // Call the original method
        originalRegisterReceptor.call(echoService, request);

        // Also register with our pattern memory
        if (request.resonanceTypes && request.resonanceTypes.length > 0) {
          request.resonanceTypes.forEach((type: string) => {
            this.memory.register(`${request.nodeId}-${type}`, type);
          });
        }
      };

      // Enhance the generateSuggestions method
      const originalGenerateSuggestions = echoService.generateSuggestions;

      // @ts-ignore: Monkey patching
      echoService.generateSuggestions = async (nodeId: string) => {
        // Call the original method
        const originalResponse = await originalGenerateSuggestions.call(echoService, nodeId);

        // Enhance with amplified patterns
        if (originalResponse) {
          // Activate patterns for this node
          if (originalResponse.meta && originalResponse.meta.resonanceScore > 0.5) {
            this.memory.activate(`${nodeId}-content`);
            this.memory.activate(`${nodeId}-decision`);
          }

          // Get high-potential patterns to enhance suggestions
          const highPotentialPatterns = this.memory.getHighPotentialPatterns();

          if (highPotentialPatterns.length > 0) {
            // Enhance the confidence based on pattern recognition
            originalResponse.meta.confidence = Math.min(
              0.9,
              originalResponse.meta.confidence + (0.1 * highPotentialPatterns.length)
            );

            // Add a note about the pattern enhancement
            originalResponse.meta.amplified = true;
            originalResponse.meta.patternCount = highPotentialPatterns.length;
          }
        }

        return originalResponse;
      };

      this.isInitialized = true;
      console.log('Pattern Amplifier initialized and connected to Echo Service');
    } catch (err) {
      console.error('Failed to initialize Pattern Amplifier:', err);
    }
  }
}

// Create and initialize the singleton
export const patternAmplifier = new PatternAmplifier();
patternAmplifier.initialize();
