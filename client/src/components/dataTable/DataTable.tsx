import { useRef, useState } from "react";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Popover from "@mui/material/Popover";
import Badge from "@mui/material/Badge";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import SearchIcon from "@mui/icons-material/Search";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import CloseIcon from "@mui/icons-material/Close";
import Checkbox from "@mui/material/Checkbox";
import { SearchBar } from "../searchBar/SearchBar";
import { ErrorAlert } from "../errorAlert/ErrorAlert";
import { downloadXlsx, parseXlsx, type CellValue } from "../../utils/xlsx";

export interface Column<T> {
  key: string;
  label: string;
  align?: "left" | "center" | "right";
  sortable?: boolean;
  mono?: boolean;
  render?: (row: T) => React.ReactNode;
  value?: (row: T) => string | number | null;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  getRowId: (row: T) => string;
  onRowClick?: (row: T) => void;
  onEdit?: (row: T) => void;
  onDuplicate?: (row: T) => void;
  onDelete?: (row: T) => void;
  selectable?: boolean;
  renderBulkActions?: (selected: T[], clear: () => void) => React.ReactNode;
  pageSize?: number;
  emptyMessage?: string;
  title?: string;
  onAdd?: () => void;
  search?: string;
  onSearchChange?: (v: string) => void;
  searchPlaceholder?: string;
  exportFileName?: string;
  onImport?: (rows: Record<string, string>[]) => void;
}

const HEADER_BG = "#7c7f83";
const COL_DIVIDER = "1px solid #e0e0e0";
const HEAD_DIVIDER = "1px solid rgba(255,255,255,0.3)";

const headCellSx = {
  bgcolor: HEADER_BG,
  color: "#fff",
  fontWeight: 700,
  fontSize: "0.78rem",
  letterSpacing: "0.5px",
  textTransform: "uppercase",
  whiteSpace: "nowrap",
  borderBottom: "none",
  py: 1.25,
} as const;

const pageBtnSx = (active: boolean) => ({
  minWidth: 30,
  height: 30,
  px: 1,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  border: "1px solid",
  borderColor: active ? "primary.main" : "rgba(0,0,0,0.15)",
  bgcolor: active ? "primary.main" : "#fff",
  color: active ? "#fff" : "text.secondary",
  borderRadius: 1,
  cursor: "pointer",
  fontSize: "0.8rem",
  userSelect: "none",
  "&:hover": { bgcolor: active ? "primary.main" : "rgba(0,0,0,0.05)" },
});

