// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { TreeNode } from './types';

// Isometric drawing constants
export const TILE_WIDTH = 32;
export const TILE_HEIGHT = 16;
export const COLOR_PRIMARY = '#6366f1'; // Indigo/Purple
export const COLOR_SECONDARY = '#8b5cf6'; // Violet
export const COLOR_HIGHLIGHT = '#ef4444'; // Red
export const COLOR_BACKGROUND = '#111827'; // Dark Gray
export const COLOR_FLOOR = '#374151'; // Gray
export const COLOR_TEXT = '#f3f4f6'; // Light Gray

// Node color mapping by type
export const NODE_COLORS = {
  trigger: '#6366f1', // Indigo
  dialog: '#8b5cf6', // Violet
  dialogRef: '#8b5cf6', // Violet
  action: '#10b981', // Emerald
  condition: '#f59e0b', // Amber
  branch: '#3b82f6', // Blue
  loop: '#ec4899', // Pink
  property: '#64748b', // Slate
  event: '#f43f5e', // Rose
  http: '#0ea5e9', // Sky
  input: '#14b8a6', // Teal
  unknown: '#9ca3af', // Gray
};

/**
 * Helper function to shade a color
 */
export const shadeColor = (color: string, percent: number): string => {
  let R = parseInt(color.substring(1, 3), 16);
  let G = parseInt(color.substring(3, 5), 16);
  let B = parseInt(color.substring(5, 7), 16);

  R = Math.floor(R * (100 + percent) / 100);
  G = Math.floor(G * (100 + percent) / 100);
  B = Math.floor(B * (100 + percent) / 100);

  R = R < 255 ? R : 255;
  G = G < 255 ? G : 255;
  B = B < 255 ? B : 255;

  R = R > 0 ? R : 0;
  G = G > 0 ? G : 0;
  B = B > 0 ? B : 0;

  const RR = R.toString(16).padStart(2, '0');
  const GG = G.toString(16).padStart(2, '0');
  const BB = B.toString(16).padStart(2, '0');

  return `#${RR}${GG}${BB}`;
};

/**
 * Helper function to generate a sample tree for demonstration
 */
export const generateSampleTree = (): TreeNode => {
  const generateTreeNode = (depth: number, maxChildren: number, prefix = ''): TreeNode => {
    const id = prefix + (prefix ? '_' : '') + Math.random().toString(36).substring(2, 9);
    const nodeType = ['trigger', 'dialog', 'action', 'condition', 'loop'][Math.floor(Math.random() * 5)];
    const name = `${nodeType.charAt(0).toUpperCase() + nodeType.slice(1)} ${id.substring(0, 5)}`;

    const children: TreeNode[] = [];
    if (depth > 0) {
      const numChildren = Math.floor(Math.random() * maxChildren) + 1;
      for (let i = 0; i < numChildren; i++) {
        children.push(generateTreeNode(depth - 1, maxChildren, id));
      }
    }

    return {
      id,
      name,
      type: nodeType,
      children,
      color: NODE_COLORS[nodeType] || COLOR_PRIMARY,
    };
  };

  // Generate a sample tree with 3 levels and up to 3 children per node
  const sampleTree = generateTreeNode(3, 3);

  // Layout the tree
  const layoutTree = (node: TreeNode, x = 0, y = 0, z = 0, spacing = 3) => {
    node.x = x;
    node.y = y;
    node.z = z;

    // Position children
    const childSpacingX = spacing;
    const childSpacingY = spacing;

    let nextX = x - Math.floor(node.children.length / 2) * childSpacingX;
    let nextY = y - Math.floor(node.children.length / 2) * childSpacingY;

    node.children.forEach((child, index) => {
      layoutTree(
        child,
        nextX + index * childSpacingX,
        nextY + index * childSpacingY,
        z + 1,
        spacing - 0.5 > 1 ? spacing - 0.5 : 1
      );
    });

    return node;
  };

  return layoutTree(sampleTree);
};
