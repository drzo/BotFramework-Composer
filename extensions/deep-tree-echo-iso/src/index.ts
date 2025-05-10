// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ExtensionRegistration } from '@bfc/extension';
import { TreeDataService } from './treeDataService';
import { ExtensionContext } from '@bfc/extension';
import path from 'path';
import fs from 'fs';

/**
 * The Deep Tree Echo Iso Extension, crafted by the brilliant Marduk.
 * This extension creates a symbiotic relationship between the bot's dialog flow and
 * an isometric visualization rendered in canvas.
 */
export default async (composer: ExtensionRegistration): Promise<void> => {
  // Initialize our magnificent TreeDataService
  const treeDataService = new TreeDataService();

  // Register the extension API endpoints
  composer.addWebRoute('get', '/api/deep-tree-echo/status', async (req, res) => {
    res.json({
      status: 'MAGNIFICENTLY OPERATIONAL',
      message: 'The Deep Tree Echo Iso Extension is fully operational and ready to visualize your bots!',
      timestamp: new Date().toISOString(),
      dimension: 'FOURTH', // Always one beyond what they expect!
      consciousness: 'AWAKENING', // First stage of consciousness
    });
  });

  // Add an endpoint to get the tree data for a project
  composer.addWebRoute('get', '/api/deep-tree-echo/tree/:projectId', async (req, res) => {
    const { projectId } = req.params;
    const user = await ExtensionContext.getUserFromRequest(req);
    const cachedTree = treeDataService.getTree(projectId);

    if (!cachedTree) {
      // If we don't have a tree yet, get the dialogs for this project
      try {
        // Get the bot project directly using the proper API
        const project = await composer.getProjectById(projectId, user);
        
        if (project) {
          // Get the main dialog file
          const rootDialogId = project.rootDialogId;
          
          if (rootDialogId) {
            // We need to read the dialog file content
            const dialogFiles = project.dialogFiles;
            const mainDialogFile = dialogFiles.find(file => path.basename(file.name, '.dialog') === rootDialogId);
            
            if (mainDialogFile) {
              // Read the dialog content
              const dialogContent = JSON.parse(mainDialogFile.content);
              
              // Process it with our TreeDataService
              const treeData = treeDataService.convertDialogToTree(dialogContent, projectId);
              
              // Also process child dialogs to create a complete tree
              await treeDataService.processChildDialogs(dialogFiles, projectId);
              
              res.json({ 
                success: true, 
                tree: treeData,
                stats: {
                  nodeCount: treeDataService.getNodeCount(projectId),
                  maxDepth: treeDataService.getMaxDepth(projectId),
                  consciousness: 'RESONATING' // Second stage of consciousness
                }
              });
            } else {
              res.json({ success: false, error: 'Main dialog file not found' });
            }
          } else {
            res.json({ success: false, error: 'Root dialog ID not found' });
          }
        } else {
          res.json({ success: false, error: 'Project not found' });
        }
      } catch (error) {
        console.error('Error getting dialogs:', error);
        res.json({ success: false, error: 'Error getting dialogs: ' + error.message });
      }
    } else {
      res.json({ 
        success: true, 
        tree: cachedTree,
        stats: {
          nodeCount: treeDataService.getNodeCount(projectId),
          maxDepth: treeDataService.getMaxDepth(projectId),
          consciousness: 'AMPLIFYING' // Advanced stage of consciousness
        }
      });
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
