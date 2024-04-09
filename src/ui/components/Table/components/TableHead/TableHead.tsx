import React from 'react';

import type {HeaderGroup} from '@tanstack/react-table';
import {flexRender} from '@tanstack/react-table';
import block from 'bem-cn-lite';

import {TData} from '../../types';
import {SortIcon} from '../SortIcon/SortIcon';

const b = block('dl-table');

type Props = {
    headers: HeaderGroup<TData>[];
    sticky?: boolean;
};

export const TableHead = (props: Props) => {
    const {headers, sticky} = props;

    return (
        <thead className={b('header', {sticky})}>
            {headers.map((headerGroup) => {
                if (!headerGroup.headers.length) {
                    return null;
                }

                return (
                    <tr key={headerGroup.id} className={b('tr')}>
                        {headerGroup.headers.map((header, index, list) => {
                            if (header.column.depth !== headerGroup.depth) {
                                return null;
                            }

                            const original = header.column.columnDef.meta?.head;
                            const width = header.column.columnDef.meta?.width;
                            const isFixedSize = Boolean(width);
                            const rowSpan = header.isPlaceholder
                                ? headers.length - headerGroup.depth
                                : undefined;
                            const colSpan = header.colSpan > 1 ? header.colSpan : undefined;
                            const align = colSpan ? 'center' : 'left';
                            const sortable = header.column.getCanSort();
                            const cellStyle: React.CSSProperties = {
                                width,
                            };
                            const nextColumn = list[index + 1];
                            const lastPinnedColumn =
                                original?.pinned &&
                                !nextColumn?.column.columnDef.meta?.head?.pinned;

                            return (
                                <th
                                    key={header.id}
                                    className={b('th', {
                                        clickable: sortable,
                                        'fixed-size': isFixedSize,
                                        align,
                                        pinned: original?.pinned ? 'left' : undefined,
                                    })}
                                    onClick={header.column.getToggleSortingHandler()}
                                    style={cellStyle}
                                    colSpan={colSpan}
                                    rowSpan={rowSpan}
                                >
                                    {lastPinnedColumn && <div className={b('curtain')} />}
                                    <div className={b('th-content', {sortable})}>
                                        {flexRender(
                                            header.column.columnDef.header,
                                            header.getContext(),
                                        )}
                                        <SortIcon
                                            className={b('sort-icon')}
                                            sorting={header.column.getIsSorted()}
                                        />
                                    </div>
                                </th>
                            );
                        })}
                    </tr>
                );
            })}
        </thead>
    );
};
