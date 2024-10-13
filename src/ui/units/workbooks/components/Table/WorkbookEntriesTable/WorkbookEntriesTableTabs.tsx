import React from 'react';

import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {EntryScope} from 'shared';
import {PlaceholderIllustration} from 'ui/components/PlaceholderIllustration/PlaceholderIllustration';
import {DL} from 'ui/constants/common';
import {CreateEntryActionType} from 'ui/units/workbooks/constants';

import type {WorkbookWithPermissions} from '../../../../../../shared/schema/us/types';
import type {ChunkItem, WorkbookEntry} from '../../../types';
import {CreateEntry} from '../../CreateEntry/CreateEntry';

import {MainTabContent} from './MainTabContent/MainTabContent';

import './WorkbookEntriesTable.scss';

const i18n = I18n.keyset('new-workbooks');

const b = block('dl-workbook-entries-table');

export type WorkbookEntriesTableTabsProps = {
    workbook: WorkbookWithPermissions;
    loadMoreEntries?: (entryScope: EntryScope) => void;
    retryLoadEntries?: (entryScope: EntryScope) => void;
    scope?: EntryScope;
    mapTokens?: Record<string, string>;
    mapErrors?: Record<string, boolean>;
    mapLoaders?: Record<string, boolean>;
    chunks: ChunkItem[][];
    availableScopes?: EntryScope[];
    onRenameEntry: (data: WorkbookEntry) => void;
    onDeleteEntry: (data: WorkbookEntry) => void;
    onDuplicateEntry: (data: WorkbookEntry) => void;
    onCopyEntry: (data: WorkbookEntry) => void;
    onShowRelated: (data: WorkbookEntry) => void;
};

