// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css, CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import React, { useRef, useMemo, useEffect, useState } from 'react';
import isEqual from 'lodash/isEqual';
import formatMessage from 'format-message';
import { DialogFactory, MicrosoftIDialog, SchemaDefinitions } from '@bfc/shared';
import { useShellApi, JSONSchema7, FlowUISchema, FlowWidget } from '@bfc/extension-client';
import { MarqueeSelection } from '@fluentui/react/lib/MarqueeSelection';

import { NodeEventTypes } from '../adaptive-flow-renderer/constants/NodeEventTypes';
import { AdaptiveDialog } from '../adaptive-flow-renderer/adaptive/AdaptiveDialog';
import { echoService } from '../adaptive-flow-renderer/services/DeepTreeEchoService';
import { transformEchoReceptor } from '../adaptive-flow-renderer/transformers/transformEchoReceptor';
import { GenerativeSuggestionDialog } from '../adaptive-flow-renderer/components/GenerativeSuggestionDialog';
import { EchoSuggestion, EchoResponse } from '../adaptive-flow-renderer/services/DeepTreeEchoService';

import { NodeRendererContext, NodeRendererContextValue } from './contexts/NodeRendererContext';
import { SelfHostContext } from './contexts/SelfHostContext';
import { getCustomSchema } from './utils/getCustomSchema';
import { SelectionContext } from './contexts/SelectionContext';
import { enableKeyboardCommandAttributes, KeyboardCommandHandler } from './components/KeyboardZone';
import { mapKeyboardCommandToEditorEvent } from './utils/mapKeyboardCommandToEditorEvent';
import { useSelectionEffect } from './hooks/useSelectionEffect';
import { useEditorEventApi } from './hooks/useEditorEventApi';
import {
  VisualEditorNodeMenu,
  VisualEditorEdgeMenu,
  VisualEditorNodeWrapper,
  VisualEditorElementWrapper,
} from './renderers';
import { useFlowUIOptions } from './hooks/useFlowUIOptions';
import { FlowToolbar } from './components/FlowToolbar';
import { useDeepTreeEcho } from '../adaptive-flow-renderer/hooks/useDeepTreeEcho';

formatMessage.setup({
  missingTranslation: 'ignore',
});

const emotionCache = createCache({
  key: 'adaptive-form-cache',
  // @ts-expect-error: nounce defined during server rendering the page
  nonce: window.__nonce__,
});

const styles = css`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;

  border: 1px solid transparent;

  &:focus {
    outline: none;
    border-color: black;
  }
`;

