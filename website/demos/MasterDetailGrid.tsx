import { useState, useMemo } from 'react';

import DataGrid from '../../src';
import type { Column, RowsChangeData } from '../../src';
import { CellExpanderFormatter } from './components/Formatters';

interface IMasterDetailRow {
  id: string;
  __type: 'MASTER' | 'DETAIL';
  __expanded?: boolean;
}

type TDetailsRow<T> = T & { __type: 'DETAIL' };
type TDetailsRows<T> = TDetailsRow<T>[];

interface IMasterDetailGridProps<T extends IMasterDetailRow> {
  columns: readonly Column<T>[];
  rows: readonly T[];
  onRowsChanged: (rows: T[]) => void;
  getRowDetails: (row: T) => Promise<TDetailsRows<T>> | TDetailsRows<T>;
}

export default function MasterDetailGrid<T extends IMasterDetailRow>(
  props: IMasterDetailGridProps<T>
) {
  const { columns: columnProps, rows } = props;

  const columns = useMemo((): readonly Column<T>[] => {
    return [
      {
        key: '__expanded',
        name: '',
        minWidth: 30,
        width: 30,
        formatter({ row, isCellSelected, onRowChange }) {
          if (row.__type === 'DETAIL') {
            return <div> </div>;
          }

          return (
            <CellExpanderFormatter
              expanded={row.__expanded}
              isCellSelected={isCellSelected}
              onCellExpand={() => {
                onRowChange({ ...row, __expanded: !row.__expanded });
              }}
            />
          );
        }
      },
      ...columnProps
    ];
  }, [columnProps]);

  async function onRowsChange(rows: T[], { indexes }: RowsChangeData<T>) {
    const row = rows[indexes[0]];
    if (row.__type === 'MASTER') {
      if (!row.__expanded) {
        let rowCount = 0;
        let nextIndex = indexes[0] + 1;

        let next = rows[nextIndex] as T | null;
        while (next?.__type === 'DETAIL') {
          rowCount++;
          nextIndex++;
          next = rows[nextIndex];
        }

        rows.splice(indexes[0] + 1, rowCount);
      } else {
        const details = await Promise.resolve(props.getRowDetails(row));
        rows.splice(indexes[0] + 1, 0, ...details);
      }
      props.onRowsChanged(rows);
    }
  }

  console.log('>>demos/MasterDetail::', 'rows', rows); //TRACE

  return (
    <DataGrid
      rowKeyGetter={rowKeyGetter}
      columns={columns}
      rows={rows}
      onRowsChange={onRowsChange}
      headerRowHeight={45}
      rowHeight={45}
      // rowHeight={(args) => (args.type === 'ROW' && args.row.__type === 'DETAIL' ? 300 : 45)}
      className="fill-grid"
    />
  );
}

function rowKeyGetter<T extends IMasterDetailRow>(row: T) {
  return row.id;
}
