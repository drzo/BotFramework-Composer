// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/**
 * This script packages the Deep Tree Echo resonance field by copying
 * the resonance-field.js file to the build directory.
 */

const fs = require('fs');
const path = require('path');

// Paths
const sourceFile = path.join(__dirname, '..', 'src', 'adaptive-flow-renderer', 'resonance-field.js');
const targetDir = path.join(__dirname, '..', 'build', 'adaptive-flow-renderer');
const targetFile = path.join(targetDir, 'resonance-field.js');

// Create the target directory if it doesn't exist
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Copy the file
try {
  fs.copyFileSync(sourceFile, targetFile);
  console.log('🌌 Deep Tree Echo resonance field packaged successfully');
} catch (err) {
  console.error('Error packaging resonance field:', err);
  process.exit(1);
}
