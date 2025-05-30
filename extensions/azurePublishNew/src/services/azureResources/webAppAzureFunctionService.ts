// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { WebSiteManagementClient } from '@azure/arm-appservice';
import { TokenCredentials } from '@azure/ms-rest-js';

import { throwNotImplementedError } from '../throwNotImplementedError';

const createWebAppAzureFunctionService = (token: string, subscriptionId: string) => {
  const tokenCredentials = new TokenCredentials(token);
  // @ts-expect-error types missmatch
  const webSiteManagementClient = new WebSiteManagementClient(tokenCredentials, subscriptionId);

  const checkNameAvailability = async () => {
    throwNotImplementedError();
  };

  const create = async () => {
    throwNotImplementedError();
  };

  const deleteMethod = async () => {
    throwNotImplementedError();
  };

  const get = async () => {
    throwNotImplementedError();
  };

  const list = async () => {
    throwNotImplementedError();
  };

  const listByResourceGroup = async () => {
    throwNotImplementedError();
  };

  const update = async () => {
    throwNotImplementedError();
  };

  /**
   * Creates or updates a Azure Function WebApp for given resource group
   */
  const provision = async () => {
    throwNotImplementedError();
  };

  return {
    checkNameAvailability,
    create,
    deleteMethod,
    get,
    list,
    listByResourceGroup,
    provision,
    update,
  };
};

export type WebAppAzureFunctionService = ReturnType<typeof createWebAppAzureFunctionService>;
