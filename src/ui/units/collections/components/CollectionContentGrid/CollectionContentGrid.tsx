import React from 'react';

import {dateTime} from '@gravity-ui/date-utils';
import {Checkbox, DropdownMenu} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {Link} from 'react-router-dom';
import {CollectionIcon} from 'ui/components/CollectionIcon/CollectionIcon';

import {WorkbookIcon} from '../../../../components/WorkbookIcon/WorkbookIcon';
import {LayoutContext} from '../../../collections-navigation/contexts/LayoutContext';
import {AnimateBlock} from '../AnimateBlock';
import {CollectionContentGridProps} from '../types';
import {onClickStopPropagation} from '../utils';

import './CollectionContentGrid.scss';

const b = block('dl-collection-content-grid');

export const CollectionContentGrid = React.memo<CollectionContentGridProps>(
    ({
        contentItems,
        getWorkbookActions,
        getCollectionActions,
        onUpdateCheckbox,
        selectedMap,
        isOpenSelectionMode,
    }) => {
        const {setLayout} = React.useContext(LayoutContext);

        return (
            <div className={b()}>
                <div className={b('grid')}>
                    {contentItems.map((item, index) => {
                        const canMove = item.permissions.move;

                        if ('workbookId' in item) {
                            const actions = getWorkbookActions(item);

                            return (
                                <AnimateBlock
                                    key={item.workbookId}
                                    delay={Math.min(index * 5, 100)}
                                >
                                    <div
                                        className={b('content-item')}
                                        onClick={
                                            isOpenSelectionMode && canMove
                                                ? () => {
                                                      onUpdateCheckbox(
                                                          !selectedMap[item.workbookId]?.checked,
                                                          'workbook',
                                                          item.workbookId,
                                                      );
                                                  }
                                                : undefined
                                        }
                                    >
                                        {isOpenSelectionMode && (
                                            <Checkbox
                                                size="l"
                                                className={b('content-item-checkbox')}
                                                disabled={!canMove}
                                                checked={Boolean(
                                                    selectedMap[item.workbookId]?.checked &&
                                                        canMove,
                                                )}
                                            />
                                        )}
                                        <Link
                                            to={`/workbooks/${item.workbookId}`}
                                            className={b('content-item-link', {
                                                'selection-mode': isOpenSelectionMode,
                                            })}
                                        >
                                            <div className={b('content-cell', {title: true})}>
                                                <div className={b('title-col')}>
                                                    <div
                                                        className={b('title-col-icon', {
                                                            'selection-mode': isOpenSelectionMode,
                                                        })}
                                                    >
                                                        <WorkbookIcon title={item.title} size="l" />
                                                    </div>
                                                    <div className={b('title-col-text')}>
                                                        {item.title}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className={b('content-footer')}>
                                                <div className={b('content-date')}>
                                                    {dateTime({
                                                        input: item.updatedAt,
                                                    }).fromNow()}
                                                </div>

                                                {actions.length > 0 && (
                                                    <div
                                                        className={b('content-actions')}
                                                        onClick={onClickStopPropagation}
                                                    >
                                                        <DropdownMenu size="s" items={actions} />
                                                    </div>
                                                )}
                                            </div>
                                        </Link>
                                    </div>
                                </AnimateBlock>
                            );
                        } else {
                            const actions = getCollectionActions(item);

                            return (
                                <AnimateBlock
                                    key={item.collectionId}
                                    delay={Math.min(index * 5, 100)}
                                >
                                    <div
                                        className={b('content-item')}
                                        onClick={
                                            isOpenSelectionMode && canMove
                                                ? () => {
                                                      onUpdateCheckbox(
                                                          !selectedMap[item.collectionId]?.checked,
                                                          'collection',
                                                          item.collectionId,
                                                      );
                                                  }
                                                : undefined
                                        }
                                    >
                                        {isOpenSelectionMode && (
                                            <Checkbox
                                                size="l"
                                                className={b('content-item-checkbox')}
                                                disabled={!canMove}
                                                checked={Boolean(
                                                    selectedMap[item.collectionId]?.checked &&
                                                        canMove,
                                                )}
                                            />
                                        )}
                                        <Link
                                            to={`/collections/${item.collectionId}`}
                                            className={b('content-item-link', {
                                                'selection-mode': isOpenSelectionMode,
                                            })}
                                            onClick={() => {
                                                setLayout({
                                                    title: {
                                                        content: item.title,
                                                    },
                                                    description: {
                                                        content: item.description,
                                                    },
                                                });
                                            }}
                                        >
                                            <div className={b('content-cell', {title: true})}>
                                                <div className={b('title-col')}>
                                                    <div
                                                        className={b('title-col-icon', {
                                                            'selection-mode': isOpenSelectionMode,
                                                        })}
                                                    >
                                                        <CollectionIcon isIconBig size={125} />
                                                    </div>
                                                    <div className={b('title-col-text')}>
                                                        {item.title}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className={b('content-footer')}>
                                                <div className={b('content-date')}>
                                                    {dateTime({
                                                        input: item.updatedAt,
                                                    }).fromNow()}
                                                </div>
                                                {actions.length > 0 ? (
                                                    <div
                                                        className={b('content-actions')}
                                                        onClick={onClickStopPropagation}
                                                    >
                                                        <DropdownMenu size="s" items={actions} />
                                                    </div>
                                                ) : null}
                                            </div>
                                        </Link>
                                    </div>
                                </AnimateBlock>
                            );
                        }
                    })}
                </div>
            </div>
        );
    },
);

CollectionContentGrid.displayName = 'CollectionContentGrid';
