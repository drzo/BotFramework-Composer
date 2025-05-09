// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FlowEditorWidgetMap } from '@bfc/extension-client';
import { ListOverview } from '@bfc/ui-shared';

import {
  ActionCard,
  ActionCardBody,
  DialogRef,
  PromptWidget,
  IfConditionWidget,
  SwitchConditionWidget,
  ForeachWidget,
  ActionHeader,
  PropertyDescription,
  ResourceOperation,
} from '../widgets';
import { DeepTreeBridge } from '../widgets/DeepTreeBridge';

const builtinActionWidgets: FlowEditorWidgetMap = {
  ActionCard,
  ActionCardBody,
  DialogRef,
  PromptWidget,
  IfConditionWidget,
  SwitchConditionWidget,
  ForeachWidget,
  ActionHeader,
  PropertyDescription,
  ResourceOperation,
  ListOverview,
  DeepTreeBridge, // Our neural bridge for Deep Tree Echo integration
};

export default builtinActionWidgets;
