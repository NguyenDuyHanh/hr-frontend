import React, { useState, memo } from 'react';
import { Collapse, Button } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import CloseIcon from '@mui/icons-material/Close';
import TuneIcon from '@mui/icons-material/Tune';

/**
 * FilterPanel — Bộ lọc nâng cao.
 *
 * Phiên bản tối ưu hóa bằng Tailwind CSS của FilterPanel.
 * Dùng MUI Collapse để animate open/close.
 *
 * Props:
 *  - children      : các field filter (controlled bởi parent)
 *  - onApply       : callback khi click "Tìm kiếm"
 *  - onReset       : callback khi click "Đặt lại"
 *  - open          : controlled open state (dùng cùng ListToolbar filter.open)
 *  - onOpenChange  : callback khi open thay đổi
 *  - defaultOpen   : initial open state (uncontrolled mode)
 *  - disabled      : disable tất cả buttons
 *  - title         : tiêu đề panel (false để ẩn)
 *  - className     : class cho wrapper ngoài cùng
 */
function FilterPanel({
  children,
  onApply,
  onReset,
  open: controlledOpen,
  onOpenChange,
  defaultOpen = false,
  disabled = false,
  title = 'Bộ lọc tìm kiếm nâng cao',
  className = '',
}) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const setOpen = (val) => {
    if (!isControlled) setInternalOpen(val);
    onOpenChange?.(val);
  };

  const handleApply = () => {
    onApply?.();
  };

  const handleReset = () => {
    onReset?.();
  };

  return (
    <Collapse in={open} timeout={250} unmountOnExit className={className}>
      <div className="mb-4 mt-4 bg-background backdrop-blur-sm shadow-sm">
        {/* Header */}
        {title && (
          <div className="flex items-center gap-2 mb-6 pb-3 border-b border-border">
            <TuneIcon className="text-muted-foreground" sx={{ fontSize: 16 }} />
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              {title}
            </span>
          </div>
        )}

        {/* Filter fields */}
        <div className="flex flex-col gap-4">
          {children}
        </div>

        {/* Action buttons */}
        <div className="mt-4 pt-2 border-t border-border flex flex-col sm:flex-row justify-end gap-2">
          {/* Tìm kiếm */}
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={handleApply}
            disabled={disabled}
            startIcon={<SearchIcon fontSize="small" />}
            className="w-full sm:w-auto normal-case"
            sx={{ boxShadow: 'none' }}
          >
            Tìm kiếm
          </Button>

          {/* Đặt lại */}
          <Button
            variant="outlined"
            color="inherit"
            size="small"
            onClick={handleReset}
            disabled={disabled}
            startIcon={<RotateLeftIcon fontSize="small" />}
            className="w-full sm:w-auto normal-case border-border text-foreground hover:bg-muted"
          >
            Đặt lại
          </Button>

          {/* Đóng bộ lọc */}
          <Button
            variant="text"
            color="inherit"
            size="small"
            onClick={() => setOpen(false)}
            startIcon={<CloseIcon fontSize="small" />}
            className="w-full sm:w-auto normal-case text-muted-foreground hover:text-foreground hover:bg-muted/50"
          >
            Đóng bộ lọc
          </Button>
        </div>
      </div>
    </Collapse>
  );
}

export default memo(FilterPanel);
