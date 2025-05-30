// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/react';
import styled from '@emotion/styled';
import React, { useState, Fragment, useEffect } from 'react';
import formatMessage from 'format-message';
import {
  Link,
  DefaultButton,
  Pivot,
  PivotItem,
  Dialog,
  DialogType,
  Dropdown,
  MessageBar,
  MessageBarType,
  MessageBarButton,
  ScrollablePane,
  ScrollbarVisibility,
  Stack,
  SearchBox,
  IContextualMenuProps,
  IDropdownOption,
} from '@fluentui/react';
import {
  render,
  useHttpClient,
  useProjectApi,
  useApplicationApi,
  useTelemetryClient,
  TelemetryClient,
} from '@bfc/extension-client';
import { Toolbar, IToolbarItem, LoadingSpinner, DisplayMarkdownDialog, SplitButton } from '@bfc/ui-shared';
import ReactMarkdown from 'react-markdown';

import {
  ContentHeaderStyle,
  HeaderText,
  packageScrollContainerStyle,
  tabAndSearchBarStyles,
} from '../components/styles';
import { ImportDialog } from '../components/ImportDialog';
import { LibraryRef, LibraryList, LetterIcon } from '../components/LibraryList';
import { WorkingModal } from '../components/WorkingModal';
import { FeedModal } from '../components/FeedModal';
import { ProjectList } from '../components/projectList/ProjectList';

const docsUrl = `https://aka.ms/composer-package-manager-readme`;

export interface PackageSourceFeed extends IDropdownOption {
  name: string;
  key: string;
  url: string;
  type: string;
  defaultQuery?: {
    prerelease: boolean;
    semVerLevel: string;
    query: string;
  };
  readonly?: boolean;
}

const InstallButtonText = styled.span`
  overflow: hidden;
  display: inline-block;

  label: install-button-text;
`;

const InstallButtonVersion = styled.span`
  max-width: 80px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  display: inline-block;

  label: install-button-version;
`;

const tabsStackStyle = css`
  overflow: hidden auto;
  max-height: 100%;
  flex: auto;
  display: flex;
  flex-flow: column nowrap;
`;

const fieldStyles = {
  root: { maxWidth: '200px' },
};