export interface VisualDesignerProps {
  onFocus?: (event: React.FocusEvent<HTMLDivElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLDivElement>) => void;
  schema?: JSONSchema7;
  data?: any;
}
const VisualDesigner: React.FC<VisualDesignerProps> = ({ onFocus, onBlur, schema, data: inputData }): JSX.Element => {
  const { shellApi, ...shellData } = useShellApi();
  const { schema: schemaFromPlugins, widgets: widgetsFromPlugins } = useFlowUIOptions();
  const {
    dialogId,
    focusedEvent,
    focusedActions,
    focusedTab,
    clipboardActions,
    hosted,
    schemas,
    flowZoomRate,
    flowCommentsVisible,
    topics,
    dialogs,
  } = shellData;

  const { updateFlowZoomRate, toggleFlowComments } = shellApi;

  const dataCache = useRef({});

  // State for generative suggestion dialog
  const [suggestionDialogOpen, setSuggestionDialogOpen] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState('');

  /**
   * VisualDesigner is coupled with ShellApi where input json always mutates.
   * Deep checking input data here to make React change detection works.
   */
  const dataChanged = !isEqual(dataCache.current, inputData);
  if (dataChanged) {
    dataCache.current = inputData;
  }

  const data = dataCache.current as MicrosoftIDialog;
  const focusedId = Array.isArray(focusedActions) && focusedActions[0] ? focusedActions[0] : '';

  // Compute schema diff
  const customActionSchema = useMemo(
    () => getCustomSchema(schemas?.default, schemas?.sdk?.content).actions,
    [schemas?.sdk?.content, schemas?.default],
  );

  const nodeContext: NodeRendererContextValue = {
    focusedId,
    focusedEvent,
    focusedTab,
    clipboardActions: clipboardActions || [],
    dialogFactory: new DialogFactory(schema),
    customSchemas: customActionSchema ? [customActionSchema] : [],
    topics,
    dialogs,
  };

  const customFlowSchema: FlowUISchema = nodeContext.customSchemas.reduce((result, s) => {
    const definitionKeys = Object.keys(s.definitions ?? {});
    definitionKeys.forEach(($kind) => {
      result[$kind] = {
        widget: 'ActionHeader',
        colors: { theme: '#69797E', color: 'white' },
      } as FlowWidget;
    });
    return result;
  }, {} as FlowUISchema);

  const divRef = useRef<HTMLDivElement>(null);
  // send focus to the keyboard area when navigating to a new trigger
  useEffect(() => {
    divRef.current?.focus();
  }, [focusedEvent]);

  const { selection, ...selectionContext } = useSelectionEffect({ data, nodeContext }, shellApi);  const { handleEditorEvent } = useEditorEventApi({ path: dialogId, data, nodeContext, selectionContext }, shellApi);

  const handleCommand: KeyboardCommandHandler = (command) => {
    const editorEvent = mapKeyboardCommandToEditorEvent(command);
    editorEvent && handleEditorEvent(editorEvent.type, editorEvent.payload);
  };

  // Deep Tree Echo Integration - Initialize the service when the editor loads
  useEffect(() => {
    if (!echoService.isInitialized) {
      echoService.initialize().catch(console.error);
      console.log('Deep Tree Echo Pattern: Service initialization triggered');
    }
  }, []);  // Enhanced event handler that intercepts events related to echo points
  const handleEnhancedEditorEvent = (eventName: NodeEventTypes, eventData: any) => {
    // Handle normal editor events
    handleEditorEvent(eventName, eventData);

    // Look for echo-related events
    if (eventName === NodeEventTypes.Focus && eventData && eventData.data && eventData.data.__echo) {
      const { id, data: nodeData } = eventData;
      const echoData = eventData.data.__echo;

      // Register this node with the Echo service
      if (echoData.activated) {
        echoService.registerReceptor({
          nodeId: id,
          dialogData: nodeData,
          resonanceTypes: echoData.resonanceTypes || [],
          echoDepth: echoData.echoDepth || 1,
          echoStrength: echoData.echoStrength || 0.5
        });

        // Generate suggestions for this node
        echoService.generateSuggestions(id).then(suggestions => {
          if (suggestions) {
            // In a real implementation, we would show these suggestions to the user
            console.log('Deep Tree Echo Pattern: Suggestions generated', suggestions);
          }
        });
      } else {
        echoService.unregisterReceptor(id);
      }
    }

    // Handle suggestion dialog open event
    if (eventName === NodeEventTypes.OpenSuggestionDialog && eventData && eventData.id) {
      setSelectedNodeId(eventData.id);
      setSuggestionDialogOpen(true);
    }
  };

  // Handle applying a suggestion
  const handleApplySuggestion = (suggestion: EchoSuggestion) => {
    if (!selectedNodeId) return;

    // For demo purposes, log the suggestion
    console.log('Applying suggestion to node', selectedNodeId, suggestion);

    // The actual application would depend on the suggestion type and content
    // In a real implementation, we would modify the dialog structure based on the suggestion

    // Example: Add a new action to a dialog
    if (suggestion.type === 'branch' && suggestion.content.newBranch) {
      const path = `${dialogId}#${selectedNodeId}`;
      const propertyName = 'actions';

      // Use shellApi to update the dialog
      shellApi.updateAction(path, propertyName, suggestion.content.newBranch);
    }

    // Example: Enhance existing content (for TextInput, etc.)
    if (suggestion.type === 'enhancement' && suggestion.content.rephrasing) {
      const path = `${dialogId}#${selectedNodeId}`;

      // Use shellApi to update the dialog property
      // This is simplified - in reality, you'd need to determine which property to update
      shellApi.updateActionProperty(path, 'prompt', suggestion.content.rephrasing);
    }
  };

  // Function to fetch suggestions for a node
  const fetchSuggestions = (nodeId: string): Promise<EchoResponse | null> => {
    return echoService.generateSuggestions(nodeId);
  };

  return (
    <CacheProvider value={emotionCache}>
      <NodeRendererContext.Provider value={nodeContext}>
        <SelfHostContext.Provider value={hosted}>
          <div
            ref={divRef}
            css={styles}
            tabIndex={0}
            onBlur={onBlur}
            onFocus={onFocus}
            {...enableKeyboardCommandAttributes(handleCommand)}
            data-testid="visualdesigner-container"
          >
            <FlowToolbar
              flowCommentsVisible={flowCommentsVisible}
              flowZoomRate={flowZoomRate}
              focusedId={focusedId}
              toggleFlowComments={toggleFlowComments}
              updateFlowZoomRate={updateFlowZoomRate}
            >
              <SelectionContext.Provider value={selectionContext}>
                <MarqueeSelection isDraggingConstrainedToRoot selection={selection}>
                  <div
                    className="flow-editor-container"
                    css={{
                      width: '100%',
                      height: '100%',
                      padding: '48px 20px',
                      boxSizing: 'border-box',
                    }}                    data-testid="flow-editor-container"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEnhancedEditorEvent(NodeEventTypes.Focus, { id: '' });
                    }}
                  >                    <AdaptiveDialog
                      activeTrigger={focusedEvent}
                      dialogData={data}
                      dialogId={dialogId}
                      renderers={{
                        EdgeMenu: VisualEditorEdgeMenu,
                        NodeMenu: VisualEditorNodeMenu,
                        NodeWrapper: VisualEditorNodeWrapper,
                        ElementWrapper: VisualEditorElementWrapper,
                      }}
                      sdkschema={schema?.definitions as SchemaDefinitions}
                      uischema={{ ...customFlowSchema, ...schemaFromPlugins }}
                      widgets={widgetsFromPlugins}
                      onEvent={(eventName, eventData) => {
                        divRef.current?.focus({ preventScroll: true });
                        handleEnhancedEditorEvent(eventName, eventData);
                      }}
                    />
                  </div>                </MarqueeSelection>
              </SelectionContext.Provider>
            </FlowToolbar>
          </div>
        </SelfHostContext.Provider>

        {/* Generative Suggestion Dialog */}
        <GenerativeSuggestionDialog
          nodeId={selectedNodeId}
          isOpen={suggestionDialogOpen}
          onDismiss={() => setSuggestionDialogOpen(false)}
          onApplySuggestion={handleApplySuggestion}
          fetchSuggestions={fetchSuggestions}
        />
      </NodeRendererContext.Provider>
    </CacheProvider>
  );
};

export default VisualDesigner;
