import React from 'react';

import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useDispatch} from 'react-redux';
import {EntryScope} from 'shared';
import {DIALOG_COPY_ENTRIES_TO_WORKBOOK} from 'ui/components/CopyEntriesToWorkbookDialog';
import {CreateEntryActionType} from 'ui/units/workbooks/constants';

import {GetEntryResponse} from '../../../../../../shared/schema';
import {WorkbookWithPermissions} from '../../../../../../shared/schema/us/types';
import {AppDispatch} from '../../../../../store';
import {closeDialog, openDialog} from '../../../../../store/actions/dialog';
import {WorkbookEntry} from '../../../types';
import {DIALOG_DELETE_ENTRY_IN_NEW_WORKBOOK} from '../../DeleteEntryDialog/DeleteEntryDialog';
import {DIALOG_DUPLICATE_ENTRY_IN_WORKBOOK} from '../../DuplicateEntryDialog/DuplicateEntryDialog';
import {DIALOG_RENAME_ENTRY_IN_NEW_WORKBOOK} from '../../RenameEntryDialog/RenameEntryDialog';

import {ChunkGroup} from './ChunkGroup/ChunkGroup';
import {MainTabContent} from './MainTabContent/MainTabContent';
import {defaultRowStyle} from './constants';
import {ChunkItem, useChunkedEntries} from './useChunkedEntries';

import './WorkbookEntriesTable.scss';

const i18n = I18n.keyset('new-workbooks');

const b = block('dl-workbook-entries-table');

type WorkbookEntriesTableProps = {
    workbook: WorkbookWithPermissions;
    entries: GetEntryResponse[];
    refreshEntries: () => void;
    loadMoreEntriesByScope: (entryScope: EntryScope) => void;
    scope?: EntryScope;
    mapTokens: Record<string, string>;
};

