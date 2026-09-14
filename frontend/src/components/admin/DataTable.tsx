import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Box,
  Typography,
  Skeleton,
  IconButton,
  InputAdornment,
  TextField,
  Card,
  CardContent,
  TableSortLabel,
  Checkbox,
  alpha,
  useTheme,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import ClearIcon from '@mui/icons-material/Clear';

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  width?: string | number;
  minWidth?: string | number;
  render?: (item: T, index: number) => React.ReactNode;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  page?: number; // 0-indexed
  rowsPerPage?: number;
  totalRows?: number;
  onPageChange?: (newPage: number) => void;
  onRowsPerPageChange?: (newRowsPerPage: number) => void;
  onSort?: (columnKey: string, direction: 'asc' | 'desc') => void;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  title?: string;
  subtitle?: string;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  searchPlaceholder?: string;
  filters?: React.ReactNode;
  actions?: React.ReactNode;
  emptyMessage?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  emptyIcon?: React.ReactNode;
  rowsPerPageOptions?: number[];
  onRowClick?: (item: T) => void;
  selectable?: boolean;
  selectedIds?: (string | number)[];
  onSelectAll?: (checked: boolean) => void;
  onSelectRow?: (item: T, checked: boolean) => void;
  getRowId?: (item: T) => string | number;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  page = 0,
  rowsPerPage = 10,
  totalRows,
  onPageChange,
  onRowsPerPageChange,
  onSort,
  sortColumn,
  sortDirection = 'desc',
  title,
  subtitle,
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Tìm kiếm...',
  filters,
  actions,
  emptyMessage = 'Không có dữ liệu',
  emptyDescription = 'Không tìm thấy bản ghi nào phù hợp với bộ lọc hiện tại.',
  emptyAction,
  emptyIcon,
  rowsPerPageOptions = [10, 20, 50, 100],
  onRowClick,
  selectable = false,
  selectedIds = [],
  onSelectAll,
  onSelectRow,
  getRowId = (item: T) => item.id,
}: DataTableProps<T>) {
  const theme = useTheme();

  const handleSortClick = (columnKey: string) => {
    if (!onSort) return;
    const isAsc = sortColumn === columnKey && sortDirection === 'asc';
    onSort(columnKey, isAsc ? 'desc' : 'asc');
  };

  const isAllSelected = selectable && data.length > 0 && selectedIds.length === data.length;
  const isIndeterminate = selectable && selectedIds.length > 0 && selectedIds.length < data.length;

  const total = totalRows !== undefined ? totalRows : data.length;

  return (
    <Card
      elevation={1}
      sx={{
        bgcolor: 'background.paper',
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        overflow: 'hidden',
        transition: 'box-shadow 200ms ease',
        '&:hover': {
          boxShadow: theme.palette.mode === 'dark'
            ? '0 8px 24px rgba(0, 0, 0, 0.4)'
            : '0 8px 24px rgba(15, 23, 42, 0.08)',
        },
      }}
    >
      {/* Header toolbar: Title, Search, Filters, Actions */}
      {(title || onSearchChange || filters || actions) && (
        <CardContent sx={{ p: 2.5, pb: filters ? 2 : 2.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'stretch', md: 'center' },
              gap: 2,
              mb: filters ? 2 : 0,
            }}
          >
            {title && (
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.01em' }}>
                  {title}
                </Typography>
                {subtitle && (
                  <Typography variant="body2" color="text.secondary">
                    {subtitle}
                  </Typography>
                )}
              </Box>
            )}

            <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5, ml: 'auto' }}>
              {onSearchChange && (
                <TextField
                  size="small"
                  value={searchValue ?? ''}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder={searchPlaceholder}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                    endAdornment: searchValue ? (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => onSearchChange('')} edge="end">
                          <ClearIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ) : null,
                  }}
                  sx={{
                    minWidth: { xs: '100%', sm: 240, md: 280 },
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                    },
                  }}
                />
              )}
              {actions}
            </Box>
          </Box>

          {/* Secondary filter slot */}
          {filters && (
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: 1.5,
                pt: 1,
              }}
            >
              {filters}
            </Box>
          )}
        </CardContent>
      )}

      {/* Table Area */}
      <TableContainer component={Paper} elevation={0} sx={{ bgcolor: 'transparent' }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead
            sx={{
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(15, 23, 42, 0.03)',
            }}
          >
            <TableRow>
              {selectable && (
                <TableCell padding="checkbox" sx={{ width: 48 }}>
                  <Checkbox
                    checked={isAllSelected}
                    indeterminate={isIndeterminate}
                    onChange={(e) => onSelectAll?.(e.target.checked)}
                    disabled={loading || data.length === 0}
                  />
                </TableCell>
              )}
              {columns.map((col) => (
                <TableCell
                  key={col.key}
                  align={col.align || 'left'}
                  sx={{
                    width: col.width,
                    minWidth: col.minWidth,
                    fontWeight: 700,
                    fontSize: '0.8125rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: 'text.secondary',
                    py: 1.75,
                    borderBottom: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  {col.sortable && onSort ? (
                    <TableSortLabel
                      active={sortColumn === col.key}
                      direction={sortColumn === col.key ? sortDirection : 'asc'}
                      onClick={() => handleSortClick(col.key)}
                    >
                      {col.label}
                    </TableSortLabel>
                  ) : (
                    col.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              Array.from({ length: rowsPerPage }).map((_, rIdx) => (
                <TableRow key={`skeleton-row-${rIdx}`}>
                  {selectable && (
                    <TableCell padding="checkbox">
                      <Skeleton variant="rounded" width={20} height={20} />
                    </TableCell>
                  )}
                  {columns.map((col, cIdx) => (
                    <TableCell key={`skeleton-col-${cIdx}`} align={col.align || 'left'} sx={{ py: 2 }}>
                      <Skeleton
                        variant="text"
                        width={cIdx === 0 ? '60%' : cIdx === 1 ? '85%' : '70%'}
                        height={24}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  align="center"
                  sx={{ py: 8 }}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 72,
                        height: 72,
                        borderRadius: '50%',
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                        color: theme.palette.primary.main,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 1,
                      }}
                    >
                      {emptyIcon || <InboxOutlinedIcon sx={{ fontSize: 36 }} />}
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {emptyMessage}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, textAlign: 'center' }}>
                      {emptyDescription}
                    </Typography>
                    {emptyAction && <Box sx={{ mt: 1 }}>{emptyAction}</Box>}
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              data.map((item, rIdx) => {
                const id = getRowId(item);
                const isSelected = selectable && selectedIds.includes(id);

                return (
                  <TableRow
                    key={String(id || rIdx)}
                    hover
                    selected={isSelected}
                    onClick={() => onRowClick?.(item)}
                    sx={{
                      cursor: onRowClick ? 'pointer' : 'default',
                      transition: 'background-color 150ms ease',
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.04),
                      },
                    }}
                  >
                    {selectable && (
                      <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={isSelected}
                          onChange={(e) => onSelectRow?.(item, e.target.checked)}
                        />
                      </TableCell>
                    )}
                    {columns.map((col) => (
                      <TableCell
                        key={col.key}
                        align={col.align || 'left'}
                        sx={{
                          py: 1.75,
                          fontSize: '0.875rem',
                          borderBottom: `1px solid ${theme.palette.divider}`,
                        }}
                      >
                        {col.render ? col.render(item, rIdx) : item[col.key] ?? '—'}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination Bar */}
      {onPageChange && (
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_e, newPage) => onPageChange(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            onRowsPerPageChange?.(parseInt(e.target.value, 10));
            onPageChange(0);
          }}
          rowsPerPageOptions={rowsPerPageOptions}
          labelRowsPerPage="Số dòng mỗi trang:"
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} trên ${count !== -1 ? count : `hơn ${to}`}`}
          sx={{
            borderTop: `1px solid ${theme.palette.divider}`,
            '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
              fontSize: '0.8125rem',
              color: 'text.secondary',
            },
          }}
        />
      )}
    </Card>
  );
}

export default DataTable;
