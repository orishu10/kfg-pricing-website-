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
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import { SearchBar } from "../searchBar/SearchBar";
import { ErrorAlert } from "../errorAlert/ErrorAlert";
import { downloadXlsx, parseXlsx, type CellValue } from "../../utils/xlsx";

export interface Column<T> {
  key: string;
  label: string;
  align?: "left" | "center" | "right";
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
  /** When provided, adds an Edit entry to each row's actions menu */
  onEdit?: (row: T) => void;
  /** When provided, adds a Delete entry to each row's actions menu */
  onDelete?: (row: T) => void;
  pageSize?: number;
  emptyMessage?: string;
  // --- Toolbar (mini-header rendered above the table) ---
  /** Title shown on the left of the toolbar */
  title?: string;
  /** Renders a "+" add button on the toolbar */
  onAdd?: () => void;
  /** Controlled search value; renders a compact search box when set with onSearchChange */
  search?: string;
  onSearchChange?: (v: string) => void;
  searchPlaceholder?: string;
  /** Renders a filter icon on the toolbar (alongside search) */
  onFilter?: () => void;
  /** When set, shows a download icon that exports the rows as this .xlsx file */
  exportFileName?: string;
  /**
   * When provided, shows an upload icon. Receives one object per data row,
   * keyed by the column `key` of each header that matched the file. The page
   * validates required fields and performs the actual creation.
   */
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
  onDelete,
  pageSize = 12,
  emptyMessage = "No records.",
  title,
  onAdd,
  search,
  onSearchChange,
  searchPlaceholder = "Search…",
  onFilter,
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasActions = !!(onEdit || onDelete);
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
      {showToolbar && (
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
            {showSearch && (
              <Tooltip title="Filter">
                <IconButton
                  size="small"
                  onClick={onFilter}
                  aria-label="Filter"
                  sx={{ color: "text.secondary" }}
                >
                  <FilterAltIcon fontSize="small" />
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
        </Box>
      )}

      {importError && (
        <Box sx={{ px: 2, pt: 1.5 }}>
          <ErrorAlert message={importError} />
        </Box>
      )}

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
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
          {emptyMessage}
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