const Library: React.FC = () => {
  const [items, setItems] = useState<LibraryRef[]>([]);
  const { projectId, reloadProject, projectCollection: allProjectCollection, stopBot } = useProjectApi();
  const { setApplicationLevelError, navigateTo, confirm } = useApplicationApi();
  const telemetryClient: TelemetryClient = useTelemetryClient();

  const projectCollection = allProjectCollection.filter((proj) => !proj.isRemote);

  const startingProjectId = allProjectCollection.find((proj) => proj.projectId === projectId).isRemote
    ? projectCollection[0].projectId // this should always exist, because there's always at least a root bot
    : projectId;

  const [ejectedRuntime, setEjectedRuntime] = useState<boolean>(false);
  const [availableLibraries, updateAvailableLibraries] = useState<LibraryRef[] | undefined>(undefined);
  const [installedComponents, updateInstalledComponents] = useState<LibraryRef[]>([]);
  const [isLoadingInstalled, setIsLoadingInstalled] = useState<boolean>(false);
  const [recentlyUsed, setRecentlyUsed] = useState<LibraryRef[]>([]);
  const [runtimeLanguage, setRuntimeLanguage] = useState<string>('c#');
  const [feeds, updateFeeds] = useState<PackageSourceFeed[]>([]);
  const [feed, setFeed] = useState<string | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<LibraryRef>();
  const [selectedItemVersions, setSelectedItemVersions] = useState<string[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<string>('');
  const [currentProjectId, setCurrentProjectId] = useState<string>(startingProjectId);
  const [working, setWorking] = useState<string>('');
  const [addDialogHidden, setAddDialogHidden] = useState(true);
  const [isModalVisible, setModalVisible] = useState<boolean>(false);
  const [readmeContent, setReadmeContent] = useState<string>('');
  const [versionOptions, setVersionOptions] = useState<IContextualMenuProps | undefined>(undefined);
  const [isUpdate, setIsUpdate] = useState<boolean>(false);
  const [readmeHidden, setReadmeHidden] = useState<boolean>(true);
  const httpClient = useHttpClient();
  const API_ROOT = '';
  const TABS = {
    INSTALL: 'INSTALL',
    BROWSE: 'BROWSE",',
  };
  const [currentTab, setCurrentTab] = useState<string>(TABS.BROWSE);
  const strings = {
    title: formatMessage('Package Manager'),
    editFeeds: formatMessage('Edit feeds'),
    description: formatMessage('Discover and use components that can be installed into your bot.'),
    descriptionLink: formatMessage('Learn more'),
    viewDocumentation: formatMessage('View documentation'),
    installButton: formatMessage('Install'),
    installToolbarButton: formatMessage('Add a package'),

    updateButton: formatMessage('Update to'),
    installed: formatMessage('installed'),
    importDialogTitle: formatMessage('Add a package'),
    installProgress: formatMessage('Installing package...'),
    uninstallProgress: formatMessage('Removing package...'),
    recentlyUsedCategory: formatMessage('Recently Used'),
    installedCategory: formatMessage('Installed'),
    updateConfirmationPrompt: formatMessage(
      'Any changes you made to this package will be lost! Are you sure you want to continue?',
    ),
    updateConfirmationTitle: formatMessage('Update Package'),
    conflictConfirmationTitle: formatMessage('Conflicting changes detected'),
    conflictConfirmationPrompt: formatMessage(
      'This operation will overwrite changes made to previously imported files. Do you want to proceed?',
    ),
    removeConfirmationTitle: formatMessage('Remove Package'),
    removeConfirmationPrompt: formatMessage(
      'Any changes you made to this package will be lost! In addition, this may leave your bot in a broken state. Are you sure you want to continue?',
    ),
    requireEject: formatMessage(
      'To install components, this project must have an ejected runtime. Please navigate to the project settings page, custom runtime section.',
    ),
    ejectRuntime: formatMessage('Eject Runtime'),
    noComponentsInstalled: formatMessage('No packages installed'),
    noComponentsFound: formatMessage('No packages found'),
    browseHeader: formatMessage('Browse'),
    installHeader: formatMessage('Installed'),
    libraryError: formatMessage('Package Manager Error'),
    importError: formatMessage('Install Error'),
    emptyPanel: formatMessage('Select an item from the list to view a detailed description.'),
  };

  const onChangeFeed = (ev, op, idx) => {
    setFeed(op.key);
    return true;
  };

  const installComponentAPI = (
    projectId: string,
    packageName: string,
    version: string,
    isUpdating: boolean,
    source: string,
  ) => {
    return httpClient.post(`${API_ROOT}/projects/${projectId}/import`, {
      package: packageName,
      version: version,
      source: source,
      isUpdating,
    });
  };

  const getLibraryAPI = () => {
    const feedUrl = `${API_ROOT}/feed?key=${feed}`;
    return httpClient.get(feedUrl);
  };

  const getSearchResults = () => {
    const feedUrl = `${API_ROOT}/feed?key=${feed}&term=${encodeURIComponent(searchTerm)}`;
    return httpClient.get(feedUrl);
  };

  const getFeeds = () => {
    return httpClient.get(`${API_ROOT}/feeds`);
  };

  const getInstalledComponentsAPI = (projectId: string) => {
    return httpClient.get(`${API_ROOT}/projects/${projectId}/installedComponents`);
  };

  const getReadmeAPI = (packageName: string) => {
    return httpClient.get(`${API_ROOT}/readme/${encodeURIComponent(packageName)}`);
  };

  const uninstallComponentAPI = (projectId: string, packageName: string) => {
    return httpClient.post(`${API_ROOT}/projects/${projectId}/unimport`, {
      package: packageName,
    });
  };

  const isCompatible = (component) => {
    return component.language === runtimeLanguage;
  };

  useEffect(() => {
    setCurrentProjectId(startingProjectId);
    getFeeds().then((feeds) => updateFeeds(feeds.data));
  }, []);

  useEffect(() => {
    getInstalledLibraries();
  }, [currentProjectId]);

  useEffect(() => {
    if (!feed && feeds.length) {
      if (runtimeLanguage === 'js') {
        setFeed('npm');
      } else {
        setFeed('nuget');
      }
    }
  }, [feeds, feeds, runtimeLanguage]);

  useEffect(() => {
    if (feed && feeds.length) {
      getLibraries();
    }
  }, [feed, feeds, searchTerm]);

  useEffect(() => {
    const settings = projectCollection.find((b) => b.projectId === currentProjectId)?.setting;
    if (settings?.runtime && settings.runtime.customRuntime === true && settings.runtime.path) {
      setEjectedRuntime(true);
      // detect programming language.
      // should one day be a dynamic property of the runtime or at least stored in the settings?
      if (settings.runtime.key === 'node-azurewebapp' || settings.runtime.key.startsWith('adaptive-runtime-js')) {
        setRuntimeLanguage('js');
      } else {
        setRuntimeLanguage('c#');
      }
    } else {
      setEjectedRuntime(false);
      updateInstalledComponents([]);
    }
  }, [projectCollection, currentProjectId]);

  useEffect(() => {
    const items: any[] = [];

    // find all categories listed in the available libraries
    if (availableLibraries) {
      const availableCompatibleLibraries = availableLibraries;
      availableCompatibleLibraries.forEach((item) => {
        item.isCompatible = isCompatible(item);
        items.push(item);
      });
    }

    setItems(items);
  }, [installedComponents, availableLibraries, recentlyUsed]);

  useEffect(() => {
    if (selectedItem) {
      if (selectedItem.language === 'js') {
        // fetch the extended readme from npm
        try {
          getReadmeAPI(selectedItem.name).then((res) => {
            // TODO: also process available versions, should be in payload
            if (res.data.readme) {
              setReadmeContent(res.data.readme);
            } else {
              setReadmeContent(selectedItem.description);
            }
          });
        } catch (err) {
          console.error(err);
          setReadmeContent(selectedItem.description);
        }
      } else {
        setReadmeContent(selectedItem.description);
        let availversions;
        let setversion;

        if (selectedItem?.versions?.length) {
          availversions = selectedItem.versions;
        } else {
          availversions = [selectedItem.version];
        }

        setversion = availversions[0];

        // default is that this not an update
        setIsUpdate(false);

        // is this item already installed?  If so, set the selectedVersion to the INSTALLED version
        if (isInstalled(selectedItem)) {
          // Check if this is the newest, or if an update might be available
          const indexOfVersion = availversions.indexOf(installedVersion(selectedItem));

          if (indexOfVersion > 0) {
            // there is an update!
            setversion = availversions[0];
            setIsUpdate(true);
          } else {
            // this is the latest version
            setversion = installedVersion(selectedItem);
          }
        }

        setSelectedItemVersions(availversions);
        setSelectedVersion(setversion);
      }
    } else {
      setReadmeContent('');
    }
  }, [selectedItem, installedComponents]);

  useEffect(() => {
    if (selectedItemVersions.length > 1) {
      let installed = null;
      if (isInstalled(selectedItem)) {
        installed = installedVersion(selectedItem);
        const indexOfInstalledVersion = selectedItemVersions.indexOf(installed);
        const indexOfSelectedVersion = selectedItemVersions.indexOf(selectedVersion);

        if (indexOfInstalledVersion > 0) {
          if (indexOfInstalledVersion > indexOfSelectedVersion) {
            setIsUpdate(true);
          } else {
            setIsUpdate(false);
          }
        }
      }
      setVersionOptions({
        items: selectedItemVersions.map((v) => {
          return {
            key: v,
            text: installed && installed === v ? `${v} (${strings.installed})` : v,
            disabled: installed && installed === v,
            iconProps: { iconName: v === selectedVersion ? 'Checkmark' : '' },
          };
        }),
        onItemClick: (ev, item) => setSelectedVersion(item.key),
      });
    } else {
      setVersionOptions(undefined);
    }
  }, [selectedItemVersions, selectedVersion, installedComponents]);

  const toolbarItems: IToolbarItem[] = [
    {
      type: 'action',
      text: strings.installToolbarButton,
      buttonProps: {
        iconProps: {
          iconName: 'Add',
        },
        onClick: () => setAddDialogHidden(false),
      },
      align: 'left',
      dataTestid: 'publishPage-ToolBar-Add',
      disabled: !ejectedRuntime,
    },
    {
      type: 'action',
      text: strings.editFeeds,
      buttonProps: {
        iconProps: {
          iconName: 'SingleColumnEdit',
        },
        onClick: () => setModalVisible(true),
      },
      align: 'left',
      dataTestid: 'publishPage-ToolBar-EditFeeds',
    },
  ];

  const closeDialog = () => {
    setAddDialogHidden(true);
  };

  const importFromWeb = async (packageName, version, isUpdating, source) => {
    const existing = installedComponents?.find((l) => l.name === packageName);
    let okToProceed = true;
    if (existing) {
      const title = strings.updateConfirmationTitle;
      const msg = strings.updateConfirmationPrompt;
      okToProceed = await confirm(title, msg);
    }

    if (okToProceed) {
      closeDialog();
      setWorking(strings.installProgress);
      await importComponent(packageName, version, isUpdating || false, source);
      setWorking('');
    }
  };

  const importComponent = async (packageName, version, isUpdating, source) => {
    try {
      stopBot(currentProjectId);
      const results = await installComponentAPI(currentProjectId, packageName, version, isUpdating, source);

      // check to see if there was a conflict that requires confirmation
      if (results.data.success === false) {
        telemetryClient.track('PackageInstallConflictFound', {
          package: packageName,
          version: version,
          isUpdate: isUpdating,
        });

        const title = strings.conflictConfirmationTitle;
        const msg = strings.conflictConfirmationPrompt;
        if (await confirm(title, msg)) {
          telemetryClient.track('PackageInstallConflictResolved', {
            package: packageName,
            version: version,
            isUpdate: isUpdating,
          });
          await installComponentAPI(currentProjectId, packageName, version, true, source);
        }
      } else {
        telemetryClient.track('PackageInstalled', { package: packageName, version: version, isUpdate: isUpdating });
        setWorking('');
        updateInstalledComponents(results.data.components);

        await reloadProject();

        // find newly installed item
        // and pop up the readme if one exists.
        const newItem = results.data.components.find((i) => i.name === packageName);
        if (newItem?.readme) {
          setSelectedItem(newItem);
          setReadmeHidden(false);
        }
      }
    } catch (err) {
      telemetryClient.track('PackageInstallFailed', { package: packageName, version: version, isUpdate: isUpdating });

      console.error(err);
      setApplicationLevelError({
        status: err?.response?.status,
        message: err?.response?.data?.message || err,
        summary: strings.importError,
      });
    }
  };

  // return true if the name, description or any of the keywords match the search term
  const applySearchTerm = (item: LibraryRef): boolean => {
    // eslint-disable-next-line security/detect-non-literal-regexp
    const term = new RegExp(searchTerm.trim().toLocaleLowerCase());
    if (
      item.name.toLowerCase().match(term) ||
      item.description.toLowerCase().match(term) ||
      item.keywords.filter((tag) => tag.toLowerCase().match(term)).length
    )
      return true;
    return false;
  };

  const getLibraries = async () => {
    try {
      updateAvailableLibraries(undefined);
      setLoading(true);
      if (searchTerm) {
        telemetryClient.track('PackageSearch', { term: searchTerm });

        const response = await getSearchResults();
        // if we are searching, apply a local filter
        response.data.available = response.data.available.filter(applySearchTerm);
        updateAvailableLibraries(response.data.available);
        setRecentlyUsed(response.data.recentlyUsed);
      } else {
        const response = await getLibraryAPI();
        updateAvailableLibraries(response.data.available);
        setRecentlyUsed(response.data.recentlyUsed);
      }
    } catch (err) {
      setApplicationLevelError({
        status: err.response.status,
        message: err?.response?.data?.message ?? err,
        summary: strings.libraryError,
      });
    } finally {
      setLoading(false);
    }
  };

  const getInstalledLibraries = async () => {
    if (!isLoadingInstalled) {
      setIsLoadingInstalled(true);
      try {
        updateInstalledComponents([]);
        const response = await getInstalledComponentsAPI(currentProjectId);
        updateInstalledComponents(response.data.components);
      } catch (err) {
        setApplicationLevelError({
          status: err.response.status,
          message: err?.response?.data?.message ?? err,
          summary: strings.libraryError,
        });
      }
      setIsLoadingInstalled(false);
    }
  };

  const install = async () => {
    return importFromWeb(selectedItem?.name, selectedVersion, false, feeds.find((f) => f.key == feed).url);
  };

  const redownload = async () => {
    return importFromWeb(selectedItem?.name, selectedVersion, true, feed);
  };

  const removeComponent = async () => {
    if (selectedItem) {
      const title = strings.removeConfirmationTitle;
      const msg = strings.removeConfirmationPrompt;
      const okToProceed = await confirm(title, msg);
      if (okToProceed) {
        closeDialog();
        setWorking(strings.uninstallProgress);
        try {
          stopBot(currentProjectId);
          const results = await uninstallComponentAPI(currentProjectId, selectedItem.name);

          if (results.data.success) {
            telemetryClient.track('PackageUninstalled', { package: selectedItem.name });

            updateInstalledComponents(results.data.components);
          } else {
            throw new Error(results.data.message);
          }

          // reload modified content
          await reloadProject();
        } catch (err) {
          telemetryClient.track('PackageUninstallFailed', { package: selectedItem.name });

          if (err.response) {
            setApplicationLevelError({
              status: err.response.status,
              message: err?.response?.data?.message ?? err,
              summary: strings.importError,
            });
          } else {
            setApplicationLevelError(err);
          }
        }
        setWorking('');
      }
    }
  };

  const isInstalled = (item: LibraryRef): boolean => {
    return installedComponents?.find((l) => l.name === item.name) != undefined;
  };

  const installedVersion = (item: LibraryRef): string => {
    const installedItem = installedComponents?.find((l) => l.name === item.name);
    return installedItem?.version ?? '';
  };

  const selectItem = (item: LibraryRef | null) => {
    if (item) {
      setSelectedItem(item);
    } else {
      setSelectedItem(undefined);
    }
  };

  const navigateToEject = (evt: any): void => {
    navigateTo(`/bot/${currentProjectId}/botProjectsSettings/#runtimeSettings`);
  };

  const updateFeed = async (feeds: PackageSourceFeed[]) => {
    const response = await httpClient.post(`${API_ROOT}/feeds`, {
      feeds,
    });

    // update the list of feeds in the component state
    updateFeeds(response.data);
  };

  const InstallButton = (versionOptions != undefined ? SplitButton : DefaultButton) as typeof DefaultButton;

  return (
    <ScrollablePane scrollbarVisibility={ScrollbarVisibility.auto}>
      <Dialog
        dialogContentProps={{
          title: strings.importDialogTitle,
          type: DialogType.normal,
        }}
        hidden={addDialogHidden}
        minWidth={450}
        modalProps={{ isBlocking: true, isClickableOutsideFocusTrap: true }}
        onDismiss={closeDialog}
      >
        <ImportDialog closeDialog={closeDialog} doImport={importFromWeb} />
      </Dialog>
      <WorkingModal hidden={working === ''} title={working} />
      <FeedModal
        closeDialog={() => setModalVisible(false)}
        feeds={feeds}
        hidden={!isModalVisible}
        onUpdateFeed={updateFeed}
      />
      {selectedItem && (
        <DisplayMarkdownDialog
          content={selectedItem?.readme}
          hidden={readmeHidden || !selectedItem?.readme}
          title={'Project Readme'}
          onDismiss={() => {
            setReadmeHidden(true);
          }}
        />
      )}
      <Toolbar toolbarItems={toolbarItems} />
      <div css={ContentHeaderStyle}>
        <h1 css={HeaderText}>{strings.title}</h1>
        <p>
          {strings.description}&nbsp;
          <Link href={docsUrl} target="_new">
            {strings.descriptionLink}
          </Link>
        </p>
      </div>
      <Stack horizontal verticalFill styles={packageScrollContainerStyle}>
        {projectCollection && projectCollection.length > 1 && (
          <Stack.Item styles={{ root: { width: '175px', borderRight: '1px solid #CCC' } }}>
            <ProjectList
              defaultSelected={projectId}
              projectCollection={projectCollection}
              onSelect={(link) => setCurrentProjectId(link.projectId)}
            />
          </Stack.Item>
        )}
        <Stack.Item align="stretch" css={tabsStackStyle}>
          {!ejectedRuntime && (
            <MessageBar
              actions={
                <div>
                  <MessageBarButton onClick={navigateToEject}>{strings.ejectRuntime}</MessageBarButton>
                </div>
              }
              isMultiline={false}
              messageBarType={MessageBarType.warning}
            >
              {strings.requireEject}
            </MessageBar>
          )}

          {/* ***************************************************************************
           *  This is the top nav that includes the tabs and search bar
           ****************************************************************************/}

          <Stack horizontal styles={tabAndSearchBarStyles}>
            <Stack.Item align="stretch">
              <Pivot aria-label="Library Views" onLinkClick={(item: PivotItem) => setCurrentTab(item.props.itemKey)}>
                <PivotItem headerText={strings.browseHeader} itemKey={TABS.BROWSE} />
                <PivotItem headerText={strings.installHeader} itemKey={TABS.INSTALL} />
              </Pivot>
            </Stack.Item>
            <Stack.Item align="center" grow={1}>
              <Stack horizontal grow={1} horizontalAlign="end" tokens={{ childrenGap: 10 }} verticalAlign="center">
                <Stack.Item>
                  <Dropdown
                    ariaLabel={formatMessage('Feeds')}
                    hidden={currentTab !== TABS.BROWSE}
                    options={feeds}
                    placeholder="Format"
                    selectedKey={feed}
                    styles={fieldStyles}
                    onChange={onChangeFeed}
                  ></Dropdown>
                </Stack.Item>
                <Stack.Item>
                  <SearchBox
                    disabled={!feeds || !feed || (!searchTerm && items.length === 0)}
                    placeholder="Search"
                    styles={fieldStyles}
                    onClear={() => setSearchTerm('')}
                    onSearch={setSearchTerm}
                  />
                </Stack.Item>
              </Stack>
            </Stack.Item>
          </Stack>

          {/* ***************************************************************************
           *  This is the browse tab
           ****************************************************************************/}

          {currentTab === TABS.BROWSE && (
            <Fragment>
              {loading && <LoadingSpinner />}
              {items?.length ? (
                <LibraryList
                  disabled={!ejectedRuntime}
                  install={install}
                  isInstalled={isInstalled}
                  items={items}
                  redownload={redownload}
                  removeLibrary={removeComponent}
                  updateItems={setItems}
                  onItemClick={selectItem}
                />
              ) : null}
              {items && !items.length && !loading && (
                <div
                  style={{
                    marginLeft: '50px',
                    fontSize: 'smaller',
                    marginTop: '20px',
                  }}
                >
                  {strings.noComponentsFound}
                </div>
              )}
            </Fragment>
          )}

          {/* ***************************************************************************
           *  This is the installed tab
           ****************************************************************************/}

          {currentTab === TABS.INSTALL && (
            <Fragment>
              <LibraryList
                disabled={!ejectedRuntime}
                install={install}
                isInstalled={isInstalled}
                items={installedComponents}
                redownload={redownload}
                removeLibrary={removeComponent}
                updateItems={setItems}
                onItemClick={selectItem}
              />
              {(!installedComponents || installedComponents.length === 0) && (
                <div
                  style={{
                    marginLeft: '50px',
                    fontSize: 'smaller',
                    marginTop: '20px',
                  }}
                >
                  {strings.noComponentsInstalled}
                </div>
              )}
            </Fragment>
          )}
        </Stack.Item>

        {/* ***************************************************************************
         *  This is the details pane
         ****************************************************************************/}

        <Stack.Item
          disableShrink
          grow={0}
          shrink={0}
          styles={{
            root: {
              width: '400px',
              padding: '10px 20px',
              borderLeft: '1px solid #CCC',
              overflowX: 'auto',
              maxHeight: '100%',
            },
          }}
        >
          {selectedItem ? (
            <Fragment>
              <Stack horizontal tokens={{ childrenGap: 10 }}>
                <Stack.Item align="center" grow={0} styles={{ root: { width: 32 } }}>
                  {selectedItem.iconUrl ? (
                    <img alt="icon" height="32" src={selectedItem.iconUrl} width="32" />
                  ) : (
                    <LetterIcon letter={selectedItem.name[0]} />
                  )}
                </Stack.Item>
                <Stack.Item align="center" grow={1} styles={{ root: { width: 140 } }}>
                  {selectedItem.authors}
                </Stack.Item>
                <Stack.Item align="center" grow={1} styles={{ root: { textAlign: 'right' } }}>
                  <InstallButton
                    primary
                    disabled={!ejectedRuntime || !selectedItem.isCompatible}
                    menuProps={versionOptions}
                    split={versionOptions != undefined}
                    splitButtonAriaLabel="See install options"
                    onClick={install}
                  >
                    {/* display "v1.0 installed" if installed, or "install v1.1" if not" */}
                    {isInstalled(selectedItem) && selectedVersion === installedVersion(selectedItem) ? (
                      <span>
                        <InstallButtonVersion>{selectedVersion}</InstallButtonVersion>&nbsp;
                        <InstallButtonText>{strings.installed}</InstallButtonText>
                      </span>
                    ) : isUpdate ? (
                      <span>
                        <InstallButtonText>{strings.updateButton}</InstallButtonText>&nbsp;
                        <InstallButtonVersion>{selectedVersion}</InstallButtonVersion>
                      </span>
                    ) : (
                      <span>
                        <InstallButtonText>{strings.installButton}</InstallButtonText>&nbsp;
                        <InstallButtonVersion>{selectedVersion}</InstallButtonVersion>
                      </span>
                    )}
                  </InstallButton>
                </Stack.Item>
              </Stack>

              <h3 css={{ marginBottom: 0 }}>{selectedItem.name}</h3>

              {isInstalled(selectedItem) ? (
                <p css={{ marginTop: 0 }}>
                  {formatMessage('Installed:')} {installedVersion(selectedItem)}
                </p>
              ) : (
                <p css={{ marginTop: 0 }}>
                  {formatMessage('Latest:')} {selectedItem.version}
                </p>
              )}

              {readmeContent && <ReactMarkdown>{readmeContent}</ReactMarkdown>}

              {selectedItem.repository && (
                <p>
                  <Link href={selectedItem.repository} target="_docs">
                    {strings.viewDocumentation}
                  </Link>
                </p>
              )}

              {selectedItem.readme && (
                <DefaultButton
                  styles={{ root: { marginRight: 20 } }}
                  onClick={() => {
                    setReadmeHidden(false);
                  }}
                >
                  {formatMessage('View readme')}
                </DefaultButton>
              )}
              {isInstalled(selectedItem) && <DefaultButton onClick={removeComponent}>Uninstall</DefaultButton>}
            </Fragment>
          ) : (
            <Fragment>
              <p>{strings.emptyPanel}</p>
            </Fragment>
          )}
        </Stack.Item>
      </Stack>
    </ScrollablePane>
  );
};

render(<Library />);