export const WorkbookEntriesTableTabs = ({
    workbook,
    retryLoadEntries,
    loadMoreEntries,
    scope,
    mapTokens,
    mapErrors,
    mapLoaders,
    chunks,
    availableScopes,
    onRenameEntry,
    onDeleteEntry,
    onDuplicateEntry,
    onCopyEntry,
    onShowRelated,
}: WorkbookEntriesTableTabsProps) => {
    if (scope) {
        return null;
    }

    const [dashChunk = [], connChunk = [], datasetChunk = [], widgetChunk = [], reportChunk = []] =
        chunks;

    const isWidgetEmpty = widgetChunk.length === 0;
    const isDashEmpty = dashChunk.length === 0;
    const isReportEmpty = reportChunk.length === 0;

    const clearViewDash = DL.IS_MOBILE && isWidgetEmpty;
    const clearViewWidget = DL.IS_MOBILE && isDashEmpty;
    const clearViewReport = DL.IS_MOBILE && isReportEmpty;

    const showDataEntities = workbook.permissions.view && !DL.IS_MOBILE;

    if (DL.IS_MOBILE && isWidgetEmpty && isDashEmpty) {
        return (
            <PlaceholderIllustration name="template" title={i18n('label_empty-mobile-workbook')} />
        );
    }

    return (
        <React.Fragment>
            <MainTabContent
                chunk={dashChunk}
                actionCreateText={i18n('action_create-dashboard')}
                title={i18n('title_dashboards')}
                actionType={CreateEntryActionType.Dashboard}
                isShowMoreBtn={Boolean(!isDashEmpty && mapTokens?.[EntryScope.Dash])}
                loadMoreEntries={() => loadMoreEntries?.(EntryScope.Dash)}
                retryLoadEntries={() => retryLoadEntries?.(EntryScope.Dash)}
                isErrorMessage={mapErrors?.[EntryScope.Dash]}
                isLoading={mapLoaders?.[EntryScope.Dash]}
                workbook={workbook}
                onRenameEntry={onRenameEntry}
                onDeleteEntry={onDeleteEntry}
                onDuplicateEntry={onDuplicateEntry}
                onCopyEntry={onCopyEntry}
                clearView={clearViewDash}
                onShowRelatedClick={onShowRelated}
            />
            <MainTabContent
                chunk={widgetChunk}
                actionCreateText={i18n('action_create-chart')}
                title={i18n('title_charts')}
                actionType={CreateEntryActionType.Wizard}
                isShowMoreBtn={Boolean(!isWidgetEmpty && mapTokens?.[EntryScope.Widget])}
                loadMoreEntries={() => loadMoreEntries?.(EntryScope.Widget)}
                retryLoadEntries={() => retryLoadEntries?.(EntryScope.Widget)}
                isErrorMessage={mapErrors?.[EntryScope.Widget]}
                isLoading={mapLoaders?.[EntryScope.Widget]}
                workbook={workbook}
                onRenameEntry={onRenameEntry}
                onDeleteEntry={onDeleteEntry}
                onDuplicateEntry={onDuplicateEntry}
                onCopyEntry={onCopyEntry}
                createEntryBtn={<CreateEntry className={b('controls')} scope={EntryScope.Widget} />}
                clearView={clearViewWidget}
                onShowRelatedClick={onShowRelated}
            />
            {showDataEntities && (
                <MainTabContent
                    chunk={datasetChunk}
                    actionCreateText={i18n('action_create-dataset')}
                    title={i18n('title_datasets')}
                    actionType={CreateEntryActionType.Dataset}
                    isShowMoreBtn={Boolean(
                        datasetChunk?.length > 0 && mapTokens?.[EntryScope.Dataset],
                    )}
                    loadMoreEntries={() => loadMoreEntries?.(EntryScope.Dataset)}
                    retryLoadEntries={() => retryLoadEntries?.(EntryScope.Dataset)}
                    isErrorMessage={mapErrors?.[EntryScope.Dataset]}
                    isLoading={mapLoaders?.[EntryScope.Dataset]}
                    workbook={workbook}
                    onRenameEntry={onRenameEntry}
                    onDeleteEntry={onDeleteEntry}
                    onDuplicateEntry={onDuplicateEntry}
                    onCopyEntry={onCopyEntry}
                    onShowRelatedClick={onShowRelated}
                />
            )}
            {showDataEntities && (
                <MainTabContent
                    chunk={connChunk}
                    actionCreateText={i18n('action_create-connection')}
                    title={i18n('title_connections')}
                    actionType={CreateEntryActionType.Connection}
                    isShowMoreBtn={Boolean(
                        connChunk?.length > 0 && mapTokens?.[EntryScope.Connection],
                    )}
                    loadMoreEntries={() => loadMoreEntries?.(EntryScope.Connection)}
                    retryLoadEntries={() => retryLoadEntries?.(EntryScope.Connection)}
                    isErrorMessage={mapErrors?.[EntryScope.Connection]}
                    isLoading={mapLoaders?.[EntryScope.Connection]}
                    workbook={workbook}
                    onRenameEntry={onRenameEntry}
                    onDeleteEntry={onDeleteEntry}
                    onDuplicateEntry={onDuplicateEntry}
                    onCopyEntry={onCopyEntry}
                    onShowRelatedClick={onShowRelated}
                />
            )}
            {/* todo: move to other place everything below after update */}
            {availableScopes?.includes(EntryScope.Report) && (
                <MainTabContent
                    chunk={reportChunk}
                    actionCreateText={i18n('action_create-report')}
                    title={i18n('title_reports')}
                    actionType={CreateEntryActionType.Report}
                    isShowMoreBtn={Boolean(
                        reportChunk?.length > 0 && mapTokens?.[EntryScope.Report],
                    )}
                    loadMoreEntries={() => loadMoreEntries?.(EntryScope.Report)}
                    retryLoadEntries={() => retryLoadEntries?.(EntryScope.Report)}
                    isErrorMessage={mapErrors?.[EntryScope.Report]}
                    isLoading={mapLoaders?.[EntryScope.Report]}
                    workbook={workbook}
                    onRenameEntry={onRenameEntry}
                    onDeleteEntry={onDeleteEntry}
                    onDuplicateEntry={onDuplicateEntry}
                    onCopyEntry={onCopyEntry}
                    onShowRelatedClick={onShowRelated}
                    clearView={clearViewReport}
                />
            )}
        </React.Fragment>
    );
};