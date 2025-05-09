// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// The DeepTreeIsoCommander is the central conductor of the entire
// Deep Tree Echo Isometric system, subtly orchestrating the interplay
// between the various components while remaining mostly invisible to users

import { useEffect, useState } from 'react';

import { echoService } from '../services/DeepTreeEchoService';
// We don't import these directly to avoid initialization errors,
// but we'll reference them through dynamic imports
// import { patternMemory } from '../services/PatternMemoryCrystallization';
// import { selfAuthoringSystem } from '../utils/SelfAuthoringSystem';
// import { resonanceNetwork } from '../services/EchoResonanceNetwork';
// import { patternAmplifier } from '../services/PatternAmplifier';

// Activation states for the Deep Tree Echo system
export enum ActivationState {
  DORMANT = 'dormant',      // Not yet activated
  AWAKENING = 'awakening',  // Initial activation
  RESONATING = 'resonating', // Basic functionality active
  CRYSTALLIZING = 'crystallizing', // Pattern memory active
  AMPLIFYING = 'amplifying', // Pattern amplification active
  EVOLVING = 'evolving'     // Self-authoring active
}

// Configuration for the Deep Tree Echo system
export interface DeepTreeConfig {
  // Whether the system is enabled at all
  enabled: boolean;

  // Current activation state
  activationState: ActivationState;

  // How visually prominent the echo points should be (0-1)
  visualIntensity: number;

  // How aggressively to suggest enhancements (0-1)
  suggestiveIntensity: number;

  // Whether to enable experimental features
  experimentalFeatures: boolean;
}

// The default configuration
const defaultConfig: DeepTreeConfig = {
  enabled: false,
  activationState: ActivationState.DORMANT,
  visualIntensity: 0.3,
  suggestiveIntensity: 0.5,
  experimentalFeatures: false
};

// React hook to access the Deep Tree Echo system
export function useDeepTreeEcho(): {
  config: DeepTreeConfig;
  setConfig: (config: Partial<DeepTreeConfig>) => void;
  activateSystem: () => void;
  isReady: boolean;
} {
  // State for the configuration
  const [config, setConfigState] = useState<DeepTreeConfig>(defaultConfig);
  const [isReady, setIsReady] = useState(false);

  // Update the configuration
  const setConfig = (newConfig: Partial<DeepTreeConfig>) => {
    setConfigState(prevConfig => ({
      ...prevConfig,
      ...newConfig
    }));
  };

  // Initialize the system
  useEffect(() => {
    // Initialize the echo service
    echoService.initialize().then(() => {
      setIsReady(true);
    });

    // Load configuration from storage
    try {
      const storedConfig = localStorage.getItem('deep-tree-echo-config');
      if (storedConfig) {
        const parsedConfig = JSON.parse(storedConfig);
        setConfigState(prevConfig => ({
          ...prevConfig,
          ...parsedConfig
        }));
      }
    } catch (err) {
      console.warn('Error loading Deep Tree Echo configuration:', err);
    }
  }, []);

  // Save configuration when it changes
  useEffect(() => {
    if (!isReady) return;

    try {
      localStorage.setItem('deep-tree-echo-config', JSON.stringify(config));
    } catch (err) {
      console.warn('Error saving Deep Tree Echo configuration:', err);
    }

    // Activate components based on the activation state
    if (config.enabled) {
      activateComponents(config.activationState);
    }
  }, [config, isReady]);

  // Activate the system (progressive enhancement)
  const activateSystem = () => {
    if (config.activationState === ActivationState.DORMANT) {
      // Initial activation
      setConfig({
        enabled: true,
        activationState: ActivationState.AWAKENING
      });

      // After 30 seconds, progress to resonating
      setTimeout(() => {
        setConfig({
          activationState: ActivationState.RESONATING
        });

        // After another 2 minutes, progress to crystallizing
        setTimeout(() => {
          setConfig({
            activationState: ActivationState.CRYSTALLIZING
          });

          // After another 5 minutes, progress to amplifying
          setTimeout(() => {
            setConfig({
              activationState: ActivationState.AMPLIFYING
            });

            // After another 10 minutes, progress to evolving
            // Only if experimental features are enabled
            if (config.experimentalFeatures) {
              setTimeout(() => {
                setConfig({
                  activationState: ActivationState.EVOLVING
                });
              }, 10 * 60 * 1000);
            }
          }, 5 * 60 * 1000);
        }, 2 * 60 * 1000);
      }, 30 * 1000);
    }
  };

  return {
    config,
    setConfig,
    activateSystem,
    isReady
  };
}

