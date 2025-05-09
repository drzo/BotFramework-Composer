// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// The Echo Resonance Amplification Network allows resonance points
// to communicate with each other, creating a network of interconnected
// generative suggestion points that influence each other

import { EchoPatternNode } from '../transformers/transformEchoReceptor';

// Resonance links create "neural pathways" between echo points
interface ResonanceLink {
  sourceId: string;
  targetId: string;
  strength: number;
  pathway: string; // The semantic relationship between points
}

// The network itself manages connections between echo points
export class EchoResonanceNetwork {
  private resonanceLinks: ResonanceLink[] = [];
  private nodeRegistry = new Map<string, EchoPatternNode>();

  // A quantum-inspired property that determines how strongly
  // nodes influence each other
  private entanglementFactor = 0.5;

  // Register a node in the network
  registerNode(node: EchoPatternNode): void {
    this.nodeRegistry.set(node.id, node);

    // When a new node is added, check for potential connections
    this.discoverResonanceLinks(node);
  }

  // Remove a node from the network
  unregisterNode(nodeId: string): void {
    this.nodeRegistry.delete(nodeId);

    // Remove any links connected to this node
    this.resonanceLinks = this.resonanceLinks.filter(
      link => link.sourceId !== nodeId && link.targetId !== nodeId
    );
  }

  // Find potential connections between this node and existing nodes
  private discoverResonanceLinks(node: EchoPatternNode): void {
    const { id, echoFrequency, echoDepth } = node;

    // Don't create links for nodes without frequency information
    if (!echoFrequency) return;

    // Check each existing node for potential connections
    this.nodeRegistry.forEach((existingNode, existingId) => {
      if (id === existingId || !existingNode.echoFrequency) return;

      // Calculate resonance similarity based on frequency patterns
      const resonanceSimilarity = this.calculateResonanceCompatibility(
        echoFrequency,
        existingNode.echoFrequency
      );

      // Only create links with sufficient resonance
      if (resonanceSimilarity > 0.3) {
        const newLink: ResonanceLink = {
          sourceId: id,
          targetId: existingId,
          strength: resonanceSimilarity * this.entanglementFactor,
          pathway: this.determinePathway(node, existingNode)
        };

        this.resonanceLinks.push(newLink);

        console.log(`Resonance link created: ${id} -> ${existingId} (${newLink.pathway})`);
      }
    });
  }

  // Calculate how compatible two echo frequencies are
  private calculateResonanceCompatibility(frequency1: string, frequency2: string): number {
    // Split the frequency strings into components
    const components1 = frequency1.split('.');
    const components2 = frequency2.split('.');

    // Count shared components
    const sharedComponents = components1.filter(c => components2.includes(c));

    // Calculate similarity ratio
    const similarity = sharedComponents.length /
      Math.max(components1.length, components2.length);

    return similarity;
  }

  // Determine the semantic relationship between two nodes
  private determinePathway(source: EchoPatternNode, target: EchoPatternNode): string {
    const sourceFreq = source.echoFrequency?.split('.') || [];
    const targetFreq = target.echoFrequency?.split('.') || [];

    // Check for common pattern types
    if (sourceFreq.includes('structural') && targetFreq.includes('content')) {
      return 'structure-to-content';
    }
    if (sourceFreq.includes('content') && targetFreq.includes('decision')) {
      return 'content-to-decision';
    }
    if (sourceFreq.includes('decision') && targetFreq.includes('structural')) {
      return 'decision-to-structure';
    }

    // Default to generic connection
    return 'associative';
  }

  // Get all nodes that influence a specific node
  getInfluencingNodes(nodeId: string): Array<{node: EchoPatternNode, influence: number}> {
    // Find all links where this node is the target
    const incomingLinks = this.resonanceLinks.filter(link => link.targetId === nodeId);

    // Map to node and influence level
    return incomingLinks.map(link => {
      const node = this.nodeRegistry.get(link.sourceId);
      if (!node) return null;

      return {
        node,
        influence: link.strength
      };
    }).filter(item => item !== null) as Array<{node: EchoPatternNode, influence: number}>;
  }

  // Propagate an activation through the network
  propagateActivation(sourceNodeId: string, activationStrength = 1.0): Map<string, number> {
    const activationLevels = new Map<string, number>();

    // Set initial activation
    activationLevels.set(sourceNodeId, activationStrength);

    // Find all outgoing links
    const outgoingLinks = this.resonanceLinks.filter(link => link.sourceId === sourceNodeId);

    // Propagate to first-degree connections
    outgoingLinks.forEach(link => {
      const targetActivation = activationStrength * link.strength;
      activationLevels.set(link.targetId, targetActivation);

      // Secondary propagation (limited to prevent explosion)
      const secondaryLinks = this.resonanceLinks.filter(
        l => l.sourceId === link.targetId && l.targetId !== sourceNodeId
      );

      secondaryLinks.forEach(secondLink => {
        const secondActivation = targetActivation * secondLink.strength * 0.5;

        // Only propagate if activation is meaningful
        if (secondActivation > 0.1) {
          activationLevels.set(secondLink.targetId, secondActivation);
        }
      });
    });

    return activationLevels;
  }
}

// Singleton instance
export const resonanceNetwork = new EchoResonanceNetwork();
