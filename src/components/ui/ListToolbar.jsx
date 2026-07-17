import React, {
  Children,
  Fragment,
  isValidElement,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
  memo,
} from 'react';
import {
  Button,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Tooltip,
  Badge,
  CircularProgress,
  TextField,
  InputAdornment,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import DescriptionIcon from '@mui/icons-material/Description';
import CloseIcon from '@mui/icons-material/Close';
import FilterListIcon from '@mui/icons-material/FilterList';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

/* ────────────────────────────────────────────── constants ── */
const TOOLBAR_ACTION_GAP = 8;
const OVERFLOW_TRIGGER_WIDTH = 44;

/* ────────────────────────────────────────────── helpers ──── */
function flattenNodes(node) {
  const items = [];
  Children.forEach(node, (child) => {
    if (child == null || typeof child === 'boolean') return;
    if (isValidElement(child) && child.type === Fragment) {
      items.push(...flattenNodes(child.props.children));
      return;
    }
    items.push(child);
  });
  return items;
}

function isHiddenInput(node) {
  if (!isValidElement(node) || node.type !== 'input') return false;
  const type = (node.props.type || '').toLowerCase();
  const cls = node.props.className || '';
  return type === 'file' || type === 'hidden' || cls.includes('hidden');
}

/* ────────────────── downloadBlob (replaces file-saver) ──── */
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

/**
 * ListToolbar — MUI port of hr-v5 ListToolbar.
 *
 * Features:
 *  - Keyword search with clear button
 *  - Tìm kiếm / Đặt lại buttons
 *  - Filter toggle with active count badge
 *  - Thêm mới, Xuất Excel, Nhập Excel, Tải mẫu nhập, Xóa (bulk)
 *  - Responsive overflow → actions collapse into MoreHoriz dropdown
 *  - Extra buttons slot
 */
function ListToolbar({
  // ─── search ───
  keyword = '',
  onKeywordChange,
  searchPlaceholder,

  // ─── search controlled draft ───
  searchDraft,
  onSearchDraftChange,
  onSearch,

  // ─── reset ───
  onReset,

  // ─── add ───
  onAdd,
  addLabel,
  addDisabled = false,

  // ─── download template ───
  onDownloadTemplate,
  templateFileName = 'template.xlsx',
  downloadTemplateOptions,

  // ─── import ───
  onImport,
  importOptions,

  // ─── export ───
  onExport,
  exportFileName = 'export.xlsx',

  // ─── bulk delete ───
  selectedCount = 0,
  onBulkDelete,
  bulkDeleting = false,

  // ─── filter ───
  filter,

  // ─── extra ───
  extraButtons,
  searchExtraControls,
  filterExtraControls,
}) {
  const { t } = useTranslation();
  const resolvedSearchPlaceholder = searchPlaceholder !== undefined ? searchPlaceholder : t('common.search_placeholder', 'Tìm kiếm…');
  const resolvedAddLabel = addLabel !== undefined ? addLabel : t('common.add', 'Thêm mới');

  const fileInputRef = useRef(null);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);
  const [pendingImportIdx, setPendingImportIdx] = useState(0);
  const [resetKey, setResetKey] = useState(0);

  // ─── Dropdown anchors ───
  const [overflowAnchor, setOverflowAnchor] = useState(null);
  const [compactAnchor, setCompactAnchor] = useState(null);
  const [templateAnchor, setTemplateAnchor] = useState(null);
  const [importAnchor, setImportAnchor] = useState(null);

  // ─── Resolved option arrays ───
  const templateOpts = downloadTemplateOptions ??
    (onDownloadTemplate
      ? [{ label: t('common.download_template', 'Tải mẫu'), fileName: templateFileName, onDownload: onDownloadTemplate }]
      : []);

  const importOpts = importOptions ??
    (onImport ? [{ label: t('common.import_excel', 'Nhập Excel'), onImport }] : []);

  // ─── Draft (controlled vs uncontrolled) ───
  const isControlled = searchDraft !== undefined;
  const [internalDraft, setInternalDraft] = useState(keyword ?? '');
  useEffect(() => {
    if (!isControlled && !keyword) setInternalDraft('');
  }, [keyword, isControlled]);

  const currentDraft = isControlled ? (searchDraft ?? '') : internalDraft;
  const updateDraft = (v) => {
    if (isControlled) onSearchDraftChange?.(v);
    else setInternalDraft(v);
  };

  // ─── Search ───
  const handleSearch = useCallback(() => {
    if (isControlled) {
      onSearch?.();
    } else {
      onKeywordChange?.(currentDraft);
      onSearch?.();
    }
  }, [isControlled, onSearch, onKeywordChange, currentDraft]);

  const clearSearch = useCallback(() => {
    updateDraft('');
    if (isControlled) {
      onSearch?.();
    } else {
      onKeywordChange?.('');
      onSearch?.();
    }
  }, [isControlled, onSearch, onKeywordChange]);

  // ─── Download template ───
  const handleDownloadTemplate = async (option) => {
    if (!option || downloadingTemplate) return;
    try {
      setDownloadingTemplate(true);
      const blob = await option.onDownload();
      downloadBlob(blob, option.fileName);
      toast.success(t('common.download_template_success', 'Tải mẫu thành công'));
    } catch {
      toast.error(t('common.download_template_failed', 'Tải mẫu thất bại'));
    } finally {
      setDownloadingTemplate(false);
    }
  };

  // ─── Import ───
  const handleImportClick = (idx = 0) => {
    setPendingImportIdx(idx);
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    const opt = importOpts[pendingImportIdx];
    if (!file || !opt) return;
    try {
      setImporting(true);
      await opt.onImport(file);
      toast.success(t('common.import_success', 'Nhập Excel thành công'));
    } catch (err) {
      let msg = t('common.import_failed', 'Nhập Excel thất bại');
      if (err?.response?.data) {
        if (typeof err.response.data === 'string') msg = err.response.data;
        else if (err.response.data.message) msg = err.response.data.message;
      } else if (err?.message) {
        msg = err.message;
      }
      toast.error(msg);
    } finally {
      setImporting(false);
      setPendingImportIdx(0);
    }
  };

  // ─── Export ───
  const handleExport = async () => {
    if (!onExport || exporting) return;
    try {
      setExporting(true);
      const blob = await onExport();
      if (!blob) return;
      downloadBlob(blob, exportFileName);
      toast.success(t('common.export_success', 'Xuất Excel thành công'));
    } catch (err) {
      if (err?.name === 'ExportCancelled') return;
      toast.error(t('common.export_failed', 'Xuất Excel thất bại'));
    } finally {
      setExporting(false);
    }
  };

  // ─── Extra buttons ───
  const extraToolbarNodes = useMemo(() => flattenNodes(extraButtons), [extraButtons]);
  const extraHiddenNodes = extraToolbarNodes.filter(isHiddenInput);
  const extraActionNodes = extraToolbarNodes.filter((n) => !isHiddenInput(n));

  // ─── Build actions array ───
  const optionalActions = useMemo(() => {
    const actions = [];

    // Bulk delete
    if (onBulkDelete) {
      actions.push({
        key: 'bulk-delete',
        icon: bulkDeleting ? <CircularProgress size={14} /> : <DeleteIcon fontSize="small" />,
        label: `${t('common.delete', 'Xoá')}${selectedCount > 0 ? ` (${selectedCount})` : ''}`,
        onClick: onBulkDelete,
        disabled: bulkDeleting || selectedCount === 0,
        color: selectedCount > 0 ? 'error' : 'inherit',
        variant: 'outlined',
      });
    }

    // Template download
    if (templateOpts.length === 1) {
      actions.push({
        key: 'template',
        icon: downloadingTemplate ? <CircularProgress size={14} /> : <DescriptionIcon fontSize="small" />,
        label: t('common.download_template', 'Tải mẫu'),
        onClick: () => handleDownloadTemplate(templateOpts[0]),
        disabled: downloadingTemplate,
        variant: 'outlined',
      });
    } else if (templateOpts.length > 1) {
      actions.push({
        key: 'template',
        icon: downloadingTemplate ? <CircularProgress size={14} /> : <DescriptionIcon fontSize="small" />,
        label: t('common.download_template', 'Tải mẫu'),
        onClick: (e) => setTemplateAnchor(e.currentTarget),
        disabled: downloadingTemplate,
        variant: 'outlined',
        hasSubmenu: true,
      });
    }

    // Import
    if (importOpts.length === 1) {
      actions.push({
        key: 'import',
        icon: importing ? <CircularProgress size={14} /> : <FileUploadIcon fontSize="small" />,
        label: t('common.import_excel', 'Nhập Excel'),
        onClick: () => handleImportClick(0),
        disabled: importing,
        variant: 'outlined',
      });
    } else if (importOpts.length > 1) {
      actions.push({
        key: 'import',
        icon: importing ? <CircularProgress size={14} /> : <FileUploadIcon fontSize="small" />,
        label: t('common.import_excel', 'Nhập Excel'),
        onClick: (e) => setImportAnchor(e.currentTarget),
        disabled: importing,
        variant: 'outlined',
        hasSubmenu: true,
      });
    }

    // Export
    if (onExport) {
      actions.push({
        key: 'export',
        icon: exporting ? <CircularProgress size={14} /> : <FileDownloadIcon fontSize="small" />,
        label: t('common.export_excel', 'Xuất Excel'),
        onClick: handleExport,
        disabled: exporting,
        variant: 'outlined',
      });
    }

    // Extra action nodes
    extraActionNodes.forEach((node, idx) => {
      actions.push({ key: `extra-${idx}`, customNode: node });
    });

    return actions;
  }, [
    onBulkDelete, selectedCount, bulkDeleting,
    templateOpts, downloadingTemplate,
    importOpts, importing,
    onExport, exporting,
    extraActionNodes,
    t,
  ]);

  // ─── Responsive overflow logic ───
  const toolbarRef = useRef(null);
  const actionsAreaRef = useRef(null);
  const actionRefs = useRef({});
  const addActionRef = useRef(null);
  const widthCache = useRef({});
  const addWidthRef = useRef(0);
  const [visibleCount, setVisibleCount] = useState(null);
  const [layoutReady, setLayoutReady] = useState(false);

  const actionSignature = optionalActions.map((a) => a.key).join('|');

  useLayoutEffect(() => {
    widthCache.current = {};
    setVisibleCount(optionalActions.length);
    setLayoutReady(false);
  }, [actionSignature, optionalActions.length]);

  useLayoutEffect(() => {
    const calc = () => {
      const area = actionsAreaRef.current;
      if (!area) return;

      const next = { ...widthCache.current };
      let missing = false;

      for (const action of optionalActions) {
        const el = actionRefs.current[action.key];
        const w = el?.getBoundingClientRect().width ?? 0;
        if (el) next[action.key] = w;
        if (next[action.key] === undefined) missing = true;
      }
      widthCache.current = next;

      if (onAdd && addActionRef.current) {
        addWidthRef.current = addActionRef.current.getBoundingClientRect().width;
      }

      if (missing) {
        setVisibleCount(optionalActions.length);
        setLayoutReady(false);
        return;
      }

      const areaWidth = area.getBoundingClientRect().width;
      const total = optionalActions.length;
      const addW = onAdd ? addWidthRef.current : 0;
      let best = total;

      for (let c = total; c >= 0; c--) {
        const hasOverflow = c < total;
        const visW = optionalActions
          .slice(0, c)
          .reduce((s, a) => s + (next[a.key] ?? 0), 0);
        const itemCount = c + (hasOverflow ? 1 : 0) + (onAdd ? 1 : 0);
        const totalW =
          visW +
          (hasOverflow ? OVERFLOW_TRIGGER_WIDTH : 0) +
          addW +
          Math.max(0, itemCount - 1) * TOOLBAR_ACTION_GAP;

        if (totalW <= areaWidth || c === 0) {
          best = c;
          break;
        }
      }

      setVisibleCount((prev) => (prev === best ? prev : best));
      setLayoutReady(true);
    };

    calc();

    if (typeof ResizeObserver === 'undefined') return;
    const obs = new ResizeObserver(calc);
    if (toolbarRef.current) obs.observe(toolbarRef.current);
    if (actionsAreaRef.current) obs.observe(actionsAreaRef.current);
    return () => obs.disconnect();
  }, [actionSignature, optionalActions, onAdd]);

  const resolved = visibleCount ?? optionalActions.length;
  const visibleActions = optionalActions.slice(0, resolved);
  const overflowActions = optionalActions.slice(resolved);
  const hasDesktop = optionalActions.length > 0 || Boolean(onAdd);
  const hasOverflow = overflowActions.length > 0;

  const setActionRef = (key) => (node) => {
    actionRefs.current[key] = node;
  };

  /* ────── render helpers ────── */
  const renderActionButton = (action) => {
    if (action.customNode) return action.customNode;
    const isOutlined = action.variant === 'outlined';
    return (
      <Button
        key={action.key}
        variant={isOutlined ? 'outlined' : 'contained'}
        color={action.color || 'inherit'}
        size="small"
        disabled={action.disabled}
        onClick={action.onClick}
        startIcon={action.icon}
        className={`
          normal-case whitespace-nowrap h-[32px] font-medium
          ${isOutlined ? 'border-border text-foreground hover:bg-muted' : ''}
          ${action.color === 'error' ? 'border-destructive text-destructive hover:bg-destructive/10' : ''}
        `}
      >
        {action.label}
      </Button>
    );
  };

  const renderMenuItem = (action, closeMenu) => {
    if (action.customNode) {
      return (
        <MenuItem 
          key={action.key} 
          onClick={closeMenu} 
          className="mx-1 my-0.5 px-3 rounded-md text-foreground hover:bg-sidebar-accent/40 hover:text-sidebar-accent-foreground flex items-center gap-3 transition-colors cursor-pointer !p-0"
        >
          <div className="w-full px-2 py-1">{action.customNode}</div>
        </MenuItem>
      );
    }
    return (
      <MenuItem
        key={action.key}
        disabled={action.disabled}
        onClick={(e) => {
          action.onClick?.(e);
          closeMenu();
        }}
        className="mx-1 my-0.5 px-3 rounded-md text-foreground hover:bg-sidebar-accent/40 hover:text-sidebar-accent-foreground flex items-center gap-3 text-sm transition-colors cursor-pointer"
      >
        {action.icon}
        {action.label}
      </MenuItem>
    );
  };

  return (
    <div ref={toolbarRef} className="mb-3 flex items-start min-w-0 flex-wrap gap-2 xl:flex-nowrap xl:items-center">
      {/* ────── Left: search (row 1) + buttons (row 2 on mobile) ────── */}
      <div className="flex min-w-0 flex-1 flex-wrap gap-2 xl:min-w-[560px] xl:flex-none xl:flex-nowrap">
        {/* Search input — full width on mobile, flex-1 on sm+ */}
        <TextField
          value={currentDraft}
          onChange={(e) => updateDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder={resolvedSearchPlaceholder}
          size="small"
          variant="outlined"
          className="w-full sm:min-w-0 sm:flex-1 xl:flex-initial xl:w-[300px]"
        />

        {/* Nhóm nút — xuống dòng row 2 trên mobile, cùng hàng trên sm+ */}
        <div className="flex shrink-0 items-center gap-2">
          {/* Tìm kiếm button */}
          <Button
            variant="outlined"
            size="small"
            onClick={handleSearch}
            startIcon={<SearchIcon fontSize="small" />}
            className="normal-case whitespace-nowrap font-medium border-border text-foreground hover:bg-muted"
          >
            <span>{t('common.search', 'Tìm kiếm')}</span>
          </Button>

          {/* Extra search controls */}
          {searchExtraControls && (
            <div className="min-w-0">{searchExtraControls}</div>
          )}

          {/* Filter toggle */}
          {filter && (
            <Tooltip title={t('common.filter_tooltip', 'Bộ lọc nâng cao')} arrow>
              <Button
                variant={filter.open ? 'contained' : 'outlined'}
                size="small"
                onClick={() => filter.onToggle(!filter.open)}
                startIcon={
                  <FilterListIcon
                    fontSize="small"
                    className={`transition-transform duration-300 ${filter.open ? 'rotate-180' : ''}`}
                  />
                }
                className={`
                  normal-case whitespace-nowrap
                  ${filter.open ? '' : 'border-border text-foreground hover:bg-muted'}
                  ${filter.activeCount > 0 && !filter.open ? 'border-primary ring-1 ring-primary' : ''}
                `}
              >
                <span>{t('common.filter', 'Bộ lọc')}</span>
                {filter.activeCount > 0 && (
                  <span className={`
                    ml-1 px-1.5 py-0.5 text-xs font-bold rounded-full transition-colors duration-200
                    ${filter.open 
                      ? 'bg-white text-primary dark:bg-slate-900 dark:text-primary-light' 
                      : 'bg-primary text-primary-foreground'
                    }
                  `}>
                    {filter.activeCount}
                  </span>
                )}
              </Button>
            </Tooltip>
          )}

          {/* Extra filter controls */}
          {filterExtraControls && (
            <div className="min-w-0">{filterExtraControls}</div>
          )}
        </div>
      </div>

      {/* Compact menu — cùng hàng với search (row 1) ở mobile, ẩn trên desktop */}
      {hasDesktop && (
        <div className="flex xl:hidden shrink-0 items-center gap-2">
          <Button
            variant="outlined"
            color="inherit"
            size="small"
            onClick={(e) => setCompactAnchor(e.currentTarget)}
            className="!min-w-0 w-[32px] h-[32px] p-0 border-border text-foreground hover:bg-muted rounded-lg"
          >
            <MoreHorizIcon fontSize="small" />
          </Button>
          <Menu
            anchorEl={compactAnchor}
            open={Boolean(compactAnchor)}
            onClose={() => setCompactAnchor(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            PaperProps={{
              className: "border border-border bg-popover text-popover-foreground shadow-lg rounded-lg p-1 mt-1",
              sx: {
                width: 220,
                minWidth: 220,
                '& .MuiMenuItem-root': {
                  minHeight: 40,
                  height: 40,
                  fontSize: '14px',
                  gap: '12px'
                }
              }
            }}
          >
            {onAdd && (
              <MenuItem
                disabled={addDisabled}
                onClick={() => { onAdd(); setCompactAnchor(null); }}
                className="mx-1 my-0.5 px-3 rounded-md text-foreground hover:bg-sidebar-accent/40 hover:text-sidebar-accent-foreground flex items-center gap-3 text-sm transition-colors cursor-pointer"
              >
                <AddIcon fontSize="small" />
                {addLabel}
              </MenuItem>
            )}
            {onAdd && optionalActions.length > 0 && <Divider />}
            {optionalActions.map((a) => renderMenuItem(a, () => setCompactAnchor(null)))}
          </Menu>
        </div>
      )}

      {/* ────── Right: action buttons (desktop) ────── */}
      {hasDesktop && (
        <div
          ref={actionsAreaRef}
          className="ml-auto hidden min-w-0 flex-1 items-center justify-end gap-2 overflow-hidden xl:flex"
          style={{ opacity: layoutReady ? 1 : 0 }}
        >
          {visibleActions.map((action) => (
            <div
              key={action.key}
              ref={setActionRef(action.key)}
              className="flex shrink-0 items-center"
            >
              {renderActionButton(action)}
            </div>
          ))}

          {/* Overflow trigger */}
          {hasOverflow && (
            <div className="flex shrink-0 items-center">
              <Button
                variant="outlined"
                color="inherit"
                size="small"
                onClick={(e) => setOverflowAnchor(e.currentTarget)}
                className="!min-w-0 w-[32px] h-[32px] p-0 border-border text-foreground hover:bg-muted rounded-lg"
              >
                <MoreHorizIcon fontSize="small" />
              </Button>
              <Menu
                anchorEl={overflowAnchor}
                open={Boolean(overflowAnchor)}
                onClose={() => setOverflowAnchor(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                PaperProps={{
                  className: "border border-border bg-popover text-popover-foreground shadow-lg rounded-lg p-1 mt-1",
                  sx: {
                    width: 220,
                    minWidth: 220,
                    '& .MuiMenuItem-root': {
                      minHeight: 40,
                      height: 40,
                      fontSize: '14px',
                      gap: '12px'
                    }
                  }
                }}
              >
                {overflowActions.map((a) => renderMenuItem(a, () => setOverflowAnchor(null)))}
              </Menu>
            </div>
          )}

          {/* Add button — always last */}
          {onAdd && (
            <div ref={addActionRef} className="flex shrink-0 items-center">
              <Button
                variant="contained"
                size="small"
                onClick={onAdd}
                disabled={addDisabled}
                startIcon={<AddIcon fontSize="small" />}
                className="normal-case whitespace-nowrap !shadow-none"
              >
                {addLabel}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* ────── Hidden file input ────── */}
      {importOpts.length > 0 && (
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={handleFileSelected}
        />
      )}
      {extraHiddenNodes.map((node, i) => (
        <Fragment key={`eh-${i}`}>{node}</Fragment>
      ))}

      {/* ────── Submenu: template options ────── */}
      {templateOpts.length > 1 && (
        <Menu
          anchorEl={templateAnchor}
          open={Boolean(templateAnchor)}
          onClose={() => setTemplateAnchor(null)}
          PaperProps={{
            className: "border border-border bg-popover text-popover-foreground shadow-lg rounded-lg p-1 mt-1",
            sx: {
              width: 220,
              minWidth: 220,
              '& .MuiMenuItem-root': {
                minHeight: 40,
                height: 40,
                fontSize: '14px',
                gap: '12px'
              }
            }
          }}
        >
          {templateOpts.map((opt) => (
            <MenuItem
              key={`${opt.label}-${opt.fileName}`}
              disabled={downloadingTemplate}
              onClick={() => { handleDownloadTemplate(opt); setTemplateAnchor(null); }}
              className="text-xs"
            >
              {opt.label}
            </MenuItem>
          ))}
        </Menu>
      )}

      {/* ────── Submenu: import options ────── */}
      {importOpts.length > 1 && (
        <Menu
          anchorEl={importAnchor}
          open={Boolean(importAnchor)}
          onClose={() => setImportAnchor(null)}
          PaperProps={{
            className: "border border-border bg-popover text-popover-foreground shadow-lg rounded-lg p-1 mt-1",
            sx: {
              width: 220,
              minWidth: 220,
              '& .MuiMenuItem-root': {
                minHeight: 40,
                height: 40,
                fontSize: '14px',
                gap: '12px'
              }
            }
          }}
        >
          {importOpts.map((opt, idx) => (
            <MenuItem
              key={opt.label}
              disabled={importing}
              onClick={() => { handleImportClick(idx); setImportAnchor(null); }}
              className="text-xs"
            >
              {opt.label}
            </MenuItem>
          ))}
        </Menu>
      )}
    </div>
  );
}

export default memo(ListToolbar);
