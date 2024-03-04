import React from 'react';

import {
    FirstDisplayedItemsCount,
    LastDisplayedItemsCount,
    Breadcrumbs as UIKitBreadcrumbs,
} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {Link, useHistory} from 'react-router-dom';

import type {
    GetCollectionBreadcrumb,
    GetCollectionBreadcrumbsResponse,
} from '../../../../shared/schema';

import './CollectionBreadcrumbs.scss';

const i18n = I18n.keyset('component.collection-breadcrumbs');

const b = block('dl-collection-breadcrumbs');

type BreadcrumbsItem = {
    id: string | null;
    text: string;
    action: (event: React.MouseEvent<HTMLElement, MouseEvent> | KeyboardEvent) => void;
    path: string;
};

const collectionsPath = '/collections';
const workbooksPath = '/workbooks';

export type CollectionBreadcrumbsProps = {
    className?: string;
    collectionBreadcrumbs: GetCollectionBreadcrumbsResponse;
    workbook?: {
        workbookId: string;
        title: string;
    };
    collection?: {
        collectionId: string;
        title: string;
    } | null;
    onItemClick?: (item: GetCollectionBreadcrumb) => void;
    onCurrentItemClick?: () => void;
};

export const CollectionBreadcrumbs = React.memo<CollectionBreadcrumbsProps>(
    ({className, collectionBreadcrumbs, workbook, collection, onItemClick, onCurrentItemClick}) => {
        const history = useHistory();

        const items = React.useMemo<BreadcrumbsItem[]>(() => {
            const result: BreadcrumbsItem[] = [
                {
                    id: null,
                    text: i18n('label_root-title'),
                    action: () => {
                        history.push(collectionsPath);
                    },
                    path: collectionsPath,
                },
            ];

            if (collectionBreadcrumbs.length > 0) {
                collectionBreadcrumbs.forEach((item) => {
                    result.push({
                        id: item.collectionId,
                        text: item.title,
                        action: () => {
                            history.push(`${collectionsPath}/${item.collectionId}`);
                        },
                        path: `${collectionsPath}/${item.collectionId}`,
                    });
                });
            }

            if (workbook) {
                result.push({
                    id: workbook.workbookId,
                    text: workbook.title,
                    action: () => {
                        history.push(`${workbooksPath}/${workbook.workbookId}`);
                    },
                    path: `${workbooksPath}/${workbook.workbookId}`,
                });
            }

            if (collection) {
                result.push({
                    id: collection.collectionId,
                    text: collection.title,
                    action: () => {
                        history.push(`${collectionsPath}/${collection.collectionId}`);
                    },
                    path: `${collectionsPath}/${collection.collectionId}`,
                });
            }

            return result;
        }, [collectionBreadcrumbs, workbook, collection, history]);

        return (
            <div className={b(null, className)}>
                <UIKitBreadcrumbs<BreadcrumbsItem>
                    items={items}
                    firstDisplayedItemsCount={FirstDisplayedItemsCount.One}
                    lastDisplayedItemsCount={LastDisplayedItemsCount.One}
                    renderItemContent={(item: BreadcrumbsItem, isCurrent: boolean) => {
                        return (
                            <Link
                                className={b('item', {last: isCurrent})}
                                to={item.path}
                                onClick={(e) => {
                                    e.stopPropagation();

                                    if (isCurrent && onCurrentItemClick) {
                                        onCurrentItemClick();
                                    } else if (onItemClick) {
                                        const bredcrumbItem = collectionBreadcrumbs.find(
                                            (collectionBreadcrumb) =>
                                                collectionBreadcrumb.collectionId === item.id,
                                        );
                                        if (bredcrumbItem) {
                                            onItemClick(bredcrumbItem);
                                        }
                                    }
                                }}
                            >
                                {item.text}
                            </Link>
                        );
                    }}
                />
            </div>
        );
    },
);

CollectionBreadcrumbs.displayName = 'CollectionBreadcrumbs';
