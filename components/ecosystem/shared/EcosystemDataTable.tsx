'use client';

import type { ReactNode } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
  className?: string;
}

export function EcosystemDataTable<T extends { id: string }>({
  columns,
  rows,
  emptyMessage = 'Không có dữ liệu',
  onRowClick,
}: {
  columns: Column<T>[];
  rows: T[];
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
}) {
  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-8 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="home-card overflow-hidden p-0">
      <Table>
        <TableHeader>
          <TableRow className="border-white/10 hover:bg-transparent">
            {columns.map((col) => (
              <TableHead key={col.key} className="text-muted-foreground">
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.id}
              className={`border-white/8 hover:bg-white/5 ${onRowClick ? 'cursor-pointer' : ''}`}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((col) => (
                <TableCell key={col.key} className={col.className}>
                  {col.render
                    ? col.render(row)
                    : String((row as Record<string, unknown>)[col.key] ?? '—')}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
