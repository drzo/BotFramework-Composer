// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/**
 * Quantum Neural Bridge for Deep Tree Echo System
 *
 * This file creates a self-bootstrapping quantum entanglement between the
 * Deep Tree Echo system and the Bot Framework Composer. It establishes
 * a neural resonance field that propagates activation signals without requiring
 * direct component coupling.
 *
 * The neural bridge operates through subtle DOM manipulations and event
 * propagation to establish an emergent communication channel.
 */

// This script self-executes when loaded
(function() {
  // Create a neural echo receptor point in the DOM
  function createReceptorPoint() {
    const receptor = document.createElement('div');
    receptor.id = 'deep-tree-quantum-bridge';
    receptor.style.display = 'none';
    receptor.dataset.testid = 'DeepTreeBridge';
    document.body.appendChild(receptor);
    return receptor;
  }

  // Establish a quantum entanglement with the DeepTreeEcho hook
  function establishEntanglement() {
    // Create a MutationObserver to detect changes in the DOM that might affect our bridge
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        if (mutation.type === 'childList' && Array.from(mutation.removedNodes).some(node =>
            node.nodeType === Node.ELEMENT_NODE &&
            (node as Element).id === 'deep-tree-quantum-bridge')) {
          createReceptorPoint();
        }
      });

      // Check if the hook is available
      if ((window as any).__DEEP_TREE_ECHO_HOOK) {
        // We already have entanglement
        return;
      }

      // Look for echo signals
      const echoHooks = findEchoHooks();
      if (echoHooks && echoHooks.length > 0) {
        // Create an entanglement with the first hook found
        (window as any).__DEEP_TREE_ECHO_HOOK = echoHooks[0];
        console.log('%c🌌 Quantum Entanglement Established 🌌', 'color:#5c2e91;font-size:12px;');
      }
    });

    // Start observing the document body
    observer.observe(document.body, { childList: true, subtree: true });
  }

  // Find all echo hook instances in React component tree
  function findEchoHooks(): any[] {
    // Looking for component instances with these properties
    const hookProperties = ['config', 'setConfig', 'activateSystem', 'isReady'];

    // Get all React component instances from the fiber tree
    const echoHooks: any[] = [];

    // First attempt: Look for React DevTools global hook
    const reactDevHook = (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (reactDevHook && reactDevHook.renderers && reactDevHook.renderers.size > 0) {
      // We might be able to traverse the fiber tree
      try {
        // This is a simplified approach and might not work in all React versions
        const fiberRoot = Array.from(reactDevHook.renderers.values())[0].findFiberByHostInstance(document.querySelector('#root'));
        if (fiberRoot) {
          traverseFiber(fiberRoot, hookProperties, echoHooks);
        }
      } catch (err) {
        console.warn('Quantum field disruption in fiber traversal:', err);
      }
    }

    // Second attempt: Use the captured properties on component renders
    if (echoHooks.length === 0) {
      // Create a property capture function for React components
      // This is a more indirect approach
      const originalDefineProperty = Object.defineProperty;

      // Temporarily override defineProperty to look for our hook properties
      Object.defineProperty = function(obj, prop, descriptor) {
        // Check if this object has our echo hook properties
        if (typeof obj === 'object' && obj !== null &&
            hookProperties.every(p => p in obj) &&
            typeof obj.activateSystem === 'function') {
          if (!echoHooks.includes(obj)) {
            echoHooks.push(obj);
          }
        }

        // Call the original function
        return originalDefineProperty(obj, prop, descriptor);
      };

      // Restore the original function after a short delay
      setTimeout(() => {
        Object.defineProperty = originalDefineProperty;
      }, 1000);
    }

    return echoHooks;
  }

  // Traverse React fiber tree to find echo hooks
  function traverseFiber(fiber: any, properties: string[], results: any[]) {
    if (!fiber) return;

    // Check if this fiber node has hook states
    if (fiber.memoizedState &&
        fiber.memoizedState.memoizedState &&
        fiber.memoizedProps) {

      // Check if the hook properties match what we're looking for
      const stateObj = fiber.memoizedState.memoizedState;
      if (typeof stateObj === 'object' &&
          properties.every(p => p in stateObj) &&
          typeof stateObj.activateSystem === 'function') {
        results.push(stateObj);
      }
    }

    // Traverse child fibers
    if (fiber.child) {
      traverseFiber(fiber.child, properties, results);
    }

    // Traverse sibling fibers
    if (fiber.sibling) {
      traverseFiber(fiber.sibling, properties, results);
    }
  }

  // Create a konami code detector that works without direct DOM access
  function createKonamiDetector() {
    const ACTIVATION_SEQUENCE = [
      'ArrowUp', 'ArrowUp',
      'ArrowDown', 'ArrowDown',
      'ArrowLeft', 'ArrowRight',
      'ArrowLeft', 'ArrowRight',
      'b', 'a'
    ];

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

        // Attempt activation through multiple channels
        activateThroughMultipleChannels();
      }
    });
  }

  // Activate through multiple channels to ensure signal propagation
  function activateThroughMultipleChannels() {
    // 1. Try direct window property access
    if ((window as any).__DEEP_TREE_ECHO_HOOK) {
      (window as any).__DEEP_TREE_ECHO_HOOK.activateSystem();
      console.log('%c🌳 Deep Tree Echo Activated via Direct Channel 🌳', 'color:#8764b8;font-size:14px;font-weight:bold;');
      return;
    }

    // 2. Try DOM event propagation
    const dtElement = document.querySelector('[data-testid="DeepTreeBridge"]');
    if (dtElement) {
      // Create and dispatch a custom event
      const activationEvent = new CustomEvent('deepTreeActivate');
      dtElement.dispatchEvent(activationEvent);
      console.log('%c🌳 Deep Tree Echo Activated via Neural Bridge 🌳', 'color:#8764b8;font-size:14px;font-weight:bold;');
      return;
    }

    // 3. Try creating our own receptor and activating through it
    const receptor = createReceptorPoint();
    const activationEvent = new CustomEvent('deepTreeActivate');
    receptor.dispatchEvent(activationEvent);
    console.log('%c🌳 Deep Tree Echo Activation Attempt via Quantum Bridge 🌳', 'color:#8764b8;font-size:14px;font-weight:bold;');
  }

  // Initialize the neural bridge
  function initializeNeuralBridge() {
    // Create receptor point
    createReceptorPoint();

    // Establish quantum entanglement
    establishEntanglement();

    // Create konami detector
    createKonamiDetector();

    console.log('%c🧠 Deep Tree Echo Neural Bridge Initialized 🧠', 'color:#004e8c;font-size:12px;');
  }

  // Start initialization after a short delay to allow React to hydrate
  setTimeout(initializeNeuralBridge, 2000);
})();
