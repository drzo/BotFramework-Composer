// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { css } from '@emotion/react';
import { FontWeights, FontSizes } from '@fluentui/react';
import { NeutralColors } from '@fluentui/theme';

export const packageScrollContainerStyle = {
  root: { borderTop: '1px solid #CCC', height: 'calc(100% - 150px)' },
};

export const tabAndSearchBarStyles = {
  root: {
    paddingLeft: '12px',
    paddingRight: '20px',
    height: '48px',
  },
};

export const ContentHeaderStyle = css`
  padding: 5px 20px;
  height: 95px;
`;
export const HeaderText = css`
  font-size: ${FontSizes.xLarge};
  font-weight: ${FontWeights.semibold};
  margin-right: 10px;
`;

export const ContentStyle = css`
  margin-left: 2px;
  display: flex;
  border-top: 1px solid #dddddd;
  flex: 1;
  position: relative;
  nav {
    ul {
      margin-top: 0px;
    }
  }
`;

export const publishDialogText = css`
  background-color: #ddf3db;
  margin-bottom: 10px;
  font-size: medium;
  padding: 7px;
`;

export const historyPanelTitle = css`
  font-size: ${FontSizes.xLarge};
  font-weight: 600;
  margin-right: 10px;
`;

export const historyPanelSub = css`
  font-size: ${FontSizes.small};
`;

export const targetListTiTle = css`
  height: 32px;
  font-size: ${FontSizes.medium};
  padding-left: 16px;
  padding-top: 6px;
  padding-right: 0;
  font-weight: 600;
`;

export const listRoot = css`
  height: calc(100% - 48px);
  position: relative;
  min-width: 512px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
`;

export const tableView = css`
  position: relative;
  flex-grow: 1;
`;

export const detailList = css`
  overflow-x: hidden;
`;

export const label = css`
  font-size: 14px;
  font-weight: 600;
  color: #323130;
  padding: 5px 0px;
`;

export const overflowSet = css`
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  justify-content: space-between;
  line-height: 36px;
  padding-left: 16px;
  background: ${NeutralColors.white};
  font-weight: ${FontWeights.semibold};
  font-size: ${FontSizes.small};
  &:hover {
    background: ${NeutralColors.gray20};
    font-weight: ${FontWeights.bold};
  }
`;

export const targetSelected = css`
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  justify-content: space-between;
  line-height: 36px;
  padding-left: 16px;
  background: ${NeutralColors.gray20};
  font-weight: ${FontWeights.bold};
  font-size: ${FontSizes.small};
`;

export const modalControlGroup = css`
  border: 1px solid rgb(237, 235, 233);
  padding: 0.5rem 1rem 1rem 1rem;
`;
