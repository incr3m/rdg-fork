import { useState } from 'react';
import faker from '@faker-js/faker';
import MasterDetailGrid from './MasterDetailGrid';

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

export default function MasterDetail() {
  const [rows, setRows] = useState(createDepartments);

  return (
    <MasterDetailGrid
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
