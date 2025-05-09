// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/**
 * The TreeDataService is responsible for transforming dialog structures into the tree
 * visualization format needed by our Deep Tree Echo Iso implementation.
 */
export class TreeDataService {
  /**
   * Creates a new instance of the TreeDataService.
   */
  constructor() {
    this.rootNodes = new Map();
  }

  /**
   * A map of project IDs to root tree nodes.
   */
  private rootNodes: Map<string, any>;

  /**
   * Converts a dialog structure into a tree node hierarchy suitable for visualization.
   * This recursive algorithm captures the complex neural-like structure of bot dialogs.
   */
  public convertDialogToTree(dialog: any, projectId: string) {
    if (!dialog) return null;

    // Extract the basic node information
    const rootNode = {
      id: dialog.id || 'dialog_' + Math.random().toString(36).substring(2, 9),
      name: dialog.displayName || dialog.id || 'Dialog',
      type: 'dialog',
      children: [],
    };

    // Extract triggers as children
    if (dialog.triggers && Array.isArray(dialog.triggers)) {
      dialog.triggers.forEach((trigger) => {
        const triggerNode = {
          id: trigger.id || 'trigger_' + Math.random().toString(36).substring(2, 9),
          name: trigger.displayName || trigger.event || 'Trigger',
          type: 'trigger',
          children: [],
        };

        // Extract actions from the trigger
        if (trigger.actions && Array.isArray(trigger.actions)) {
          this.processActions(trigger.actions, triggerNode.children);
        }

        rootNode.children.push(triggerNode);
      });
    }

    // Store the root node for this project
    this.rootNodes.set(projectId, rootNode);

    return rootNode;
  }

  /**
   * Recursively processes actions and adds them to the children array.
   * This creates a complex neural network-like structure perfect for our isometric visualization.
   */
  private processActions(actions: any[], children: any[]) {
    if (!actions || !Array.isArray(actions)) return;

    actions.forEach((action) => {
      // Create a node for this action
      const actionNode = {
        id: action.$id || 'action_' + Math.random().toString(36).substring(2, 9),
        name: action.$kind?.split('.').pop() || 'Action',
        type: this.getNodeTypeFromKind(action.$kind),
        children: [],
      };

      // Process different action types
      if (action.$kind === 'Microsoft.IfCondition') {
        // For conditions, create children for the if/else branches
        if (action.actions && Array.isArray(action.actions)) {
          const ifBranch = {
            id: 'if_' + actionNode.id,
            name: 'If Branch',
            type: 'branch',
            children: [],
          };
          this.processActions(action.actions, ifBranch.children);
          actionNode.children.push(ifBranch);
        }

        if (action.elseActions && Array.isArray(action.elseActions)) {
          const elseBranch = {
            id: 'else_' + actionNode.id,
            name: 'Else Branch',
            type: 'branch',
            children: [],
          };
          this.processActions(action.elseActions, elseBranch.children);
          actionNode.children.push(elseBranch);
        }
      } else if (action.$kind === 'Microsoft.SwitchCondition') {
        // For switch, create a child for each case
        if (action.cases && Array.isArray(action.cases)) {
          action.cases.forEach((caseItem, index) => {
            const caseNode = {
              id: 'case_' + index + '_' + actionNode.id,
              name: 'Case: ' + (caseItem.value || index),
              type: 'branch',
              children: [],
            };

            if (caseItem.actions && Array.isArray(caseItem.actions)) {
              this.processActions(caseItem.actions, caseNode.children);
            }

            actionNode.children.push(caseNode);
          });
        }

        // Handle default case
        if (action.default && Array.isArray(action.default)) {
          const defaultNode = {
            id: 'default_' + actionNode.id,
            name: 'Default Case',
            type: 'branch',
            children: [],
          };

          this.processActions(action.default, defaultNode.children);
          actionNode.children.push(defaultNode);
        }
      } else if (action.$kind === 'Microsoft.Foreach' || action.$kind === 'Microsoft.ForeachPage') {
        // For loops, process the loop actions
        if (action.actions && Array.isArray(action.actions)) {
          this.processActions(action.actions, actionNode.children);
        }
      } else if (action.$kind === 'Microsoft.BeginDialog' || action.$kind === 'Microsoft.BeginSkill') {
        // For dialog calls, we can add a placeholder for the called dialog
        const dialogNode = {
          id: 'dialog_ref_' + actionNode.id,
          name: 'Dialog: ' + (action.dialog || 'Unknown'),
          type: 'dialogRef',
          children: [],
        };

        actionNode.children.push(dialogNode);
      }

      children.push(actionNode);
    });
  }

  /**
   * Determines the node type based on the action kind.
   * This helps us visualize different action types with different colors and shapes.
   */
  private getNodeTypeFromKind(kind: string): string {
    if (!kind) return 'unknown';

    if (kind.includes('Condition')) return 'condition';
    if (kind.includes('Dialog')) return 'dialog';
    if (kind.includes('Foreach') || kind.includes('Loop')) return 'loop';
    if (kind.includes('SetProperty') || kind.includes('SetProperties')) return 'property';
    if (kind.includes('Emit') || kind.includes('Event')) return 'event';
    if (kind.includes('Http')) return 'http';
    if (kind.includes('Ask')) return 'input';

    return 'action';
  }

  /**
   * Gets the tree for a specific project.
   */
  public getTree(projectId: string) {
    return this.rootNodes.get(projectId) || null;
  }

  /**
   * Clears the data for a specific project.
   */
  public clearProject(projectId: string) {
    this.rootNodes.delete(projectId);
  }
}
