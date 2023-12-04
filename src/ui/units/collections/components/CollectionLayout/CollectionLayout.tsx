import React from 'react';

import {Button} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {CollectionPageViewMode} from 'ui/components/CollectionFilters';

import './CollectionLayout.scss';

const b = block('dl-collection-layout');

type Props = {
    title: string;
    description?: string | null;
    controls?: React.ReactNode;
    content: React.ReactNode;
    editBtn: React.ReactNode | null;
    countSelected: number;
    isOpenSelectionMode: boolean;
    collectionPageViewMode: CollectionPageViewMode;
    onOpenSelectionMode: () => void;
    onCancelSelectionMode: () => void;
    resetSelected: () => void;
    onSelectAll: (checked: boolean) => void;
};

export const CollectionLayout = React.memo<Props>(
    ({
        title,
        description,
        controls,
        content,
        editBtn,
        countSelected,
        collectionPageViewMode,
        isOpenSelectionMode,
        onOpenSelectionMode,
        onCancelSelectionMode,
        resetSelected,
        onSelectAll,
    }) => {
        const selectBtn = React.useMemo(() => {
            if (countSelected === 0 && !isOpenSelectionMode) {
                return <Button onClick={onOpenSelectionMode}>Выбрать</Button>;
            }

            if (countSelected > 0) {
                return <Button onClick={resetSelected}>Снять все</Button>;
            } else {
                return <Button onClick={() => onSelectAll(true)}>Выбрать все</Button>;
            }
        }, [countSelected, isOpenSelectionMode, onOpenSelectionMode, onSelectAll, resetSelected]);

        return (
            <div className={b()}>
                <div className={b('container')}>
                    <div className={b('title-content')}>
                        <h1 className={b('title')}>{title}</h1>
                        {editBtn}
                        <div className={b('select-actions')}>
                            {collectionPageViewMode === CollectionPageViewMode.Grid && (
                                <>
                                    {selectBtn}
                                    {isOpenSelectionMode && (
                                        <Button
                                            className={b('cancel-btn')}
                                            view="outlined-danger"
                                            onClick={onCancelSelectionMode}
                                        >
                                            Отменить
                                        </Button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                    {description && <div className={b('description')}>{description}</div>}
                    {controls && <div className={b('controls')}>{controls}</div>}
                    <div className={b('content')}>{content}</div>
                </div>
            </div>
        );
    },
);

CollectionLayout.displayName = 'CollectionLayout';
