import React, { useMemo, useState, useEffect, useCallback, memo } from "react";
import MaterialTable from "@material-table/core";
import { useTheme, styled } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Skeleton from "@mui/material/Skeleton";
import CircularProgress from "@mui/material/CircularProgress";
import ChevronRight from "@mui/icons-material/ChevronRight";
import ExpandMore from "@mui/icons-material/ExpandMore";
import ExpandLess from "@mui/icons-material/ExpandLess";
import Pagination from "./Pagination";
import { calculateTotalPages } from "../../LocalFunction";
import PropTypes from "prop-types";

const TableWrapper = styled(Box)(({ theme }) => ({
  width: "100%",
  "& td, & th": {
    border: "1px solid hsl(var(--border))",
    padding: "4px 8px",
    fontSize: "13px",
  },
  "& tbody td": {
    color: "hsl(var(--foreground) / 0.8) !important",
  },
  "& thead th": {
    fontWeight: "600",
    color: "hsl(var(--foreground)) !important",
    backgroundColor: "hsl(var(--muted)) !important",
    textAlign: "center",
  },
  "& .MuiPaper-root": {
    boxShadow: "none",
    border: "none",
  },
  // Align headers and body by keeping native collapse separate structure
  "& .MuiTable-root": {
    borderCollapse: "separate !important",
    borderSpacing: "0 !important",
  },
}));

const MobileCard = memo(({
  row,
  rowIndex,
  showIndex,
  titleValue,
  hasDetailPanel,
  isExpanded,
  onToggleExpand,
  onRowClick,
  mobileColumns,
  titleColumn,
  mobileTitleField,
  renderCellValue,
  detailPanel,
}) => {
  return (
    <Box sx={{ 
      border: (theme) => theme.palette.mode === "dark" ? "1px solid hsl(var(--border))" : "1px solid #e0e0e0", 
      borderRadius: "8px", 
      p: 2, 
      mb: 2, 
      bgcolor: (theme) => theme.palette.mode === "dark" ? "hsl(var(--card))" : "white", 
      boxShadow: (theme) => theme.palette.mode === "dark" ? "none" : "0 2px 4px rgba(0,0,0,0.05)",
      cursor: onRowClick ? "pointer" : "default"
    }}>
      <Box sx={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        mb: 1.5, 
        pb: 1, 
        borderBottom: (theme) => theme.palette.mode === "dark" ? "1px solid hsl(var(--border))" : "1px solid #f0f0f0" 
      }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {showIndex && (
            <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 700 }}>
              #{rowIndex + 1}
            </Typography>
          )}
          {titleValue && (!showIndex || String(titleValue).trim() !== String(rowIndex + 1)) && (
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: (theme) => theme.palette.mode === "dark" ? "hsl(var(--foreground))" : "#333" }}>
              {titleValue}
            </Typography>
          )}
        </Box>
        {hasDetailPanel && (
          <IconButton 
            size="small" 
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand(rowIndex);
            }}
          >
            {isExpanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        )}
      </Box>

      <Box onClick={() => onRowClick && onRowClick(row)} sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {mobileColumns
          .filter(col => {
            if (col.field === "tableData.id") return false;
            if (mobileTitleField && col.field === mobileTitleField) return false;
            if (!mobileTitleField && col === titleColumn) return false;
            return true;
          })
          .map((column, colIndex) => (
            <Box key={colIndex} sx={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                {column.title}:
              </Typography>
              <Typography variant="body2" sx={{ textAlign: "right", ml: 2, color: (theme) => theme.palette.mode === "dark" ? "hsl(var(--foreground))" : "inherit" }}>
                {renderCellValue(column, row)}
              </Typography>
            </Box>
          ))
        }
      </Box>

      {hasDetailPanel && isExpanded && (
        <Box sx={{ 
          mt: 2, 
          p: 1.5, 
          bgcolor: (theme) => theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.05)" : "#f9f9f9", 
          borderRadius: "6px", 
          border: (theme) => theme.palette.mode === "dark" ? "1px solid hsl(var(--border))" : "1px solid #e0e0e0" 
        }}>
          {typeof detailPanel === 'function' ? detailPanel(row) : detailPanel[0]?.render?.(row)}
        </Box>
      )}
    </Box>
  );
});

