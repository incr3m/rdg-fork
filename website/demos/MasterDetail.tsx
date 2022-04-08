import React from 'react';
import faker from '@faker-js/faker';
import subYears from 'date-fns/subYears';
import addYears from 'date-fns/addYears';
import eachDayOfInterval from 'date-fns/eachDayOfInterval';
import type { IMasterDetailGridProps, IMasterDetailRow } from './MasterDetailGrid';
import MasterDetailGrid from './MasterDetailGrid';
import type { Column, FormatterProps } from '../../src';

interface DepartmentRow {
  id: string;
  __type: 'MASTER' | 'DETAIL';
  __expanded?: boolean;
  department: string;
  count: number;
}

function createDepartments(): readonly DepartmentRow[] {
  const departments: DepartmentRow[] = [];
  for (let i = 1; i < 30; i++) {
    departments.push({
      id: `${i}`,
      __type: 'MASTER' as 'DETAIL' | 'MASTER',
      __expanded: false,
      department: faker.commerce.department(),
      count: faker.datatype.number()
    });
  }
  return departments;
}

function initState() {
  const refDate = new Date();
  return {
    startDate: subYears(refDate, 1),
    endDate: addYears(refDate, 1)
  };
}

interface ICalendarGridProps<T> {
  startDate: Date;
  endDate: Date;
  calendarCellFormatter: React.ComponentType<FormatterProps<T, unknown>>;
}

function CalendarGrid<T extends IMasterDetailRow>(
  props: ICalendarGridProps<T> & IMasterDetailGridProps<T>
) {
  const dateColumns = React.useMemo(() => {
    const days = eachDayOfInterval({
      start: props.startDate,
      end: props.endDate
    });
    return days.map((day) => {
      const ense = day.toLocaleDateString('en-se');
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      return {
        key: ense,
        name: ense,
        formatter: props.calendarCellFormatter
      } as Column<T>;
    });
  }, [props.startDate, props.endDate, props.calendarCellFormatter]);

  return (
    <MasterDetailGrid
      {...props}
      columns={[
        ...props.columns.map((c) => ({
          ...c,
          frozen: true
        })),
        ...dateColumns
      ]}
    />
  );
}

export default function MasterDetail() {
  const [rows, setRows] = React.useState(createDepartments);
  const [state, setState] = React.useState(initState);

  return (
    <CalendarGrid
      rows={rows}
      columns={[
        {
          key: 'id',
          name: 'ID'
        },
        {
          key: 'department',
          name: 'Department'
        },
        {
          key: 'count',
          name: 'Count'
        }
      ]}
      startDate={state.startDate}
      endDate={state.endDate}
      calendarCellFormatter={(params) => {
        return (
          <>
            {params.row.id}@{params.column.key}
          </>
        );
      }}
      onRowsChanged={(rows) => {
        setRows(rows);
      }}
      getRowDetails={(row) => {
        const details = [];
        for (let index = 0; index < 20; index++) {
          details.push({
            id: `${row.id}@${index}`,
            __type: 'DETAIL',
            department: `test@${index}`
          });
        }
        return details;
      }}
    />
  );
}
