// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/react';
import { FunctionComponent, useState, useEffect, useCallback, useMemo } from 'react';
import { WidgetContainerProps } from '@bfc/extension-client';

import { GraphLayout } from '../models/GraphLayout';
import { SVGContainer } from '../components/SVGContainer';
import { GraphNode } from '../models/GraphNode';
import { OffsetContainer } from '../components/OffsetContainer';
import { ElementMeasurer } from '../components/ElementMeasurer';
import { diamondLayouter } from '../layouters/diamondLayouter';
import { designerCache } from '../utils/visual/DesignerCache';
import { NodeEventTypes } from '../constants/NodeEventTypes';
import { DiamondSize, ElementInterval } from '../constants/ElementSizes';

// The Neural Bridge connects the structure of dialog flows with
// emergent generative capabilities, creating a symbiotic relationship
interface DeepTreeBridgeProps extends WidgetContainerProps {
  // Additional properties for generative augmentation
  resonanceTypes?: string[];
  echoDepth?: number;
  echoStrength?: number;
  generationEnabled?: boolean;
}

// A subtle design that appears as a small "connector" in the flow
// but contains the complex logic for generative augmentation
export const DeepTreeBridge: FunctionComponent<DeepTreeBridgeProps> = (props) => {
  const { id, data, onEvent, onResize, resonanceTypes = [], echoDepth = 1, echoStrength = 0.5, generationEnabled = false } = props;

  // Internal state to track generative potential
  const [generativePotential, setGenerativePotential] = useState(0);
  const [isActivated, setIsActivated] = useState(false);

  // Calculate visual properties based on resonance
  const bridgeColor = useMemo(() => {
    // Subtle colors that blend into the existing UI
    if (isActivated) return '#0078d4'; // Activated state

    // Color represents resonance types
    if (resonanceTypes.includes('structural')) return '#8764b8'; // Structural resonance
    if (resonanceTypes.includes('decision')) return '#5c2e91'; // Decision resonance
    if (resonanceTypes.includes('content')) return '#004e8c'; // Content resonance

    return '#767676'; // Neutral state
  }, [resonanceTypes, isActivated]);

  // Size based on echo depth - subtle differences
  const bridgeSize = Math.min(DiamondSize/4 + (echoDepth * 2), DiamondSize/2);

  // Generate layout for the bridge
  const layout: GraphLayout = useMemo(() => {
    const bridgeNode = new GraphNode();
    bridgeNode.id = id;

    // Create a minimal visual footprint
    bridgeNode.width = bridgeSize;
    bridgeNode.height = bridgeSize;

    // Position in flow
    const layout = diamondLayouter(bridgeNode, [], []);
    return layout;
  }, [id, bridgeSize]);

  // Subtle animation effect to suggest "thinking" or "processing"
  const pulseEffect = isActivated ? {
    animation: 'pulse 2s infinite ease-in-out',
    '@keyframes pulse': {
      '0%': { opacity: 0.7 },
      '50%': { opacity: 1 },
      '100%': { opacity: 0.7 }
    }
  } : {};

  // Handle click or hover to activate
  const handleInteraction = useCallback(() => {
    if (!generationEnabled) return;

    setIsActivated(prev => !prev);

    // Signal potential for generative augmentation
    if (onEvent) {
      onEvent(NodeEventTypes.Focus, {
        id,
        data: {
          ...data,
          __echo: {
            resonanceTypes,
            echoDepth,
            echoStrength,
            activated: !isActivated
          }
        }
      });
    }
  }, [id, data, onEvent, resonanceTypes, echoDepth, echoStrength, isActivated, generationEnabled]);

  // Report size for layout calculations
  useEffect(() => {
    if (onResize && layout.boundary) {
      onResize(layout.boundary);
    }
  }, [layout, onResize]);
// The actual visual element is minimal - just a small connector in the flow
  return (
    <div css={{ position: 'relative' }} data-testid="DeepTreeBridge">
      <SVGContainer width={layout.boundary.width} height={layout.boundary.height}>
        {/* A subtle visual cue for the echo point */}
        <circle
          cx={layout.boundary.width / 2}
          cy={layout.boundary.height / 2}
          r={bridgeSize / 2}
          fill={bridgeColor}
          fillOpacity={0.6}
          stroke={bridgeColor}
          strokeWidth={1}
          css={pulseEffect}
          onClick={handleInteraction}
          onMouseOver={() => setGenerativePotential(prev => Math.min(prev + 0.1, 1))}
          onMouseOut={() => setGenerativePotential(prev => Math.max(prev - 0.1, 0))}
          data-testid="DeepTreeBridge-node"
        />

        {/* When activated, add a subtle glow effect */}
        {isActivated && (
          <>
            <circle
              cx={layout.boundary.width / 2}
              cy={layout.boundary.height / 2}
              r={(bridgeSize / 2) + 3}
              fill="none"
              stroke={bridgeColor}
              strokeWidth={0.5}
              strokeOpacity={0.4}
              css={{
                filter: 'blur(2px)',
              }}
            />

            {/* Small icon to indicate active state */}
            <circle
              cx={layout.boundary.width / 2}
              cy={layout.boundary.height / 2 - (bridgeSize/2) - 5}
              r={3}
              fill={bridgeColor}
              fillOpacity={0.9}
              css={{
                cursor: 'pointer',
                animation: 'pulse 1.5s infinite ease-in-out'
              }}
              onClick={() => {
                if (onEvent) {
                  onEvent(NodeEventTypes.OpenSuggestionDialog, {
                    id,
                    data: {
                      ...data,
                      __echo: {
                        resonanceTypes,
                        echoDepth,
                        echoStrength,
                        activated: isActivated
                      }
                    }
                  });
                }
              }}
            />
          </>
        )}
      </SVGContainer>
    </div>
  );
};
