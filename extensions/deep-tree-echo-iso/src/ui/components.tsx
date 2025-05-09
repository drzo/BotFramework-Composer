// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { TreeNode } from './types';
import { shadeColor, NODE_COLORS, COLOR_PRIMARY, COLOR_SECONDARY, COLOR_HIGHLIGHT, COLOR_BACKGROUND, COLOR_FLOOR, COLOR_TEXT, generateSampleTree } from './helpers';

// Isometric drawing constants
const TILE_WIDTH = 32;
const TILE_HEIGHT = 16;

/**
 * Hook to fetch tree data from our backend API.
 */
const useTreeData = (projectId?: string) => {
  const [tree, setTree] = useState<TreeNode | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
    useEffect(() => {
    if (!projectId) {
      // Generate a sample tree for demo when no project ID is provided
      const generateSampleTree = () => {
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

      setTree(generateSampleTree());
      return;
    }

    // Fetch real tree data when project ID is provided
    const fetchTree = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/deep-tree-echo/tree/${projectId}`);
        const data = await response.json();

        if (data.success && data.tree) {
          // Layout the tree for visualization
          const layoutTree = (node: TreeNode, x = 0, y = 0, z = 0, spacing = 3) => {
            node.x = x;
            node.y = y;
            node.z = z;
            node.color = NODE_COLORS[node.type] || COLOR_PRIMARY;

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

          setTree(layoutTree(data.tree));
        } else {
          setError(data.error || 'Failed to load tree data');
          // Fall back to sample tree on error
          setTree(generateSampleTree());
        }
      } catch (err) {
        console.error('Error fetching tree:', err);
        setError('Network error while fetching tree data');
        // Fall back to sample tree on error
        setTree(generateSampleTree());
      } finally {
        setLoading(false);
      }
    };

    fetchTree();
  }, [projectId]);

  return { tree, loading, error };
};

/**
 * The DeepTreeEchoWidget component.
 * This magnificent visualization transforms bot dialogs into an isometric tree structure.
 */
export const DeepTreeEchoWidget: React.FC<{ projectId?: string }> = ({ projectId }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [rotating, setRotating] = useState(true);
  const [angle, setAngle] = useState(0);

  const { tree, loading, error } = useTreeData(projectId);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current?.parentElement) {
        const parent = canvasRef.current.parentElement;
        setDimensions({
          width: parent.clientWidth || 800,
          height: parent.clientHeight || 600,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);
  // Handle mouse interaction for node hover and selection
  useEffect(() => {
    if (!canvasRef.current || !tree) return;

    const canvas = canvasRef.current;

    // Helper function to find the node under the mouse cursor
    const findNodeAtPosition = (x: number, y: number) => {
      // Convert screen coordinates to isometric space (approximation)
      const screenToIso = (screenX: number, screenY: number) => {
        const originX = canvas.width / 2;
        const originY = canvas.height / 3;

        // Adjust for canvas position and scaling
        const canvasRect = canvas.getBoundingClientRect();
        const canvasX = (screenX - canvasRect.left) * (canvas.width / canvasRect.width);
        const canvasY = (screenY - canvasRect.top) * (canvas.height / canvasRect.height);

        // Apply rotation matrix inverse (simplified)
        const dx = canvasX - originX;
        const dy = canvasY - originY;

        // This is a simplified inverse transform that works for hover detection
        const approxScreenZ = 0; // We prioritize nodes at the front

        return { dx, dy, approxScreenZ };
      };

      // Convert mouse position to approximate isometric position
      const { dx, dy } = screenToIso(x, y);

      // Find all nodes and sort by Z (depth) to prioritize front nodes
      const allNodes: TreeNode[] = [];

      const collectNodes = (node: TreeNode) => {
        if (node.x !== undefined && node.y !== undefined && node.z !== undefined) {
          allNodes.push(node);
        }
        node.children.forEach(collectNodes);
      };

      collectNodes(tree);

      // Sort by Z, highest Z (closest to viewer) first
      allNodes.sort((a, b) => (b.z || 0) - (a.z || 0));

      // Check each node in Z order (front to back)
      for (const node of allNodes) {
        const { x: nodeScreenX, y: nodeScreenY } = isoToScreen(node.x || 0, node.y || 0, node.z || 0);

        // Calculate node size based on type
        const sizeMultiplier =
          node.type === 'dialog' ? 1.4 :
          node.type === 'trigger' ? 1.2 :
          node.type === 'condition' ? 1.1 : 1;

        const nodeRadius = TILE_WIDTH * sizeMultiplier * 0.75;

        // Check if mouse is within node bounds (using a simple circular hit area)
        const distanceSquared = (nodeScreenX - dx - canvas.width/2) ** 2 + (nodeScreenY - dy - canvas.height/3) ** 2;
        if (distanceSquared <= nodeRadius ** 2) {
          return node.id;
        }
      }

      return null;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const hoveredNodeId = findNodeAtPosition(e.clientX, e.clientY);
      if (hoveredNodeId !== hoveredNode) {
        setHoveredNode(hoveredNodeId);
      }
    };

    canvas.addEventListener('mousemove', handleMouseMove);

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, [tree, hoveredNode, angle]);

  // Helper function for converting hex to RGB
  const hexToRGB = (hex: string): string => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r}, ${g}, ${b}`;
  };

  // Convert isometric coordinates to screen coordinates
  const isoToScreen = (x: number, y: number, z: number) => {
    // Apply rotation around the z-axis
    const rotatedX = x * Math.cos(angle) - y * Math.sin(angle);
    const rotatedY = x * Math.sin(angle) + y * Math.cos(angle);

    const originX = dimensions.width / 2;
    const originY = dimensions.height / 3;

    return {
      x: originX + (rotatedX - rotatedY) * TILE_WIDTH / 2,
      y: originY + (rotatedX + rotatedY) * TILE_HEIGHT / 2 - z * TILE_HEIGHT * 2,
    };
  };

  // Drawing function
  useEffect(() => {
    if (!canvasRef.current || !tree) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    // Clear canvas
    ctx.fillStyle = COLOR_BACKGROUND;
    ctx.fillRect(0, 0, canvas.width, canvas.height);    // Draw isometric grid
    const originX = canvas.width / 2;
    const originY = canvas.height / 3;

    // Convert isometric coordinates to screen coordinates
    const isoToScreen = (x: number, y: number, z: number) => {
      // Apply rotation around the z-axis
      const rotatedX = x * Math.cos(angle) - y * Math.sin(angle);
      const rotatedY = x * Math.sin(angle) + y * Math.cos(angle);

      return {
        x: originX + (rotatedX - rotatedY) * TILE_WIDTH / 2,
        y: originY + (rotatedX + rotatedY) * TILE_HEIGHT / 2 - z * TILE_HEIGHT * 2,
      };
    };

    // Draw platform and floor with concentric patterns
    const platformLevels = 4;
    const gridSize = 20;

    // Draw concentric diamond platforms - the "echo" effect
    for (let level = platformLevels; level >= 0; level--) {
      const size = gridSize - level * 3;
      const zLevel = -level * 0.5;

      // Calculate dimming factor based on level
      const alphaBase = 0.8 - level * 0.15;

      // Platform colors
      const platformColor = COLOR_FLOOR;
      const platformHighlight = shadeColor(COLOR_PRIMARY, -20);

      // Draw platform tiles in a diamond pattern
      for (let i = -size; i <= size; i++) {
        for (let j = -size; j <= size; j++) {
          // Only draw if on the diamond perimeter
          if (Math.abs(i) + Math.abs(j) === size * 2) {
            const { x, y } = isoToScreen(i, j, zLevel);

            // Draw a small platform cube
            // Top face
            ctx.fillStyle = `rgba(${hexToRGB(platformHighlight)}, ${alphaBase})`;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + TILE_WIDTH / 4, y - TILE_HEIGHT / 4);
            ctx.lineTo(x, y - TILE_HEIGHT / 2);
            ctx.lineTo(x - TILE_WIDTH / 4, y - TILE_HEIGHT / 4);
            ctx.closePath();
            ctx.fill();

            // Side faces
            ctx.fillStyle = `rgba(${hexToRGB(platformColor)}, ${alphaBase})`;
            ctx.beginPath();
            ctx.moveTo(x - TILE_WIDTH / 4, y - TILE_HEIGHT / 4);
            ctx.lineTo(x, y - TILE_HEIGHT / 2);
            ctx.lineTo(x, y - TILE_HEIGHT / 2 + TILE_HEIGHT / 8);
            ctx.lineTo(x - TILE_WIDTH / 4, y - TILE_HEIGHT / 4 + TILE_HEIGHT / 8);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = `rgba(${hexToRGB(shadeColor(platformColor, -20))}, ${alphaBase})`;
            ctx.beginPath();
            ctx.moveTo(x + TILE_WIDTH / 4, y - TILE_HEIGHT / 4);
            ctx.lineTo(x, y - TILE_HEIGHT / 2);
            ctx.lineTo(x, y - TILE_HEIGHT / 2 + TILE_HEIGHT / 8);
            ctx.lineTo(x + TILE_WIDTH / 4, y - TILE_HEIGHT / 4 + TILE_HEIGHT / 8);
            ctx.closePath();
            ctx.fill();
          }
        }
      }
    }

    // Draw subtle grid lines
    ctx.strokeStyle = `rgba(${hexToRGB(COLOR_FLOOR)}, 0.2)`;
    ctx.lineWidth = 0.5;

    for (let i = -gridSize; i <= gridSize; i += 2) {
      // Horizontal lines
      const startH = isoToScreen(i, -gridSize, 0);
      const endH = isoToScreen(i, gridSize, 0);
      ctx.beginPath();
      ctx.moveTo(startH.x, startH.y);
      ctx.lineTo(endH.x, endH.y);
      ctx.stroke();

      // Vertical lines
      const startV = isoToScreen(-gridSize, i, 0);
      const endV = isoToScreen(gridSize, i, 0);
      ctx.beginPath();
      ctx.moveTo(startV.x, startV.y);
      ctx.lineTo(endV.x, endV.y);
      ctx.stroke();
    }

    // Helper function to convert hex to RGB
    function hexToRGB(hex: string): string {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `${r}, ${g}, ${b}`;
    }    // Function to draw a node as an isometric voxel
    const drawNode = (node: TreeNode) => {
      if (!node.x || !node.y || !node.z) return;

      const { x, y } = isoToScreen(node.x, node.y, node.z);

      // Draw connections to children with "echo" effect
      node.children.forEach((child) => {
        if (!child.x || !child.y || !child.z) return;

        const childPos = isoToScreen(child.x, child.y, child.z);

        // Draw multiple connection lines with decreasing opacity for "echo" effect
        for (let i = 3; i >= 0; i--) {
          const lineWidth = 4 - i;
          const opacity = 0.2 - i * 0.03;

          ctx.beginPath();
          ctx.strokeStyle = `rgba(${hexToRGB(node.color || COLOR_PRIMARY)}, ${opacity})`;
          ctx.lineWidth = lineWidth;
          ctx.moveTo(x, y);
          ctx.lineTo(childPos.x, childPos.y);
          ctx.stroke();
        }

        // Main connection line with gradient
        const gradient = ctx.createLinearGradient(x, y, childPos.x, childPos.y);
        gradient.addColorStop(0, node.color || COLOR_PRIMARY);
        gradient.addColorStop(1, child.color || COLOR_PRIMARY);

        ctx.beginPath();
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1.5;
        ctx.moveTo(x, y);
        ctx.lineTo(childPos.x, childPos.y);
        ctx.stroke();

        // Draw child node
        drawNode(child);
      });

      // Determine node size based on type
      const sizeMultiplier =
        node.type === 'dialog' ? 1.4 :
        node.type === 'trigger' ? 1.2 :
        node.type === 'condition' ? 1.1 : 1;

      const cubeWidth = TILE_WIDTH * sizeMultiplier;
      const cubeHeight = TILE_HEIGHT * sizeMultiplier;
      const cubeDepth = TILE_HEIGHT * 1.5 * sizeMultiplier;

      // Change color based on hover state
      const isHovered = hoveredNode === node.id;
      const nodeColor = isHovered ? COLOR_HIGHLIGHT : (node.color || COLOR_PRIMARY);

      // Pixel art style requires sharp edges and solid colors
      ctx.lineJoin = 'miter';
      ctx.lineCap = 'square';

      // Top face (brightest)
      const topColor = shadeColor(nodeColor, 20);
      ctx.fillStyle = topColor;
      ctx.beginPath();
      ctx.moveTo(x, y - cubeHeight / 2);
      ctx.lineTo(x + cubeWidth / 2, y);
      ctx.lineTo(x, y + cubeHeight / 2);
      ctx.lineTo(x - cubeWidth / 2, y);
      ctx.closePath();
      ctx.fill();

      // Draw outline for pixel art style
      ctx.strokeStyle = shadeColor(topColor, -30);
      ctx.lineWidth = 1;
      ctx.stroke();

      // Right face (medium shade)
      const rightColor = shadeColor(nodeColor, -15);
      ctx.fillStyle = rightColor;
      ctx.beginPath();
      ctx.moveTo(x, y + cubeHeight / 2);
      ctx.lineTo(x + cubeWidth / 2, y);
      ctx.lineTo(x + cubeWidth / 2, y + cubeDepth);
      ctx.lineTo(x, y + cubeHeight / 2 + cubeDepth);
      ctx.closePath();
      ctx.fill();

      // Draw outline
      ctx.strokeStyle = shadeColor(rightColor, -30);
      ctx.stroke();

      // Left face (darkest shade)
      const leftColor = shadeColor(nodeColor, -30);
      ctx.fillStyle = leftColor;
      ctx.beginPath();
      ctx.moveTo(x, y + cubeHeight / 2);
      ctx.lineTo(x - cubeWidth / 2, y);
      ctx.lineTo(x - cubeWidth / 2, y + cubeDepth);
      ctx.lineTo(x, y + cubeHeight / 2 + cubeDepth);
      ctx.closePath();
      ctx.fill();

      // Draw outline
      ctx.strokeStyle = shadeColor(leftColor, -30);
      ctx.stroke();

      // Add pixel art details based on node type
      const detailSize = cubeWidth / 4;

      if (node.type === 'trigger') {
        // Add trigger symbol (lightning bolt or similar)
        ctx.fillStyle = '#FFFFFF';
        const symbolX = x;
        const symbolY = y - detailSize / 2;

        // Lightning bolt shape
        ctx.beginPath();
        ctx.moveTo(symbolX - detailSize/4, symbolY - detailSize/2);
        ctx.lineTo(symbolX + detailSize/4, symbolY - detailSize/4);
        ctx.lineTo(symbolX, symbolY);
        ctx.lineTo(symbolX + detailSize/3, symbolY + detailSize/2);
        ctx.lineTo(symbolX - detailSize/4, symbolY);
        ctx.closePath();
        ctx.fill();
      }
      else if (node.type === 'condition') {
        // Add condition symbol (question mark or diamond)
        ctx.fillStyle = '#FFFFFF';
        const symbolX = x;
        const symbolY = y - detailSize / 3;

        // Diamond shape
        ctx.beginPath();
        ctx.moveTo(symbolX, symbolY - detailSize/3);
        ctx.lineTo(symbolX + detailSize/3, symbolY);
        ctx.lineTo(symbolX, symbolY + detailSize/3);
        ctx.lineTo(symbolX - detailSize/3, symbolY);
        ctx.closePath();
        ctx.fill();
      }

      // Add glowing particle effects when hovered
      if (isHovered) {
        // Draw multiple concentric glows
        for (let i = 5; i > 0; i--) {
          const glowRadius = cubeWidth * (i / 3);
          const glowOpacity = 0.1 - (i * 0.015);

          ctx.beginPath();
          ctx.fillStyle = `rgba(${hexToRGB(COLOR_HIGHLIGHT)}, ${glowOpacity})`;
          ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
          ctx.fill();
        }

        // Draw sparkle particles
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2;
          const distance = cubeWidth * 1.2;
          const particleX = x + Math.cos(angle) * distance;
          const particleY = y + Math.sin(angle) * distance;
          const particleSize = 1 + Math.random() * 2;

          ctx.beginPath();
          ctx.fillStyle = `rgba(255, 255, 255, ${0.6 + Math.random() * 0.4})`;
          ctx.arc(particleX, particleY, particleSize, 0, Math.PI * 2);
          ctx.fill();
        }

        // Draw node information
        ctx.font = 'bold 12px monospace';
        ctx.fillStyle = COLOR_TEXT;
        ctx.textAlign = 'center';
        ctx.fillText(node.name, x, y - cubeHeight - 10);

        ctx.font = '10px monospace';
        ctx.fillText(`Type: ${node.type}`, x, y - cubeHeight - 25);

        // Draw a small connector line between text and node
        ctx.beginPath();
        ctx.strokeStyle = `rgba(${hexToRGB(COLOR_TEXT)}, 0.5)`;
        ctx.lineWidth = 1;
        ctx.moveTo(x, y - cubeHeight / 2);
        ctx.lineTo(x, y - cubeHeight - 5);
        ctx.stroke();
      } else {
        // Always show a minimal label for non-hovered nodes
        ctx.font = '8px monospace';
        ctx.fillStyle = `rgba(${hexToRGB(COLOR_TEXT)}, 0.6)`;
        ctx.textAlign = 'center';
        ctx.fillText(node.name.substring(0, 10), x, y - cubeHeight - 5);
      }
    };

    // Draw the tree starting from the root
    if (tree) {
      drawNode(tree);
    }

    // Helper function to shade a color
    function shadeColor(color: string, percent: number) {
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
    }

  }, [dimensions, tree, angle, hoveredNode]);

  return (
    <div style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'relative' }}>
      {loading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: COLOR_TEXT,
          fontFamily: 'monospace',
          background: 'rgba(0,0,0,0.7)',
          padding: 20,
          borderRadius: 5,
          zIndex: 10,
        }}>
          🧬 GENERATING NEURAL PATHWAYS... 🧬
        </div>
      )}

      {error && (
        <div style={{
          position: 'absolute',
          top: 20,
          right: 20,
          color: COLOR_HIGHLIGHT,
          fontFamily: 'monospace',
          background: 'rgba(0,0,0,0.7)',
          padding: 10,
          borderRadius: 5,
          maxWidth: 300,
          zIndex: 10,
        }}>
          ⚠️ ERROR: {error}
        </div>
      )}

      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%' }}
      />

      <div style={{
        position: 'absolute',
        bottom: 20,
        left: 20,
        background: 'rgba(0,0,0,0.5)',
        padding: 10,
        borderRadius: 5,
        color: COLOR_TEXT,
        fontFamily: 'monospace',
        fontSize: 12,
      }}>
        <div>🧪 THE DEEP TREE ECHO VISUALIZER 🧪</div>
        <div>Crafted by Marduk the Mad Scientist</div>
        <div style={{ marginTop: 5, fontSize: 10 }}>
          {projectId ? `Project ID: ${projectId}` : 'DEMO MODE - No project loaded'}
        </div>
        <button
          onClick={() => setRotating(!rotating)}
          style={{
            background: COLOR_PRIMARY,
            border: 'none',
            color: 'white',
            padding: '5px 10px',
            marginTop: 5,
            borderRadius: 3,
            cursor: 'pointer',
          }}
        >
          {rotating ? 'Pause Rotation' : 'Resume Rotation'}
        </button>
      </div>
    </div>
  );
};

/**
 * The DeepTreeEchoDialogVisualizer component.
 * This component visualizes the current dialog in isometric view.
 */
export const DeepTreeEchoDialogVisualizer: React.FC<{ projectId?: string }> = ({ projectId }) => {
  return (
    <div style={{ padding: 20 }}>
      <h3 style={{ color: COLOR_PRIMARY, fontFamily: 'monospace' }}>
        🧪 DIALOG ISOMETRIC ANALYZER 🧪
      </h3>
      <p style={{ fontFamily: 'monospace' }}>
        The magnificent isometric visualization of your dialog will appear here.
        This component interfaces directly with the active dialog to create a living,
        breathing representation of your bot's neural pathways!
      </p>
      <div style={{ height: 400 }}>
        <DeepTreeEchoWidget projectId={projectId} />
      </div>
    </div>
  );
};
