// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/react';
import React, { useState, useEffect } from 'react';
import { FontIcon } from '@fluentui/react/lib/Icon';
import { DefaultButton, PrimaryButton } from '@fluentui/react/lib/Button';
import { Dialog, DialogType, DialogFooter } from '@fluentui/react/lib/Dialog';
import { Spinner, SpinnerSize } from '@fluentui/react/lib/Spinner';
import { Text } from '@fluentui/react/lib/Text';
import { Pivot, PivotItem } from '@fluentui/react/lib/Pivot';

import { EchoSuggestion, EchoPattern, EchoResponse } from '../services/DeepTreeEchoService';

interface GenerativeSuggestionProps {
  nodeId: string;
  isOpen: boolean;
  onDismiss: () => void;
  onApplySuggestion: (suggestion: EchoSuggestion) => void;
  fetchSuggestions: (nodeId: string) => Promise<EchoResponse | null>;
}

const styles = {
  root: css`
    min-width: 500px;
    max-width: 600px;
  `,
  suggestionItem: css`
    padding: 12px;
    margin-bottom: 12px;
    border: 1px solid #edebe9;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      border-color: #0078d4;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    }
  `,
  selectedSuggestion: css`
    border-color: #0078d4;
    background-color: #f3f9fd;
  `,
  confidence: css`
    display: flex;
    align-items: center;
    margin-top: 8px;
    font-size: 12px;
    color: #605e5c;
  `,
  confidenceBar: css`
    height: 4px;
    background-color: #edebe9;
    flex-grow: 1;
    margin: 0 8px;
    border-radius: 2px;
    overflow: hidden;
  `,
  confidenceFill: (confidence: number) => css`
    height: 100%;
    width: ${confidence * 100}%;
    background-color: ${confidence > 0.7 ? '#107c10' : confidence > 0.4 ? '#ffaa44' : '#d13438'};
  `,
  patternItem: css`
    padding: 8px;
    margin-bottom: 8px;
    background-color: #f3f9fd;
    border-radius: 4px;
    font-size: 13px;
  `,
  patternName: css`
    font-weight: 600;
    margin-bottom: 4px;
  `,
  patternPaths: css`
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  `,
  patternPath: css`
    background-color: #e1dfdd;
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 12px;
  `,
  header: css`
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
  `,
  icon: css`
    font-size: 20px;
    color: #5c2e91;
  `,
  metaInfo: css`
    font-size: 12px;
    color: #605e5c;
    margin-top: 16px;
    padding-top: 8px;
    border-top: 1px solid #edebe9;
  `
};

