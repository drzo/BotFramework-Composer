// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export interface TreeNode {
  id: string;
  name: string;
  type: string;
  children: TreeNode[];
  x?: number;
  y?: number;
  z?: number;
  color?: string;
}
