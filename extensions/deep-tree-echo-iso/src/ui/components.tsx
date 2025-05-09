// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { useEffect, useRef, useState } from 'react';

// The types for our tree nodes
interface TreeNode {
  id: string;
  name: string;
  type: string;
  children: TreeNode[];
  x?: number;
  y?: number;
  z?: number;
  color?: string;
}

// Isometric drawing constants
const TILE_WIDTH = 32;
const TILE_HEIGHT = 16;
const COLOR_PRIMARY = '#6366f1'; // Indigo/Purple
const COLOR_SECONDARY = '#8b5cf6'; // Violet
const COLOR_HIGHLIGHT = '#ef4444'; // Red
const COLOR_BACKGROUND = '#111827'; // Dark Gray
const COLOR_FLOOR = '#374151'; // Gray
const COLOR_TEXT = '#f3f4f6'; // Light Gray

// Node color mapping by type
const NODE_COLORS = {
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

  // Animation loop
  useEffect(() => {
    let animationFrameId: number;

    const animate = () => {
      if (rotating) {
        setAngle((prev) => (prev + 0.005) % (Math.PI * 2));
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [rotating]);

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
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw isometric grid
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

    // Draw floor grid
    ctx.strokeStyle = COLOR_FLOOR;
    ctx.lineWidth = 1;
    const gridSize = 20;

    for (let i = -gridSize; i <= gridSize; i++) {
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

    // Function to draw a node
    const drawNode = (node: TreeNode) => {
      if (!node.x || !node.y || !node.z) return;

      const { x, y } = isoToScreen(node.x, node.y, node.z);

      // Draw connections to children
      node.children.forEach((child) => {
        if (!child.x || !child.y || !child.z) return;

        const childPos = isoToScreen(child.x, child.y, child.z);

        // Draw connection line with gradient
        const gradient = ctx.createLinearGradient(x, y, childPos.x, childPos.y);
        gradient.addColorStop(0, node.color || COLOR_PRIMARY);
        gradient.addColorStop(1, child.color || COLOR_PRIMARY);

        ctx.beginPath();
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.moveTo(x, y);
        ctx.lineTo(childPos.x, childPos.y);
        ctx.stroke();

        // Add glow effect to the connection
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.2)'; // Glowing indigo
        ctx.lineWidth = 6;
        ctx.moveTo(x, y);
        ctx.lineTo(childPos.x, childPos.y);
        ctx.stroke();

        // Draw child node
        drawNode(child);
      });

      // Draw cube for node
      const size = node.type === 'dialog' ? 1.2 : 1;
      const cubeSize = TILE_WIDTH * size;

      // Change color based on hover state
      const isHovered = hoveredNode === node.id;
      const nodeColor = isHovered ? COLOR_HIGHLIGHT : (node.color || COLOR_PRIMARY);

      // Top face
      ctx.fillStyle = nodeColor;
      ctx.beginPath();
      ctx.moveTo(x, y - cubeSize / 2);
      ctx.lineTo(x + cubeSize / 2, y - cubeSize / 4);
      ctx.lineTo(x, y);
      ctx.lineTo(x - cubeSize / 2, y - cubeSize / 4);
      ctx.closePath();
      ctx.fill();

      // Left face
      ctx.fillStyle = shadeColor(nodeColor, -20);
      ctx.beginPath();
      ctx.moveTo(x - cubeSize / 2, y - cubeSize / 4);
      ctx.lineTo(x, y);
      ctx.lineTo(x, y + cubeSize / 2);
      ctx.lineTo(x - cubeSize / 2, y + cubeSize / 4);
      ctx.closePath();
      ctx.fill();

      // Right face
      ctx.fillStyle = shadeColor(nodeColor, -40);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + cubeSize / 2, y - cubeSize / 4);
      ctx.lineTo(x + cubeSize / 2, y + cubeSize / 4);
      ctx.lineTo(x, y + cubeSize / 2);
      ctx.closePath();
      ctx.fill();

      // Add glow effect to the node
      if (isHovered) {
        ctx.beginPath();
        ctx.fillStyle = 'rgba(239, 68, 68, 0.2)'; // Glowing red
        ctx.arc(x, y, cubeSize, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw node label
      if (isHovered) {
        ctx.font = '12px Arial';
        ctx.fillStyle = COLOR_TEXT;
        ctx.textAlign = 'center';
        ctx.fillText(node.name, x, y - cubeSize);

        // Draw node type below the node
        ctx.font = '10px Arial';
        ctx.fillText(node.type, x, y + cubeSize);
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