// A dialog component that displays generative suggestions for a dialog node
export const GenerativeSuggestionDialog: React.FC<GenerativeSuggestionProps> = (props) => {
  const { nodeId, isOpen, onDismiss, onApplySuggestion, fetchSuggestions } = props;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<EchoSuggestion[]>([]);
  const [patterns, setPatterns] = useState<EchoPattern[]>([]);
  const [meta, setMeta] = useState<EchoResponse['meta'] | null>(null);
  const [selectedSuggestion, setSelectedSuggestion] = useState<EchoSuggestion | null>(null);

  // Fetch suggestions when the dialog opens
  useEffect(() => {
    if (isOpen && nodeId) {
      setIsLoading(true);
      setError(null);

      fetchSuggestions(nodeId)
        .then(response => {
          if (response) {
            setSuggestions(response.suggestions);
            setPatterns(response.patterns);
            setMeta(response.meta);

            // Auto-select the first suggestion if available
            if (response.suggestions.length > 0) {
              setSelectedSuggestion(response.suggestions[0]);
            }
          } else {
            setError('No suggestions available for this node.');
          }
        })
        .catch(err => {
          console.error('Error fetching suggestions:', err);
          setError('Error fetching suggestions. Please try again.');
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isOpen, nodeId, fetchSuggestions]);

  // Handle applying a suggestion
  const handleApply = () => {
    if (selectedSuggestion) {
      onApplySuggestion(selectedSuggestion);
      onDismiss();
    }
  };

  // Render suggestion items
  const renderSuggestionItem = (suggestion: EchoSuggestion, index: number) => {
    const isSelected = selectedSuggestion === suggestion;

    return (
      <div
        key={index}
        css={[styles.suggestionItem, isSelected && styles.selectedSuggestion]}
        onClick={() => setSelectedSuggestion(suggestion)}
      >
        <div css={{ display: 'flex', justifyContent: 'space-between' }}>
          <Text variant="mediumPlus">{suggestion.description}</Text>
          <Text variant="small" css={{ color: '#605e5c' }}>
            {suggestion.type === 'enhancement' && <span><FontIcon iconName="EditNote" /> Enhancement</span>}
            {suggestion.type === 'completion' && <span><FontIcon iconName="CompletionField" /> Completion</span>}
            {suggestion.type === 'alternative' && <span><FontIcon iconName="SwitcherStartEnd" /> Alternative</span>}
            {suggestion.type === 'branch' && <span><FontIcon iconName="BranchFork2" /> Branch</span>}
          </Text>
        </div>

        <div css={styles.confidence}>
          <span>Confidence:</span>
          <div css={styles.confidenceBar}>
            <div css={styles.confidenceFill(suggestion.confidence)} />
          </div>
          <span>{Math.round(suggestion.confidence * 100)}%</span>
        </div>

        {isSelected && (
          <div css={{ marginTop: 12, fontSize: 13 }}>
            <Text variant="small">
              This suggestion will add or modify content in your dialog.
            </Text>
          </div>
        )}
      </div>
    );
  };

  // Render pattern items
  const renderPatternItem = (pattern: EchoPattern, index: number) => {
    return (
      <div key={index} css={styles.patternItem}>
        <div css={styles.patternName}>{pattern.name}</div>
        <div css={{ fontSize: 12, marginBottom: 4 }}>
          Frequency: {Math.round(pattern.frequency * 100)}%
        </div>
        <div css={styles.patternPaths}>
          {pattern.dialogPaths.map((path, i) => (
            <span key={i} css={styles.patternPath}>{path}</span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Dialog
      hidden={!isOpen}
      onDismiss={onDismiss}
      dialogContentProps={{
        type: DialogType.normal,
        title: 'Generative Suggestions',
        subText: 'AI-generated suggestions to enhance your dialog'
      }}
      modalProps={{
        isBlocking: false,
        styles: { main: { maxWidth: 600 } }
      }}
    >
      <div css={styles.root}>
        <div css={styles.header}>
          <FontIcon iconName="Lightbulb" css={styles.icon} />
          <Text variant="large">Dialog Enhancement Suggestions</Text>
        </div>

        {isLoading ? (
          <div css={{ textAlign: 'center', padding: 20 }}>
            <Spinner size={SpinnerSize.large} label="Generating suggestions..." />
          </div>
        ) : error ? (
          <div css={{ padding: 20, color: '#d13438' }}>
            {error}
          </div>
        ) : (
          <Pivot>
            <PivotItem headerText="Suggestions" itemIcon="Lightbulb">
              <div css={{ padding: '12px 0' }}>
                {suggestions.length === 0 ? (
                  <div css={{ padding: 20, textAlign: 'center' }}>
                    <Text>No suggestions available for this node.</Text>
                  </div>
                ) : (
                  <div>
                    {suggestions.map(renderSuggestionItem)}
                  </div>
                )}
              </div>
            </PivotItem>

            <PivotItem headerText="Patterns" itemIcon="BranchMerge">
              <div css={{ padding: '12px 0' }}>
                {patterns.length === 0 ? (
                  <div css={{ padding: 20, textAlign: 'center' }}>
                    <Text>No patterns detected for this node.</Text>
                  </div>
                ) : (
                  <div>
                    {patterns.map(renderPatternItem)}
                  </div>
                )}
              </div>
            </PivotItem>
          </Pivot>
        )}

        {meta && !isLoading && !error && (
          <div css={styles.metaInfo}>
            Processing time: {meta.processingTime}ms |
            Resonance score: {Math.round(meta.resonanceScore * 100)}% |
            Overall confidence: {Math.round(meta.confidence * 100)}%
          </div>
        )}

        <DialogFooter>
          <DefaultButton onClick={onDismiss} text="Cancel" />
          <PrimaryButton
            onClick={handleApply}
            text="Apply Suggestion"
            disabled={isLoading || !!error || !selectedSuggestion}
          />
        </DialogFooter>
      </div>
    </Dialog>
  );
};
