import { useState } from 'react';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

export interface Column<T> {
  key: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  /** Render monospace (e.g. for IDs) */
  mono?: boolean;
  /** Custom cell content; defaults to row[key] */
  render?: (row: T) => React.ReactNode;
  /** Value used for sorting; defaults to row[key] */
  value?: (row: T) => string | number | null;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  getRowId: (row: T) => string;
  onRowClick?: (row: T) => void;
  pageSize?: number;
  emptyMessage?: string;
}

const HEADER_BG = '#7c7f83';

const headCellSx = {
  bgcolor: HEADER_BG,
  color: '#fff',
  fontWeight: 700,
  fontSize: '0.78rem',
  letterSpacing: '0.5px',
  textTransform: 'uppercase',
  whiteSpace: 'nowrap',
  borderBottom: 'none',
  py: 1.25,
} as const;

const pageBtnSx = (active: boolean) => ({
  minWidth: 30,
  height: 30,
  px: 1,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '1px solid',
  borderColor: active ? 'primary.main' : 'rgba(0,0,0,0.15)',
  bgcolor: active ? 'primary.main' : '#fff',
  color: active ? '#fff' : 'text.secondary',
  borderRadius: 1,
  cursor: 'pointer',
  fontSize: '0.8rem',
  userSelect: 'none',
  '&:hover': { bgcolor: active ? 'primary.main' : 'rgba(0,0,0,0.05)' },
});

export function DataTable<T>({
  columns, rows, getRowId, onRowClick, pageSize = 12, emptyMessage = 'No records.',
}: DataTableProps<T>) {
  const [sort, setSort] = useState<{ key: string; dir: 'asc' | 'desc' } | null>(null);
  const [page, setPage] = useState(1);

  const rawValue = (col: Column<T>, row: T) =>
    col.value ? col.value(row) : (row as Record<string, unknown>)[col.key];

  let ordered = rows;
  if (sort) {
    const col = columns.find((c) => c.key === sort.key);
    if (col) {
      ordered = [...rows].sort((a, b) => {
        const av = rawValue(col, a);
        const bv = rawValue(col, b);
        if (av == null && bv == null) return 0;
        if (av == null) return 1;
        if (bv == null) return -1;
        const cmp =
          typeof av === 'number' && typeof bv === 'number'
            ? av - bv
            : String(av).localeCompare(String(bv), undefined, { numeric: true });
        return sort.dir === 'asc' ? cmp : -cmp;
      });
    }
  }

  const total = ordered.length;
  const maxPage = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, maxPage);
  const start = (safePage - 1) * pageSize;
  const pageRows = ordered.slice(start, start + pageSize);
  const from = total === 0 ? 0 : start + 1;
  const to = Math.min(start + pageSize, total);

  const toggleSort = (key: string) =>
    setSort((s) =>
      s && s.key === key
        ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: 'asc' },
    );

  return (
    <Paper elevation={0} sx={{ border: '1px solid rgba(0,0,0,0.1)', borderRadius: 2, overflow: 'hidden' }}>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              {columns.map((col) => {
                const active = sort?.key === col.key;
                return (
                  <TableCell
                    key={col.key}
                    align={col.align ?? 'left'}
                    onClick={col.sortable ? () => toggleSort(col.key) : undefined}
                    sx={{ ...headCellSx, cursor: col.sortable ? 'pointer' : 'default' }}
                  >
                    <Box
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.25,
                        verticalAlign: 'middle',
                      }}
                    >
                      {col.label}
                      {col.sortable &&
                        (active ? (
                          sort!.dir === 'asc' ? (
                            <ArrowDropUpIcon sx={{ fontSize: 18 }} />
                          ) : (
                            <ArrowDropDownIcon sx={{ fontSize: 18 }} />
                          )
                        ) : (
                          <UnfoldMoreIcon sx={{ fontSize: 14, opacity: 0.55 }} />
                        ))}
                    </Box>
                  </TableCell>
                );
              })}
            </TableRow>
          </TableHead>
          <TableBody>
            {pageRows.map((row) => (
              <TableRow
                key={getRowId(row)}
                hover={!!onRowClick}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                sx={{ cursor: onRowClick ? 'pointer' : 'default' }}
              >
                {columns.map((col) => (
                  <TableCell
                    key={col.key}
                    align={col.align ?? 'left'}
                    sx={{
                      fontSize: '0.85rem',
                      color: 'text.primary',
                      borderBottom: '1px solid #ececec',
                      fontFamily: col.mono ? 'monospace' : undefined,
                      py: 1.15,
                    }}
                  >
                    {col.render ? col.render(row) : ((row as Record<string, unknown>)[col.key] as React.ReactNode) ?? ''}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {total === 0 && (
        <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>{emptyMessage}</Box>
      )}

      {total > 0 && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 2,
            px: 2,
            py: 1.5,
          }}
        >
          <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary' }}>
            Displaying {from} to {to} of {total} items
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box
              sx={pageBtnSx(false)}
              onClick={() => setPage(Math.max(1, safePage - 1))}
              aria-label="Previous page"
            >
              <ChevronLeftIcon sx={{ fontSize: 18 }} />
            </Box>
            {Array.from({ length: maxPage }, (_, i) => i + 1).map((p) => (
              <Box key={p} sx={pageBtnSx(p === safePage)} onClick={() => setPage(p)}>
                {p}
              </Box>
            ))}
            <Box
              sx={pageBtnSx(false)}
              onClick={() => setPage(Math.min(maxPage, safePage + 1))}
              aria-label="Next page"
            >
              <ChevronRightIcon sx={{ fontSize: 18 }} />
            </Box>
          </Box>
        </Box>
      )}
    </Paper>
  );
}
