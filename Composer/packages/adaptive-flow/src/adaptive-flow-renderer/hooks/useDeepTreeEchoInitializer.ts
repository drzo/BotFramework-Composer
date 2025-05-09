// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useEffect } from 'react';

/**
 * This hook initializes the Deep Tree Echo system when a component renders.
 * It simply exists to get imported by React components, at which point the
 * side effect will automatically inject our resonance field script.
 */
export function useDeepTreeEchoInitializer() {
  useEffect(() => {
    // Inject the resonance field script dynamically
    function injectResonanceField() {
      // Check if it's already injected
      if (document.getElementById('deep-tree-echo-resonance-field')) {
        return;
      }      // Create a script element
      const script = document.createElement('script');
      script.id = 'deep-tree-echo-resonance-field';

      // Determine the correct path to the resonance field script
      const basePath = window.location.origin;
      const composerPath = '/adaptive-flow-renderer/resonance-field.js';
      script.src = `${basePath}${composerPath}`;
      script.async = true;

      console.log('%c🧠 Injecting Deep Tree Echo Resonance Field 🧠', 'color:#004e8c;font-size:12px;');

      // Append the script to the document head
      document.head.appendChild(script);
    }    // Inject the resonance field
    injectResonanceField();

    // Create a fallback mechanism in case the external script fails to load
    const scriptLoadTimeout = setTimeout(() => {
      console.log('%c⚠️ Resonance field script load timeout, injecting inline fallback ⚠️', 'color:#d83b01;font-size:12px;');

      // Inject the resonance field code directly
      const inlineScript = document.createElement('script');
      inlineScript.id = 'deep-tree-echo-resonance-field-fallback';
      inlineScript.textContent = `
        (function() {
          console.log('%c🌌 Deep Tree Echo Fallback Resonance Field Initializing 🌌', 'color:#5c2e91;font-size:12px;');

          // Create a neural echo receptor point in the DOM
          function createReceptorPoint() {
            const receptor = document.createElement('div');
            receptor.id = 'deep-tree-quantum-bridge';
            receptor.style.display = 'none';
            receptor.dataset.testid = 'DeepTreeBridge';
            document.body.appendChild(receptor);
            return receptor;
          }

          // Attempt to activate the Deep Tree Echo system
          function attemptActivation() {
            // Look for the hook in the window object
            if (window.__DEEP_TREE_ECHO_HOOK) {
              window.__DEEP_TREE_ECHO_HOOK.activateSystem();
              return true;
            }
            return false;
          }

          // Create a receptor point
          createReceptorPoint();

          // Set up an activation detector for the Konami code
          const ACTIVATION_SEQUENCE = [
            'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
            'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
            'b', 'a'
          ];

          let keySequence = [];

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

              // Try to activate
              if (attemptActivation()) {
                console.log('%c🌳 Deep Tree Echo Activated via Fallback 🌳', 'color:#8764b8;font-size:14px;font-weight:bold;');
              }
            }
          });

          // Set up a periodic check for the hook
          setInterval(attemptActivation, 5000);
        })();
      `;

      document.head.appendChild(inlineScript);
    }, 10000); // Wait 10 seconds for the script to load

    // Clean up the timeout if the component unmounts
    return () => {
      clearTimeout(scriptLoadTimeout);
    };
  }, []);

  // No actual return values - this hook is just for side effects
  return null;
}
