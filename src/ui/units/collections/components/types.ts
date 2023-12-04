import {DropdownMenuItem} from '@gravity-ui/uikit';
import type {CollectionWithPermissions, WorkbookWithPermissions} from 'shared/schema';

import {CollectionContentFilters} from '../../../components/CollectionFilters/CollectionFilters';

export type SelectedMap = Record<
    string,
    {
        type: 'workbook' | 'collection';
        checked: boolean;
    }
>;

export type UpdateCheckbox = (
    checked: boolean,
    type: 'workbook' | 'collection',
    entityId: string,
) => void;

type CollectionContentProps = {
    contentItems: (CollectionWithPermissions | WorkbookWithPermissions)[];
    filters: CollectionContentFilters;
    setFilters: (filters: CollectionContentFilters) => void;
    getWorkbookActions: (
        item: WorkbookWithPermissions,
    ) => (DropdownMenuItem[] | DropdownMenuItem)[];
    getCollectionActions: (
        item: CollectionWithPermissions,
    ) => (DropdownMenuItem[] | DropdownMenuItem)[];
    onUpdateCheckbox: UpdateCheckbox;
    onSelectAll: (checked: boolean) => void;
    selectedMap: SelectedMap;
    countSelected: number;
    isOpenSelectionMode?: boolean;
};

export {CollectionContentProps};
