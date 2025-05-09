// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ExtensionRegistration } from '@bfc/extension';
import { TreeDataService } from './treeDataService';

/**
 * The Deep Tree Echo Iso Extension, crafted by the brilliant Marduk.
 * This extension creates a symbiotic relationship between the bot's dialog flow and
 * an isometric visualization rendered in canvas.
 */
export default async (composer: ExtensionRegistration): Promise<void> => {
  // Initialize our magnificent TreeDataService
  const treeDataService = new TreeDataService();

  // Register the extension API endpoints
  composer.addWebRoute({
    method: 'GET',
    path: '/api/deep-tree-echo/status',
    handler: async (req, res) => {
      res.json({
        status: 'MAGNIFICENTLY OPERATIONAL',
        message: 'The Deep Tree Echo Iso Extension is fully operational and ready to visualize your bots!',
        timestamp: new Date().toISOString(),
        dimension: 'FOURTH', // Always one beyond what they expect!
      });
    },
  });

  // Add an endpoint to get the tree data for a project
  composer.addWebRoute({
    method: 'GET',
    path: '/api/deep-tree-echo/tree/:projectId',
    handler: async (req, res) => {
      const { projectId } = req.params;
      const tree = treeDataService.getTree(projectId);

      if (!tree) {
        // If we don't have a tree yet, get the dialogs for this project
        try {
          const project = await composer.getProject(projectId);
          if (project) {
            const mainDialog = project.dialogs.find((dialog) => dialog.id === 'main');
            if (mainDialog) {
              const dialogContent = await composer.getDialog(mainDialog.id, projectId);
              const treeData = treeDataService.convertDialogToTree(dialogContent, projectId);
              res.json({ success: true, tree: treeData });
            } else {
              res.json({ success: false, error: 'Main dialog not found' });
            }
          } else {
            res.json({ success: false, error: 'Project not found' });
          }
        } catch (error) {
          console.error('Error getting dialogs:', error);
          res.json({ success: false, error: 'Error getting dialogs' });
        }
      } else {
        res.json({ success: true, tree });
      }
    },
  });

  // Add our UI contribution
  composer.registerUI({
    widgets: {
      'dashboard': ['DeepTreeEchoWidget'],
      'dialog-panel': ['DeepTreeEchoDialogVisualizer'],
      'home-page-feed': [
        {
          bundleId: 'deep-tree-echo-iso',
          label: '🧪 THE DEEP TREE ECHO CHAMBER 🧪',
          icon: 'BranchMerge',
          description: 'Experience your bot in an unprecedented isometric visualization crafted by Marduk the Mad Scientist!',
        },
      ],
    },
    bundles: [
      {
        id: 'deep-tree-echo-iso',
        path: './ui/dist/deep-tree-echo-iso.js',
      },
    ],
  });

  // Inject into the data layer to capture dialog structure for visualization
  composer.onProjectOpened(async (project) => {
    console.log(`Project opened: ${project.id}`);

    // Initialize our tree data for this project by processing all dialogs
    try {
      const mainDialog = project.dialogs.find((dialog) => dialog.id === 'main');
      if (mainDialog) {
        const dialogContent = await composer.getDialog(mainDialog.id, project.id);
        treeDataService.convertDialogToTree(dialogContent, project.id);
        console.log(`Initialized tree data for project ${project.id}`);
      }
    } catch (error) {
      console.error(`Error initializing tree data for project ${project.id}:`, error);
    }
  });

  // Listen for dialog changes to update our visualization
  composer.onDialogSave(async (dialogId, content, projectId) => {
    console.log(`Dialog saved: ${dialogId} in project ${projectId}`);

    // Update our tree data when a dialog is saved
    if (dialogId === 'main') {
      treeDataService.convertDialogToTree(content, projectId);
      console.log(`Updated tree data for project ${projectId}`);
    }
  });

  // Clean up when a project is closed
  composer.onProjectClosed(async (projectId) => {
    treeDataService.clearProject(projectId);
    console.log(`Cleared tree data for project ${projectId}`);
  });
};