export const WorkbookEntriesTable = React.memo<WorkbookEntriesTableProps>(
    ({workbook, entries, refreshEntries, loadMoreEntriesByScope, scope, mapTokens}) => {
        const dispatch: AppDispatch = useDispatch();

        const onRenameEntry = React.useCallback(
            (entity: WorkbookEntry) => {
                dispatch(
                    openDialog({
                        id: DIALOG_RENAME_ENTRY_IN_NEW_WORKBOOK,
                        props: {
                            open: true,
                            data: entity,
                            onClose: () => dispatch(closeDialog()),
                        },
                    }),
                );
            },
            [dispatch],
        );

        const onDeleteEntry = React.useCallback(
            (entity: WorkbookEntry) => {
                dispatch(
                    openDialog({
                        id: DIALOG_DELETE_ENTRY_IN_NEW_WORKBOOK,
                        props: {
                            open: true,
                            data: entity,
                            onClose: () => dispatch(closeDialog()),
                        },
                    }),
                );
            },
            [dispatch],
        );

        const onApplyDuplicate = React.useCallback(() => {
            refreshEntries();
        }, [refreshEntries]);

        const onDuplicateEntry = React.useCallback(
            (entity: WorkbookEntry) => {
                dispatch(
                    openDialog({
                        id: DIALOG_DUPLICATE_ENTRY_IN_WORKBOOK,
                        props: {
                            open: true,
                            onClose: () => dispatch(closeDialog()),
                            onApply: onApplyDuplicate,
                            initName: entity.name,
                            entryId: entity.entryId,
                        },
                    }),
                );
            },
            [dispatch, onApplyDuplicate],
        );

        const onCopyEntry = React.useCallback(
            (entity: WorkbookEntry) => {
                dispatch(
                    openDialog({
                        id: DIALOG_COPY_ENTRIES_TO_WORKBOOK,
                        props: {
                            open: true,
                            onClose: () => dispatch(closeDialog()),
                            entryId: entity.entryId,
                        },
                    }),
                );
            },
            [dispatch],
        );

        const chunks = useChunkedEntries(entries);

        const dashChunk: ChunkItem[] = [];
        const connChunk: ChunkItem[] = [];
        const datasetChunk: ChunkItem[] = [];
        const widgetChunk: ChunkItem[] = [];

        chunks.forEach((chunk) => {
            chunk.forEach((chunkItem) => {
                if (chunkItem.type === 'entry') {
                    switch (chunkItem.item.scope) {
                        case EntryScope.Dash:
                            dashChunk.push(chunkItem);
                            break;
                        case EntryScope.Connection:
                            connChunk.push(chunkItem);
                            break;
                        case EntryScope.Dataset:
                            datasetChunk.push(chunkItem);
                            break;
                        case EntryScope.Widget:
                            widgetChunk.push(chunkItem);
                            break;
                    }
                }
            });
        });

        const mainTabProps = {
            workbook,
            onRenameEntry,
            onDeleteEntry,
            onDuplicateEntry,
            onCopyEntry,
        };

        return (
            <>
                <div className={b()}>
                    <div className={b('table')}>
                        <div className={b('header')} style={defaultRowStyle}>
                            <div className={b('header-cell', {title: true})}>
                                {i18n('label_title')}
                            </div>
                            <div className={b('header-cell', {author: true})}>
                                {i18n('label_author')}
                            </div>
                            <div className={b('header-cell')}>{i18n('label_last-modified')}</div>
                            <div className={b('header-cell')} />
                            <div className={b('header-cell')} />
                        </div>
                        {scope &&
                            chunks.map((chunk) => (
                                <ChunkGroup
                                    key={chunk[0].key}
                                    workbook={workbook}
                                    chunk={chunk}
                                    onRenameEntry={onRenameEntry}
                                    onDeleteEntry={onDeleteEntry}
                                    onDuplicateEntry={onDuplicateEntry}
                                    onCopyEntry={onCopyEntry}
                                />
                            ))}
                    </div>

                    {!scope && (
                        <>
                            <MainTabContent
                                chunk={dashChunk}
                                actionCreateText={i18n('action_create-dashboard')}
                                title={i18n('title_dashboards')}
                                actionType={CreateEntryActionType.Dashboard}
                                isShowMoreBtn={Boolean(
                                    dashChunk.length > 0 && mapTokens[EntryScope.Dash],
                                )}
                                loadMoreEntries={() => loadMoreEntriesByScope(EntryScope.Dash)}
                                {...mainTabProps}
                            />

                            <MainTabContent
                                chunk={widgetChunk}
                                actionCreateText={i18n('action_create-chart')}
                                title={i18n('title_charts')}
                                actionType={CreateEntryActionType.Wizard}
                                isShowMoreBtn={Boolean(
                                    widgetChunk.length > 0 && mapTokens[EntryScope.Widget],
                                )}
                                loadMoreEntries={() => loadMoreEntriesByScope(EntryScope.Widget)}
                                {...mainTabProps}
                            />

                            <MainTabContent
                                chunk={datasetChunk}
                                actionCreateText={i18n('action_create-dataset')}
                                title={i18n('title_datasets')}
                                actionType={CreateEntryActionType.Dataset}
                                isShowMoreBtn={Boolean(
                                    datasetChunk.length > 0 && mapTokens[EntryScope.Dataset],
                                )}
                                loadMoreEntries={() => loadMoreEntriesByScope(EntryScope.Dataset)}
                                {...mainTabProps}
                            />

                            <MainTabContent
                                chunk={connChunk}
                                actionCreateText={i18n('action_create-connection')}
                                title={i18n('title_connections')}
                                actionType={CreateEntryActionType.Connection}
                                isShowMoreBtn={Boolean(
                                    connChunk.length > 0 && mapTokens[EntryScope.Connection],
                                )}
                                loadMoreEntries={() =>
                                    loadMoreEntriesByScope(EntryScope.Connection)
                                }
                                {...mainTabProps}
                            />
                        </>
                    )}
                </div>
            </>
        );
    },
);

WorkbookEntriesTable.displayName = 'WorkbookEntriesTable';
