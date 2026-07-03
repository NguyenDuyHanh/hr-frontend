import React, { useMemo, useState, useEffect, useCallback, memo } from "react";
import MaterialTable from "@material-table/core";
import { useTheme, styled } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
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
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: (theme) => theme.palette.mode === "dark" ? "hsl(var(--foreground))" : "#333" }}>
            {titleValue}
          </Typography>
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
    data,
    columns,
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
    showIndex = false,
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
    const processedColumns = (columns || [])
      .filter(col => col && typeof col === 'object')
      .map(col => {
        if (col.title === 'Thao tác') {
          return {
            ...col,
            width: '1%',
          };
        }
        return col;
      });

    if (!showIndex) return processedColumns;

    const indexColumn = {
      title: "STT",
      field: "tableData.id",
      align: "center",
      width: "50px",
      render: (rowData) => {
        const idx = data.indexOf(rowData);
        const index = idx !== -1 ? idx : (typeof rowData.tableData?.id === 'number' ? rowData.tableData.id : 0);
        return (page - 1) * pageSize + index + 1;
      },
    };

    return [indexColumn, ...processedColumns];
  }, [columns, showIndex, page, pageSize]);

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

  return (
    <Box sx={{ width: "100%" }}>
      {isMobileSize ? renderMobileView() : renderDesktopView()}

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
    data: PropTypes.array.isRequired,
    columns: PropTypes.array.isRequired,
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
