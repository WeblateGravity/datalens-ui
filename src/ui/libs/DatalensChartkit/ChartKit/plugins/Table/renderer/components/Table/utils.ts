import {dateTimeUtc} from '@gravity-ui/date-utils';
import type {ColumnDef, SortingFnOption} from '@tanstack/react-table';
import {createColumnHelper} from '@tanstack/react-table';
import type {DisplayColumnDef, GroupColumnDef} from '@tanstack/table-core/build/lib/types';
import get from 'lodash/get';
import type {TableCellsRow, TableCommonCell, TableRow} from 'shared';

import {getTreeCellColumnIndex, getTreeSetColumnSortAscending} from '../../utils';

import type {TData, TFoot, THead} from './types';

function getSortingFunction(args: {
    th: THead;
    columnIndex: number;
    rows?: TableRow[];
}): SortingFnOption<TData> {
    const {th, columnIndex, rows} = args;
    const hasTreeCell = getTreeCellColumnIndex(rows?.[0] as TableCellsRow) !== -1;
    if (hasTreeCell) {
        return getTreeSetColumnSortAscending(columnIndex, rows ?? []);
    }

    const columnType: TableCommonCell['type'] = get(th, 'type');
    if (columnType === 'date') {
        return function (row1, row2) {
            const cell1Value = String(row1.original[columnIndex].value);
            const cell2Value = String(row2.original[columnIndex].value);

            const date1 = dateTimeUtc({input: cell1Value});
            const date2 = dateTimeUtc({input: cell2Value});

            let result = 0;
            if (date1.isValid() && date1.isAfter(date2)) {
                result = 1;
            } else if (date2.isValid() && date2.isAfter(date1)) {
                result = -1;
            }

            return result;
        };
    }

    return 'auto';
}

function createColumn(args: {
    headCell: THead;
    rows?: TableRow[];
    footerCell?: TFoot;
    index: number;
    size?: number;
}) {
    const {headCell, footerCell, index, size, rows} = args;
    const {id, width, cell, ...columnOptions} = headCell;
    const options = {
        ...columnOptions,
        id: `${id}__${index}`,
        meta: {
            width,
            footer: footerCell,
            head: headCell,
        },
        size,
        minSize: 0,
        sortingFn: getSortingFunction({th: headCell, columnIndex: index, rows}),
    } as ColumnDef<TData>;

    if (cell) {
        options.cell = (context) => {
            const originalCellData = context.row.original[index];
            return cell(originalCellData);
        };
    }

    if (footerCell) {
        if (cell) {
            options.footer = () => cell(footerCell);
        } else {
            options.footer = footerCell.formattedValue ?? (footerCell.value as string);
        }
    }

    return options;
}

export function createTableColumns(args: {
    head?: THead[];
    rows?: TableRow[];
    footer?: TFoot[];
    cellSizes?: null | number[];
}) {
    const {head = [], rows = [], footer = []} = args;
    const cellSizes = args.cellSizes || [];
    const columnHelper = createColumnHelper<TData>();

    let lastColumnIndex = 0;
    const createHeadColumns = (cells: THead[], defaultWidth = 0): ColumnDef<TData>[] => {
        return cells.map((headCell) => {
            const cellIndex = headCell.columns?.length ? -1 : lastColumnIndex;
            const footerCell = footer?.[cellIndex];
            const columnWidth =
                typeof headCell.width === 'number' ? Number(headCell.width) : defaultWidth;
            const size = cellSizes[cellIndex] ?? columnWidth;
            const left = cellSizes.reduce(
                (sum, _s, index) => (index < cellIndex ? sum + cellSizes[index] : sum),
                1,
            );
            const options = createColumn({
                headCell: {
                    ...headCell,
                    enableSorting: headCell.enableSorting && rows.length > 1,
                    left,
                    width: columnWidth > 0 ? columnWidth : undefined,
                },
                footerCell,
                index: cellIndex,
                size,
                rows,
            });

            if (headCell.columns?.length) {
                const childDefaultWidth =
                    columnWidth > 0 ? columnWidth / headCell.columns?.length : 0;
                return columnHelper.group({
                    ...options,
                    columns: createHeadColumns(headCell.columns || [], childDefaultWidth),
                } as GroupColumnDef<TData>);
            } else {
                lastColumnIndex++;
            }

            return columnHelper.accessor((row) => {
                const cellData = row[cellIndex];

                return cellData.formattedValue ?? cellData.value;
            }, options as DisplayColumnDef<TData>);
        });
    };

    return createHeadColumns(head);
}
