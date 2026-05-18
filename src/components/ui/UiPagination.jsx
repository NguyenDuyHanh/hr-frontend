import React, { useEffect, useState, useCallback, memo, useMemo } from "react";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Pagination from "@mui/material/Pagination";
import AddIcon from "@mui/icons-material/Add";
import { useTranslation } from "react-i18next";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import UiPaginationOptionPopup from "./UiPaginationOptionPopup";
import PropTypes from "prop-types";
import { Box, Typography } from "@mui/material";

/**
 * High-performance Pagination component.
 * Standardized for MUI v5.
 */
function UiPagination(props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const {
    handleChangePage,
    totalPages,
    setRowsPerPage,
    pageSizeOption = [5, 10, 25, 50],
    totalElements,
    page,
    pageSize: propPageSize,
  } = props;

  const [pageSize, setPageSize] = useState(propPageSize);
  const [openPopup, setOpenPopup] = useState(false);

  useEffect(() => {
    setPageSize(propPageSize);
  }, [propPageSize]);

  const handlePageSizeChange = useCallback((event) => {
    setPageSize(event.target.value);
    setRowsPerPage(event);
  }, [setRowsPerPage]);

  const handleOpenPopup = useCallback(() => setOpenPopup(true), []);
  const handleClosePopup = useCallback(() => setOpenPopup(false), []);

  const totalElementsText = useMemo(() => (
    <Typography variant="body2" sx={{ display: "flex", alignItems: "center" }}>
      {"Tổng số bản ghi: "}
      <Box component="span" sx={{ 
        ml: 1.5, 
        mr: 1.5, 
        pr: 1.5, 
        borderRight: isMobile ? "none" : "1px solid rgba(0, 0, 0, 0.15)",
        fontWeight: 600 
      }}>
        {totalElements}
      </Box>
    </Typography>
  ), [t, totalElements, isMobile]);

  return (
    <Box sx={{ 
      display: "flex", 
      justifyContent: "flex-end", 
      alignItems: "center", 
      p: 2,
      width: "100%",
      flexWrap: "wrap",
      gap: 2
    }}>
      {!isMobile ? (
        <>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {totalElementsText}
            
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="body2">Số bản ghi / trang: </Typography>
              <TextField
                select
                value={pageSize}
                onChange={handlePageSizeChange}
                variant="standard"
                size="small"
                sx={{ 
                    "& .MuiInput-root:before": { borderBottom: "none" },
                    "& .MuiInput-root:after": { borderBottom: "none" },
                    "& .MuiInput-root:hover:not(.Mui-disabled):before": { borderBottom: "none" },
                    width: "50px",
                    textAlign: "center"
                }}
                InputProps={{
                    sx: { fontSize: "14px" }
                }}
              >
                {pageSizeOption.map((option, index) => (
                  <MenuItem key={index} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
          </Box>

          <Pagination
            count={totalPages}
            shape="rounded"
            page={page}
            color="primary"
            onChange={handleChangePage}
            boundaryCount={1}
            siblingCount={1}
            showFirstButton
            showLastButton
            size="small"
            sx={{
                "& .MuiPaginationItem-root": {
                    bgcolor: "white",
                    "&.Mui-selected": {
                        bgcolor: "primary.main",
                        color: "white",
                        "&:hover": {
                            bgcolor: "primary.dark",
                        }
                    }
                }
            }}
          />
        </>
      ) : (
        <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            {totalElementsText}
            <Button
              variant="contained"
              size="small"
              onClick={handleOpenPopup}
              sx={{ minWidth: "40px", p: 1 }}
            >
              <AddIcon fontSize="small" />
            </Button>
          </Box>

          <Pagination
            count={totalPages}
            shape="rounded"
            page={page}
            color="primary"
            onChange={handleChangePage}
            boundaryCount={0}
            siblingCount={0}
            showFirstButton
            showLastButton
            size="small"
            fullWidth
            sx={{ 
                "& ul": { justifyContent: "center" },
                "& .MuiPaginationItem-root": {
                    bgcolor: "white",
                }
            }}
          />

          <UiPaginationOptionPopup
            open={openPopup}
            handleClose={handleClosePopup}
            totalElements={totalElements}
            setRowsPerPage={setRowsPerPage}
            pageSizeOption={pageSizeOption}
            totalPages={totalPages}
            handleChangePage={handleChangePage}
            page={page}
            pageSize={pageSize}
          />
        </Box>
      )}
    </Box>
  );
}

UiPagination.propTypes = {
  totalElements: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  pageSizeOption: PropTypes.arrayOf(PropTypes.number),
  setRowsPerPage: PropTypes.func.isRequired,
  handleChangePage: PropTypes.func.isRequired,
  page: PropTypes.number.isRequired,
  pageSize: PropTypes.number.isRequired,
};

export default memo(UiPagination);
