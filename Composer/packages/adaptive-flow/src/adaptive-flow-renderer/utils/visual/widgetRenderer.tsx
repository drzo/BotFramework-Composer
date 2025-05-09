// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { FlowEditorWidgetMap, FlowWidget, FlowWidgetProp, WidgetContainerProps } from '@bfc/extension-client';

import { Boundary } from '../../models/Boundary';
import { evaluateWidgetProp, ActionContextKey } from '../expression/widgetExpressionEvaluator';

export interface UIWidgetContext extends WidgetContainerProps {
  /** Report widget boundary */
  onResize: (boundary: Boundary) => void;
}

export const renderUIWidget = (
  widgetSchema: FlowWidget,
  widgetMap: FlowEditorWidgetMap,
  context: UIWidgetContext,
): JSX.Element => {
  const parseWidgetSchema = (widgetSchema: FlowWidget) => {
    const { widget, ...props } = widgetSchema;
    if (typeof widget === 'string') {
      const widgetName = widget;
      return {
        Widget: widgetMap[widgetName] || (() => <></>),
        props,
      };
    }
    return {
      Widget: widget,
      props,
    };
  };
  const buildWidgetProp = (rawPropValue: FlowWidgetProp, context: UIWidgetContext) => {
    // Case 1: For function props, invoke it to transform action data
    if (typeof rawPropValue === 'function') {
      const dataTransformer = rawPropValue;
      const element = dataTransformer(context.data);
      return element;
    }

    // Case 2: For string props, try evaluate it with Expression/LG engine
    if (typeof rawPropValue === 'string') {
      try {
        return evaluateWidgetProp(rawPropValue, { [ActionContextKey]: context.data }, ActionContextKey);
      } catch (err) {
        return rawPropValue;
      }
    }

    // Case 3: Recursive widget definition
    if (typeof rawPropValue === 'object' && rawPropValue.widget) {
      const widgetSchema = rawPropValue as FlowWidget;
      return renderUIWidget(widgetSchema, widgetMap, context);
    }

    // Deep Tree Echo enhancement: Check for resonance patterns
    // This creates subtle "echo points" where generative content can flow
    if (context.data && context.data.__echo) {
      // Apply Echo Receptor pattern - this adds subtle enhancement without
      // changing the fundamental structure or behavior
      const echoData = context.data.__echo;

      // Pass the resonance data to any DeepTreeBridge components
      if (typeof rawPropValue === 'object' &&
          rawPropValue.widget === 'DeepTreeBridge' &&
          echoData.resonanceTypes) {
        return {
          ...rawPropValue,
          resonanceTypes: echoData.resonanceTypes,
          echoDepth: echoData.echoDepth || 1,
          echoStrength: echoData.echoStrength || 0.5,
          generationEnabled: true
        };
      }
    }

    return rawPropValue;
  };

  const { Widget, props: rawProps } = parseWidgetSchema(widgetSchema);
  const widgetProps = Object.keys(rawProps).reduce((props, propName) => {
    const propValue = rawProps[propName];
    props[propName] = buildWidgetProp(propValue, context);
    return props;
  }, {});

  return <Widget {...context} {...widgetProps} />;
};