export function DataTable<T>({
  columns,
  rows,
  getRowId,
  onRowClick,
  onEdit,
  onDuplicate,
  onDelete,
  selectable,
  renderBulkActions,
  pageSize = 12,
  emptyMessage = "No records.",
  title,
  onAdd,
  search,
  onSearchChange,
  searchPlaceholder = "Search…",
  exportFileName,
  onImport,
}: DataTableProps<T>) {
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" } | null>(
    null,
  );
  const [page, setPage] = useState(1);
  const [menu, setMenu] = useState<{ anchor: HTMLElement; row: T } | null>(
    null,
  );
  const [importError, setImportError] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [filterCol, setFilterCol] = useState<{ key: string; anchor: HTMLElement } | null>(null);
  const [optSearch, setOptSearch] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const clearSelection = () => setSelected(new Set());
  const toggleRow = (id: string) =>
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const hasActions = !!(onEdit || onDuplicate || onDelete);
  const showToolbar = !!(
    title ||
    onAdd ||
    onSearchChange ||
    exportFileName ||
    onImport
  );
  const showSearch = onSearchChange !== undefined;

  const rawValue = (col: Column<T>, row: T) =>
    col.value ? col.value(row) : (row as Record<string, unknown>)[col.key];

  const displayText = (col: Column<T>, row: T): string => {
    if (col.render) {
      const node = col.render(row);
      if (typeof node === "string" || typeof node === "number") return String(node);
    }
    const v = rawValue(col, row);
    return v == null ? "" : String(v);
  };

  const optionsFor = (col: Column<T>) =>
    Array.from(new Set(rows.map((r) => displayText(col, r)).filter((s) => s !== ""))).sort(
      (a, b) => a.localeCompare(b, undefined, { numeric: true }),
    );

  const activeFilters = Object.entries(filters).filter(([, v]) => v.length > 0);

  const filtered =
    activeFilters.length === 0
      ? rows
      : rows.filter((row) =>
          activeFilters.every(([key, vals]) => {
            const col = columns.find((c) => c.key === key);
            return col ? vals.includes(displayText(col, row)) : true;
          }),
        );

  const setFilter = (key: string, values: string[]) => {
    setFilters((f) => ({ ...f, [key]: values }));
    setPage(1);
  };
  const clearFilters = () => {
    setFilters({});
    setPage(1);
  };
  const openFilter = (key: string, anchor: HTMLElement) => {
    setFilterCol({ key, anchor });
    setOptSearch("");
  };
  const closeFilter = () => setFilterCol(null);
  const toggleValue = (key: string, val: string) => {
    const cur = filters[key] ?? [];
    setFilter(key, cur.includes(val) ? cur.filter((v) => v !== val) : [...cur, val]);
  };

  let ordered = filtered;
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
          typeof av === "number" && typeof bv === "number"
            ? av - bv
            : String(av).localeCompare(String(bv), undefined, {
                numeric: true,
              });
        return sort.dir === "asc" ? cmp : -cmp;
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

  const pageIds = pageRows.map(getRowId);
  const allPageSelected = pageIds.length > 0 && pageIds.every((id) => selected.has(id));
  const somePageSelected = pageIds.some((id) => selected.has(id));
  const toggleAllPage = () =>
    setSelected((s) => {
      const next = new Set(s);
      if (allPageSelected) pageIds.forEach((id) => next.delete(id));
      else pageIds.forEach((id) => next.add(id));
      return next;
    });
  const selectedRows = rows.filter((r) => selected.has(getRowId(r)));
  const selecting = !!selectable && selectedRows.length > 0;

  const toggleSort = (key: string) =>
    setSort((s) =>
      s && s.key === key
        ? { key, dir: s.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" },
    );

  const closeMenu = () => setMenu(null);
  const runAction = (fn?: (row: T) => void) => () => {
    if (menu && fn) fn(menu.row);
    closeMenu();
  };

  const handleExport = () => {
    const headers = columns.map((c) => c.label);
    const data: CellValue[][] = ordered.map((row) =>
      columns.map((col) => {
        const v = rawValue(col, row);
        return v == null ? "" : (v as CellValue);
      }),
    );
    downloadXlsx(exportFileName!, title ?? exportFileName!, headers, data);
  };

  const handleImportFile = async (file: File) => {
    setImportError("");
    try {
      const matrix = await parseXlsx(file);
      if (matrix.length < 2) throw new Error("The file has no data rows");

      const header = matrix[0].map((h) => h.trim().toLowerCase());
      const colIndex = columns.map((c) => header.indexOf(c.label.toLowerCase()));
      if (colIndex.every((i) => i < 0)) {
        throw new Error("The file's columns don't match this table");
      }

      const rows = matrix
        .slice(1)
        .filter((r) => r.some((cell) => cell.trim() !== ""))
        .map((r) => {
          const obj: Record<string, string> = {};
          columns.forEach((col, i) => {
            if (colIndex[i] >= 0) obj[col.key] = (r[colIndex[i]] ?? "").trim();
          });
          return obj;
        });

      onImport!(rows);
    } catch (err) {
      setImportError(err instanceof Error ? err.message : "Failed to read the file");
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        border: "1px solid rgba(0,0,0,0.1)",
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      {(showToolbar || selecting) && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            px: 2,
            py: 1.25,
            borderBottom: "1px solid rgba(0,0,0,0.08)",
          }}
        >
          {selecting ? (
            <>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: "text.primary" }}>
                  {selectedRows.length} selected
                </Typography>
                <Tooltip title="Clear selection">
                  <IconButton size="small" onClick={clearSelection} aria-label="Clear selection">
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", justifyContent: "flex-end" }}>
                {renderBulkActions?.(selectedRows, clearSelection)}
              </Box>
            </>
          ) : (
            <>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: "1.05rem",
                color: "text.primary",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              {title}
            </Typography>
            {exportFileName && (
              <Tooltip title="Download as Excel">
                <IconButton
                  size="small"
                  onClick={handleExport}
                  aria-label="Download as Excel"
                  sx={{ color: "text.secondary" }}
                >
                  <FileDownloadIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {onImport && (
              <>
                <Tooltip title="Upload from Excel">
                  <IconButton
                    size="small"
                    onClick={() => fileInputRef.current?.click()}
                    aria-label="Upload from Excel"
                    sx={{ color: "text.secondary" }}
                  >
                    <FileUploadIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx"
                  hidden
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImportFile(file);
                    e.target.value = "";
                  }}
                />
              </>
            )}
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {showSearch && (
              <Box sx={{ width: { xs: 150, sm: 220 } }}>
                <SearchBar
                  value={search ?? ""}
                  onChange={onSearchChange!}
                  placeholder={searchPlaceholder}
                  size="small"
                />
              </Box>
            )}
            {activeFilters.length > 0 && (
              <Tooltip title="Clear all filters">
                <IconButton
                  size="small"
                  onClick={clearFilters}
                  aria-label="Clear all filters"
                  sx={{ color: "primary.main" }}
                >
                  <Badge badgeContent={activeFilters.length} color="primary">
                    <FilterAltIcon fontSize="small" />
                  </Badge>
                </IconButton>
              </Tooltip>
            )}
            {onAdd && (
              <Tooltip title={title ? `Add ${title.replace(/s$/, "")}` : "Add"}>
                <IconButton
                  onClick={onAdd}
                  aria-label="Add"
                  sx={{ color: "text.secondary" }}
                >
                  <AddCircleIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
            </>
          )}
        </Box>
      )}

      {importError && (
        <Box sx={{ px: 2, pt: 1.5 }}>
          <ErrorAlert message={importError} />
        </Box>
      )}

      {(() => {
        if (!filterCol) return null;
        const col = columns.find((c) => c.key === filterCol.key);
        if (!col) return null;
        const selected = filters[col.key] ?? [];
        const all = optionsFor(col);
        const q = optSearch.trim().toLowerCase();
        const shown = q ? all.filter((o) => o.toLowerCase().includes(q)) : all;
        const allShownSelected = shown.length > 0 && shown.every((o) => selected.includes(o));
        const toggleAllShown = () =>
          setFilter(
            col.key,
            allShownSelected
              ? selected.filter((v) => !shown.includes(v))
              : Array.from(new Set([...selected, ...shown])),
          );
        return (
          <Popover
            open
            anchorEl={filterCol.anchor}
            onClose={closeFilter}
            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            transformOrigin={{ vertical: "top", horizontal: "left" }}
            slotProps={{ paper: { sx: { width: 260 } } }}
          >
            <Box sx={{ p: 1.5, pb: 1 }}>
              <Typography sx={{ fontWeight: 700, fontSize: "0.8rem", mb: 1 }}>
                Filter by {col.label}
              </Typography>
              <TextField
                value={optSearch}
                onChange={(e) => setOptSearch(e.target.value)}
                size="small"
                fullWidth
                placeholder="Search values…"
                autoFocus
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" sx={{ color: "text.secondary" }} />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Box>
            <Box sx={{ maxHeight: 260, overflowY: "auto", px: 0.5 }}>
              {shown.length === 0 ? (
                <Box sx={{ px: 1.5, py: 1, color: "text.secondary", fontSize: "0.8rem" }}>
                  No values
                </Box>
              ) : (
                <>
                  <MenuItem dense onClick={toggleAllShown}>
                    <Checkbox
                      size="small"
                      checked={allShownSelected}
                      indeterminate={!allShownSelected && shown.some((o) => selected.includes(o))}
                    />
                    <ListItemText primaryTypographyProps={{ fontWeight: 600, fontSize: "0.85rem" }}>
                      Select all
                    </ListItemText>
                  </MenuItem>
                  {shown.map((opt) => (
                    <MenuItem key={opt} dense onClick={() => toggleValue(col.key, opt)}>
                      <Checkbox size="small" checked={selected.includes(opt)} />
                      <ListItemText primaryTypographyProps={{ fontSize: "0.85rem" }}>
                        {opt}
                      </ListItemText>
                    </MenuItem>
                  ))}
                </>
              )}
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                px: 1.5,
                py: 1,
                borderTop: "1px solid rgba(0,0,0,0.08)",
              }}
            >
              <Button
                size="small"
                onClick={() => setFilter(col.key, [])}
                disabled={selected.length === 0}
                sx={{ textTransform: "none" }}
              >
                Clear
              </Button>
              <Button size="small" variant="contained" onClick={closeFilter} sx={{ textTransform: "none" }}>
                Done
              </Button>
            </Box>
          </Popover>
        );
      })()}

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              {selectable && (
                <TableCell padding="checkbox" sx={{ ...headCellSx, borderRight: HEAD_DIVIDER, width: 44 }}>
                  <Checkbox
                    size="small"
                    sx={{
                      color: "rgba(255,255,255,0.85)",
                      "&.Mui-checked": { color: "#fff" },
                      "&.MuiCheckbox-indeterminate": { color: "#fff" },
                    }}
                    checked={allPageSelected}
                    indeterminate={somePageSelected && !allPageSelected}
                    onChange={toggleAllPage}
                  />
                </TableCell>
              )}
              {columns.map((col, idx) => {
                const active = sort?.key === col.key;
                const showDivider = idx < columns.length - 1 || hasActions;
                return (
                  <TableCell
                    key={col.key}
                    align={col.align ?? "left"}
                    onClick={
                      col.sortable ? () => toggleSort(col.key) : undefined
                    }
                    sx={{
                      ...headCellSx,
                      borderRight: showDivider ? HEAD_DIVIDER : "none",
                      cursor: col.sortable ? "pointer" : "default",
                    }}
                  >
                    <Box
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 0.25,
                        verticalAlign: "middle",
                      }}
                    >
                      {col.label}
                      {col.sortable &&
                        (active && sort?.dir === "asc" ? (
                          <ArrowDropUpIcon sx={{ fontSize: 18 }} />
                        ) : (
                          <ArrowDropDownIcon sx={{ fontSize: 18 }} />
                        ))}
                      {col.sortable && (
                        <IconButton
                          size="small"
                          aria-label={`Filter ${col.label}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            openFilter(col.key, e.currentTarget);
                          }}
                          sx={{
                            ml: 0.25,
                            p: 0.25,
                            color: (filters[col.key]?.length ?? 0) > 0 ? "#fff" : "rgba(255,255,255,0.6)",
                          }}
                        >
                          {(filters[col.key]?.length ?? 0) > 0 ? (
                            <FilterAltIcon sx={{ fontSize: 16 }} />
                          ) : (
                            <FilterAltOutlinedIcon sx={{ fontSize: 16 }} />
                          )}
                        </IconButton>
                      )}
                    </Box>
                  </TableCell>
                );
              })}
              {hasActions && <TableCell sx={{ ...headCellSx, width: 48 }} />}
            </TableRow>
          </TableHead>
          <TableBody>
            {pageRows.map((row) => (
              <TableRow
                key={getRowId(row)}
                hover={!!onRowClick}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                sx={{ cursor: onRowClick ? "pointer" : "default" }}
              >
                {selectable && (
                  <TableCell padding="checkbox" sx={{ borderBottom: "1px solid #ececec", borderRight: COL_DIVIDER }}>
                    <Checkbox
                      size="small"
                      checked={selected.has(getRowId(row))}
                      onClick={(e) => e.stopPropagation()}
                      onChange={() => toggleRow(getRowId(row))}
                    />
                  </TableCell>
                )}
                {columns.map((col, idx) => {
                  const showDivider = idx < columns.length - 1 || hasActions;
                  return (
                    <TableCell
                      key={col.key}
                      align={col.align ?? "left"}
                      sx={{
                        fontSize: "0.85rem",
                        color: "text.primary",
                        borderBottom: "1px solid #ececec",
                        borderRight: showDivider ? COL_DIVIDER : "none",
                        fontFamily: col.mono ? "monospace" : undefined,
                        py: 1.15,
                      }}
                    >
                      {col.render
                        ? col.render(row)
                        : (((row as Record<string, unknown>)[
                            col.key
                          ] as React.ReactNode) ?? "")}
                    </TableCell>
                  );
                })}
                {hasActions && (
                  <TableCell
                    align="center"
                    sx={{
                      borderBottom: "1px solid #ececec",
                      py: 0.5,
                      width: 48,
                    }}
                  >
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenu({ anchor: e.currentTarget, row });
                      }}
                    >
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {hasActions && (
        <Menu
          anchorEl={menu?.anchor ?? null}
          open={!!menu}
          onClose={closeMenu}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
        >
          {onEdit && (
            <MenuItem onClick={runAction(onEdit)}>
              <ListItemIcon>
                <EditIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Edit</ListItemText>
            </MenuItem>
          )}
          {onDuplicate && (
            <MenuItem onClick={runAction(onDuplicate)}>
              <ListItemIcon>
                <ContentCopyIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Duplicate</ListItemText>
            </MenuItem>
          )}
          {onDelete && (
            <MenuItem
              onClick={runAction(onDelete)}
              sx={{ color: "error.main" }}
            >
              <ListItemIcon>
                <DeleteIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText>Delete</ListItemText>
            </MenuItem>
          )}
        </Menu>
      )}

      {total === 0 && (
        <Box sx={{ p: 3, textAlign: "center", color: "text.secondary" }}>
          {activeFilters.length ? "No records match your filters." : emptyMessage}
        </Box>
      )}

      {total > 0 && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 2,
            px: 2,
            py: 1.5,
          }}
        >
          <Typography sx={{ fontSize: "0.78rem", color: "text.secondary" }}>
            Displaying {from} to {to} of {total} items
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Box
              sx={pageBtnSx(false)}
              onClick={() => setPage(Math.max(1, safePage - 1))}
              aria-label="Previous page"
            >
              <ChevronLeftIcon sx={{ fontSize: 18 }} />
            </Box>
            {Array.from({ length: maxPage }, (_, i) => i + 1).map((p) => (
              <Box
                key={p}
                sx={pageBtnSx(p === safePage)}
                onClick={() => setPage(p)}
              >
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
