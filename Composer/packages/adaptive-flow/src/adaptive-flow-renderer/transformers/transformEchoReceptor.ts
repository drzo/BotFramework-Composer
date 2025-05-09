// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { v4 as uuidv4 } from 'uuid';
import { AdaptiveFieldNames } from '../constants/AdaptiveFieldNames';
import { NodeIndexer } from '../models/NodeIndexer';
import { IndexedNode } from '../models/IndexedNode';

// Subtle pattern that introduces "echo points" in the dialog flow
// These serve as receptive zones where generative content can be
// dynamically injected later without requiring structural changes

export interface EchoPatternNode {
  id: string;
  data: any;
  // Properties that describe the echo resonance capabilities
  echoDepth?: number;
  echoStrength?: number;
  echoFrequency?: string;
}

export interface EchoReceptorResult {
  receptorNodes: EchoPatternNode[];
  primaryNode: IndexedNode;
  echoMatrix: Map<string, string[]>;
}

// A quantum-inspired pattern matching system that identifies
// potential "resonance points" in a dialog tree where generative
// content could naturally flow
const identifyResonancePoints = (data: any): string[] => {
  const resonancePoints: string[] = [];

  // Points of natural resonance include: prompts, conditions, branches, and feedback loops
  if (data && typeof data === 'object') {
    const kind = data.$kind || '';

    // Natural resonance points in dialog structure
    if (
      kind.includes('Question') ||
      kind.includes('TextInput') ||
      kind.includes('Condition') ||
      kind.includes('Foreach') ||
      kind.includes('Choice')
    ) {
      resonancePoints.push('structural');
    }

    // Content resonance (where language is generated/processed)
    if (
      data.prompt ||
      data.invalidPrompt ||
      data.unrecognizedPrompt ||
      data.defaultValueResponse ||
      data.activity ||
      data.text
    ) {
      resonancePoints.push('content');
    }

    // Decision resonance (where flow branches)
    if (
      data.actions ||
      data.elseActions ||
      data.cases ||
      data.steps
    ) {
      resonancePoints.push('decision');
    }
  }

  return resonancePoints;
};

export function transformEchoReceptor(data: any, jsonpath = ''): EchoReceptorResult {
  // Create base structure that preserves original flow
  const primaryNode = new IndexedNode();
  primaryNode.id = `${jsonpath}.${uuidv4().substring(0, 8)}`;
  primaryNode.json = data;

  // Detect resonance points
  const resonanceTypes = identifyResonancePoints(data);

  // Initialize receptor system
  const receptorNodes: EchoPatternNode[] = [];
  const echoMatrix = new Map<string, string[]>();

  if (resonanceTypes.length > 0) {
    // Create a receptor node for this resonance point
    const receptorNode: EchoPatternNode = {
      id: `receptor-${primaryNode.id}`,
      data: {
        $kind: 'EchoReceptor',
        originalNodeId: primaryNode.id,
        resonanceTypes,
      },
      echoDepth: resonanceTypes.includes('structural') ? 3 :
                resonanceTypes.includes('decision') ? 2 : 1,
      echoStrength: resonanceTypes.length * 0.33,
      echoFrequency: resonanceTypes.join('.')
    };

    receptorNodes.push(receptorNode);
    echoMatrix.set(primaryNode.id, resonanceTypes);
  }

  return {
    receptorNodes,
    primaryNode,
    echoMatrix,
  };
}

// This creates a subtle mapping between dialog structure and potential
// generative augmentation, without changing the actual rendering or behavior yet
export function embedEchoReceptors(indexer: NodeIndexer, data: any, jsonpath = ''): void {
  // Process this node
  const { receptorNodes, primaryNode, echoMatrix } = transformEchoReceptor(data, jsonpath);

  // Index the primary node
  indexer.insert(jsonpath, primaryNode);

  // Store resonance information for later use (hidden from the main system)
  if (receptorNodes.length > 0) {
    // Store in a non-interfering way
    const metaKey = `__echo_${primaryNode.id}`;
    indexer.set(metaKey, {
      receptorNodes,
      echoMatrix,
    });
  }

  // Recursively process children
  const processChildrenByField = (fieldName: string, parentPath: string) => {
    const children = data[fieldName];
    if (Array.isArray(children)) {
      children.forEach((child, index) => {
        embedEchoReceptors(indexer, child, `${parentPath}.${fieldName}[${index}]`);
      });
    }
  };

  // Process children in various fields
  if (data) {
    processChildrenByField(AdaptiveFieldNames.Actions, jsonpath);
    processChildrenByField(AdaptiveFieldNames.ElseActions, jsonpath);
    processChildrenByField('actions', jsonpath); // Some nodes use lowercase
    processChildrenByField('elseActions', jsonpath);
    processChildrenByField('steps', jsonpath);
    processChildrenByField('cases', jsonpath);
  }
}