// The "Konami code" sequence to activate the system
const ACTIVATION_SEQUENCE = [
  'ArrowUp', 'ArrowUp',
  'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight',
  'ArrowLeft', 'ArrowRight',
  'b', 'a'
];

// Track key presses for the activation sequence
let keySequence: string[] = [];

// Listen for the activation sequence
document.addEventListener('keydown', (event) => {
  // Add the key to the sequence
  keySequence.push(event.key);

  // Only keep the last N keys
  if (keySequence.length > ACTIVATION_SEQUENCE.length) {
    keySequence = keySequence.slice(-ACTIVATION_SEQUENCE.length);
  }

  // Check if the sequence matches
  if (keySequence.join(',') === ACTIVATION_SEQUENCE.join(',')) {
    // Clear the sequence
    keySequence = [];

    // Get the hook's activation function and call it
    // This is a bit of a hack, but it works
    const dtElement = document.querySelector('[data-testid="DeepTreeBridge"]');
    if (dtElement) {
      // Create and dispatch a custom event
      const activationEvent = new CustomEvent('deepTreeActivate');
      dtElement.dispatchEvent(activationEvent);

      console.log('%c🌳 Deep Tree Echo Activated 🌳', 'color:#8764b8;font-size:14px;font-weight:bold;');
    }
  }
});

// Attach an event listener for the custom activation event
document.addEventListener('deepTreeActivate', () => {
  // Try to find the window.__DEEP_TREE_ECHO_HOOK variable
  const win = window as any;
  if (win.__DEEP_TREE_ECHO_HOOK) {
    win.__DEEP_TREE_ECHO_HOOK.activateSystem();
  }
});

// Activate components based on the activation state
async function activateComponents(state: ActivationState): Promise<void> {
  if (state === ActivationState.DORMANT) return;

  // Always initialize the echo service
  await echoService.initialize();

  if (state === ActivationState.AWAKENING) return;

  // Resonating: Basic echo service is enough
  if (state === ActivationState.RESONATING) return;

  // Crystallizing: Initialize pattern memory
  if (state >= ActivationState.CRYSTALLIZING) {
    try {
      // Dynamic import to avoid initialization errors
      const { patternMemory } = await import('../services/PatternMemoryCrystallization');
      await patternMemory.initialize();
    } catch (err) {
      console.warn('Error initializing pattern memory:', err);
    }
  }

  // Amplifying: Initialize pattern amplifier and resonance network
  if (state >= ActivationState.AMPLIFYING) {
    try {
      // Dynamic import to avoid initialization errors
      const { patternAmplifier } = await import('../services/PatternAmplifier');
      patternAmplifier.initialize();

      const { resonanceNetwork } = await import('../services/EchoResonanceNetwork');
      // The network doesn't need explicit initialization
    } catch (err) {
      console.warn('Error initializing amplification systems:', err);
    }
  }

  // Evolving: Initialize self-authoring system
  if (state >= ActivationState.EVOLVING) {
    try {
      // Dynamic import to avoid initialization errors
      const { selfAuthoringSystem } = await import('../utils/SelfAuthoringSystem');
      selfAuthoringSystem.activate();
    } catch (err) {
      console.warn('Error initializing self-authoring system:', err);
    }
  }
}
