import React, { memo, useCallback, useState, useEffect } from "react";
import DialogContent from "@mui/material/DialogContent";
import MenuItem from "@mui/material/MenuItem";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Popup from "./Popup";
import PropTypes from "prop-types";

/**
 * High-performance Pagination Option Popup.
 * Features: Silent Render (memo), Optimized event handlers.
 */
function PaginationOptionPopup({
  open,
  handleClose,
  setRowsPerPage,
  pageSizeOption,
  totalPages,
  handleChangePage,
  page,
  pageSize: propPageSize,
}) {
  const [pageIndex, setPageIndex] = useState(page);
  const [pageSize, setPageSize] = useState(propPageSize);

  useEffect(() => {
    setPageIndex(page);
  }, [page]);

  useEffect(() => {
    setPageSize(propPageSize);
  }, [propPageSize]);

  const handleGo = useCallback((event) => {
    const num = Number(pageIndex);
    if (isNaN(num) || num < 1 || num > totalPages) {
      alert(`Vui lòng nhập số trang từ 1 đến ${totalPages}`);
      return;
    }
    handleChangePage(event, num);
    handleClose();
  }, [pageIndex, totalPages, handleChangePage, handleClose]);

  const handlePageSizeChange = useCallback((event) => {
    setPageSize(event.target.value);
    setRowsPerPage(event);
    handleClose();
  }, [setRowsPerPage, handleClose]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Enter") {
      handleGo(e);
    }
  }, [handleGo]);

  return (
    <Popup
      scroll="body"
      size="xs"
      open={open}
      noDialogContent
      title="Thiết lập hiển thị"
      onClosePopup={handleClose}
    >
      <DialogContent sx={{ overflow: "hidden", p: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <div>
              <p style={{ margin: "8px 0 8px 0", fontSize: "14px", fontWeight: 500 }}>
                Số dòng mỗi trang
              </p>
              <TextField 
                select 
                value={pageSize} 
                onChange={handlePageSizeChange} 
                fullWidth
                size="small"
              >
                {pageSizeOption.map((option, index) => (
                  <MenuItem key={index} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </div>
          </Grid>
          <Grid item xs={12}>
            <div>
              <p style={{ margin: "0 0 8px 0", fontSize: "14px", fontWeight: 500 }}>
                Đi đến trang
              </p>
              <TextField
                type="number"
                fullWidth
                size="small"
                name="pageIndex"
                value={pageIndex}
                onChange={(e) => setPageIndex(e.target.value)}
                onKeyDown={handleKeyDown}
                InputProps={{
                    inputProps: { min: 1, max: totalPages }
                }}
              />
            </div>
          </Grid>
        </Grid>
      </DialogContent>
    </Popup>
  );
}

PaginationOptionPopup.propTypes = {
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  setRowsPerPage: PropTypes.func.isRequired,
  pageSizeOption: PropTypes.arrayOf(PropTypes.number).isRequired,
  totalPages: PropTypes.number.isRequired,
  handleChangePage: PropTypes.func.isRequired,
  page: PropTypes.number.isRequired,
  pageSize: PropTypes.number.isRequired,
};

export default memo(PaginationOptionPopup);