/**
 * Standardized High-performance Table component.
 * Uses @material-table/core for MUI v5 compatibility.
 */
function Table(props) {
  const theme = useTheme();
  const isMobileSize = useMediaQuery(theme.breakpoints.down("md"));
  const [expandedRows, setExpandedRows] = useState(new Set());

  const {
    data = [],
    columns,
    loading = false,
    totalPages: propTotalPages,
    handleChangePage,
    setRowsPerPage,
    pageSize,
    pageSizeOption,
    totalElements,
    page,
    selection,
    handleSelectList = () => {},
    maxWidth,
    nonePagination,
    maxHeight,
    colParent = false,
    defaultExpanded = false,
    showIndex = true,
    onRowClick,
    detailPanel,
    icons,
    mobileBreakpoint = 768,
    mobileTitleField,
    mobileVisibleFields,
    options: customOptions = {},
  } = props;

  const totalPages = useMemo(() => {
    return propTotalPages || calculateTotalPages(totalElements, pageSize);
  }, [propTotalPages, totalElements, pageSize]);

  const displayColumns = useMemo(() => {
    const actionCols = [];
    const regularCols = [];

    (columns || [])
      .filter(col => col && typeof col === 'object')
      .forEach(col => {
        const titleStr = typeof col.title === 'string' ? col.title : (col.title ? col.title.toString() : '');
        const isAction = titleStr.toLowerCase().includes('thao tác') || titleStr.toLowerCase().includes('action');
        
        if (isAction) {
          // Dynamic styles to make the action column sticky on the right using pure CSS
          const stickyCellStyle = (value, rowData) => {
            const originalStyle = typeof col.cellStyle === 'function' 
              ? col.cellStyle(value, rowData) 
              : col.cellStyle;
            return {
              position: "sticky",
              right: 0,
              backgroundColor: theme.palette.background.paper,
              zIndex: 2,
              borderLeft: "1px solid hsl(var(--border))",
              borderRight: "1px solid hsl(var(--border))",
              ...originalStyle,
            };
          };

          const stickyHeaderStyle = {
            position: "sticky",
            right: 0,
            backgroundColor: "hsl(var(--muted))",
            zIndex: 3,
            borderLeft: "1px solid hsl(var(--border))",
            borderRight: "1px solid hsl(var(--border))",
            ...col.headerStyle,
          };

          actionCols.push({
            ...col,
            width: col.width || '120px',
            cellStyle: stickyCellStyle,
            headerStyle: stickyHeaderStyle,
          });
        } else {
          regularCols.push(col);
        }
      });

    const processedColumns = [...regularCols, ...actionCols];

    if (!showIndex) return processedColumns;

    const indexColumn = {
      title: "STT",
      align: "center",
      width: "50px",
      render: (rowData) => {
        const idx = data.findIndex(item => {
          if (!item || !rowData) return false;
          if (item === rowData) return true;
          return Object.keys(item).every(key => {
            if (key === 'tableData') return true;
            return item[key] === rowData[key];
          });
        });
        return (page - 1) * pageSize + (idx !== -1 ? idx : 0) + 1;
      },
    };

    return [indexColumn, ...processedColumns];
  }, [columns, showIndex, page, pageSize, data, theme]);

  const defaultIcons = useMemo(() => {
    return {
      DetailPanel: ChevronRight,
      ...icons
    };
  }, [icons]);

  const handleToggleExpand = useCallback((rowIndex) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(rowIndex)) newSet.delete(rowIndex);
      else newSet.add(rowIndex);
      return newSet;
    });
  }, []);

  const renderCellValue = useCallback((column, rowData) => {
    if (column.render) return column.render(rowData);
    if (column.field) {
      const value = column.field.split('.').reduce((obj, key) => obj?.[key], rowData);
      return value !== undefined && value !== null ? value : '-';
    }
    return '-';
  }, []);

  const renderDesktopSkeleton = () => {
    const skeletonRowCount = pageSize || 5;
    return (
      <TableWrapper>
        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
          <thead>
            <tr>
              {displayColumns.map((col, idx) => (
                <th
                  key={idx}
                  style={{
                    padding: "8px",
                    backgroundColor: "hsl(var(--muted))",
                    border: "1px solid hsl(var(--border))",
                    width: col.width || "auto",
                  }}
                >
                  <Skeleton animation="wave" height={20} width="60%" style={{ margin: "0 auto" }} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: skeletonRowCount }).map((_, rowIdx) => (
              <tr key={rowIdx}>
                {displayColumns.map((col, colIdx) => (
                  <td key={colIdx} style={{ padding: "8px", border: "1px solid hsl(var(--border))" }}>
                    <Skeleton
                      animation="wave"
                      height={20}
                      width={colIdx === 0 ? "40%" : "75%"}
                      style={{ margin: colIdx === 0 ? "0 auto" : "0" }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </TableWrapper>
    );
  };

  const renderMobileSkeleton = () => {
    const skeletonCount = pageSize ? Math.min(pageSize, 5) : 4;
    return (
      <Box sx={{ width: "100%" }}>
        {Array.from({ length: skeletonCount }).map((_, idx) => (
          <Box
            key={idx}
            sx={{
              border: (theme) => theme.palette.mode === "dark" ? "1px solid hsl(var(--border))" : "1px solid #e0e0e0",
              borderRadius: "8px",
              p: 2,
              mb: 2,
              bgcolor: (theme) => theme.palette.mode === "dark" ? "hsl(var(--card))" : "white",
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
              <Skeleton animation="wave" width="35%" height={24} />
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
              <Skeleton animation="wave" width="35%" height={24} />
              <Skeleton animation="wave" width="35%" height={24} />
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
              <Skeleton animation="wave" width="35%" height={24} />
              <Skeleton animation="wave" width="35%" height={24} />
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
              <Skeleton animation="wave" width="35%" height={24} />
              <Skeleton animation="wave" width="35%" height={24} />
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Skeleton animation="wave" width="35%" height={24} />
              <Skeleton animation="wave" width="35%" height={24} />
            </Box>
          </Box>
        ))}
      </Box>
    );
  };

  const renderMobileView = () => {
    if (!data || data.length === 0) {
      return (
        <Box sx={{ p: 5, textAlign: "center", color: "text.secondary" }}>
          Không có dữ liệu
        </Box>
      );
    }

    const mColumns = mobileVisibleFields 
      ? displayColumns.filter(col => mobileVisibleFields.includes(col.field) || col.field === "tableData.id")
      : displayColumns;

    const titleColumn = mobileTitleField 
      ? mColumns.find(col => col.field === mobileTitleField)
      : mColumns.find(col => col.field !== "tableData.id");

    return (
      <Box>
        {data.map((row, index) => {
          const rowIndex = (page - 1) * pageSize + index;
          const titleValue = titleColumn ? renderCellValue(titleColumn, row) : '';
          return (
            <MobileCard
              key={row.id || rowIndex}
              row={row}
              rowIndex={rowIndex}
              showIndex={showIndex}
              titleValue={titleValue}
              hasDetailPanel={!!detailPanel}
              isExpanded={expandedRows.has(rowIndex)}
              onToggleExpand={handleToggleExpand}
              onRowClick={onRowClick}
              mobileColumns={mColumns}
              titleColumn={titleColumn}
              mobileTitleField={mobileTitleField}
              renderCellValue={renderCellValue}
              detailPanel={detailPanel}
            />
          );
        })}
      </Box>
    );
  };

  const renderDesktopView = () => (
    <TableWrapper>
      <MaterialTable
        data={data}
        columns={displayColumns}
        detailPanel={detailPanel}
        icons={defaultIcons}
        parentChildData={
          colParent
            ? (row, rows) => rows.find((a) => a?.id === row?.parentId) || null
            : undefined
        }
        options={{
          selection: !!selection,
          maxColumnSort: false,
          actionsColumnIndex: -1,
          paging: false,
          search: false,
          toolbar: false,
          draggable: false,
          maxBodyHeight: maxHeight || "unset",
          cellStyle: {
            fontSize: "14px",
            color: "hsl(var(--foreground) / 0.75)",
            whiteSpace: "nowrap",
          },
          headerStyle: {
            padding: "8px",
            textAlign: "center",
            fontSize: "14px",
            whiteSpace: "nowrap",
            fontWeight: "bold",
          },
          defaultExpanded,
          detailPanelType: detailPanel ? "single" : undefined,
          ...customOptions,
        }}
        onSelectionChange={handleSelectList}
        onRowClick={onRowClick ? (event, rowData) => onRowClick(rowData) : undefined}
        localization={{
          body: {
            emptyDataSourceMessage: "Không có dữ liệu",
          },
        }}
      />
    </TableWrapper>
  );

  const renderSpinnerLoading = () => (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 240,
        py: 6,
        border: (theme) => theme.palette.mode === "dark" ? "1px solid hsl(var(--border))" : "1px solid #e0e0e0",
        borderRadius: "8px",
        bgcolor: (theme) => theme.palette.mode === "dark" ? "hsl(var(--card))" : "white",
      }}
    >
      <CircularProgress size={36} color="primary" />
    </Box>
  );

  const isDataEmpty = !data || data.length === 0;

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ position: "relative", width: "100%", minHeight: 180 }}>
        {/* Desktop Spinner Overlay: Only on Desktop view when loading */}
        {loading && !isMobileSize && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: (theme) =>
                theme.palette.mode === "dark"
                  ? "rgba(0, 0, 0, 0.3)"
                  : "rgba(255, 255, 255, 0.5)",
              backdropFilter: "blur(1px)",
              zIndex: 10,
              borderRadius: "4px",
            }}
          >
            <CircularProgress size={36} color="primary" />
          </Box>
        )}

        <Box
          sx={{
            opacity: loading && !isMobileSize ? 0.8 : 1,
            transition: "opacity 0.15s ease-in-out",
            pointerEvents: loading && !isMobileSize ? "none" : "auto",
          }}
        >
          {loading && isMobileSize ? (
            renderMobileSkeleton()
          ) : (
            isMobileSize ? renderMobileView() : renderDesktopView()
          )}
        </Box>
      </Box>

      {!nonePagination && (
        <Pagination
          totalPages={totalPages}
          handleChangePage={handleChangePage}
          setRowsPerPage={setRowsPerPage}
          pageSize={pageSize}
          pageSizeOption={pageSizeOption}
          totalElements={totalElements}
          page={page}
        />
      )}
    </Box>
  );
}

Table.propTypes = {
    data: PropTypes.array,
    columns: PropTypes.array.isRequired,
    loading: PropTypes.bool,
    selection: PropTypes.bool,
    handleSelectList: PropTypes.func,
    maxWidth: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    maxHeight: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    nonePagination: PropTypes.bool,
    defaultExpanded: PropTypes.bool,
    showIndex: PropTypes.bool,
    onRowClick: PropTypes.func,
    detailPanel: PropTypes.oneOfType([PropTypes.func, PropTypes.array]),
    icons: PropTypes.object,
    mobileBreakpoint: PropTypes.number,
    totalElements: PropTypes.number.isRequired,
    totalPages: PropTypes.number,
    page: PropTypes.number.isRequired,
    pageSize: PropTypes.number.isRequired,
    handleChangePage: PropTypes.func.isRequired,
    setRowsPerPage: PropTypes.func.isRequired,
};

export default memo(Table);
