import React, { useEffect, useState } from 'react';
import { IconButton, Paper, Tooltip, Box, Chip, Grid } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useFormik, FormikProvider } from 'formik';
import { useTranslation } from 'react-i18next';

import Table from '@/components/ui/Table';
import ConfirmationDialog from '@/components/ui/ConfirmationDialog';
import ListToolbar from '@/components/ui/ListToolbar';
import FilterPanel from '@/components/ui/FilterPanel';
import SelectInput from '@/components/ui/SelectInput';
import AdministrativeUnitForm from './components/AdministrativeUnitForm';
import useAdministrativeUnitStore from '@/store/administrativeUnitStore';
import { useAdministrativeUnits, useDeleteAdministrativeUnit } from './api';
import { FILTER_LEVEL_OPTIONS } from '@/constants';

const AdministrativeUnitPage = () => {
  const { t } = useTranslation();
  const {
    page,
    pageSize,
    keyword,
    setPage,
    setPageSize,
    setKeyword,
    setOpenForm,
    selectedUnit,
    setSelectedUnit,
    resetStore,
  } = useAdministrativeUnitStore();

  const [searchDraft, setSearchDraft] = useState(keyword || '');
  const [openConfirm, setOpenConfirm] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({ level: '' });

  const filterFormik = useFormik({
    initialValues: { level: '' },
    onSubmit: (values) => {
      setKeyword(searchDraft);
      setAppliedFilters(values);
      setPage(1);
    },
  });

  const activeFilterCount = appliedFilters.level ? 1 : 0;

  const { data: unitData, isFetching } = useAdministrativeUnits({
    pageIndex: page,
    pageSize,
    keyword,
    level: appliedFilters.level ? Number(appliedFilters.level) : null,
  });

  const deleteUnitMutation = useDeleteAdministrativeUnit();

  useEffect(() => {
    setSearchDraft(keyword || '');
  }, [keyword]);

  useEffect(() => {
    return () => {
      resetStore();
    };
  }, []);

  const handleSearch = () => {
    setKeyword(searchDraft);
    filterFormik.handleSubmit();
  };

  const handleReset = () => {
    setSearchDraft('');
    setKeyword('');
    filterFormik.resetForm();
    setAppliedFilters({ level: '' });
    setPage(1);
  };

  const handleOpenAdd = () => {
    setSelectedUnit(null);
    setOpenForm(true);
  };

  const handleOpenEdit = (item) => {
    setSelectedUnit(item);
    setOpenForm(true);
  };

  const handleOpenDelete = (item) => {
    setSelectedUnit(item);
    setOpenConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedUnit && selectedUnit.id) {
      await deleteUnitMutation.mutateAsync(selectedUnit.id);
      setOpenConfirm(false);
    }
  };

  const columns = [
    {
      title: t('common.actions', 'Thao tác'),
      field: 'actions',
      width: '120px',
      align: 'center',
      render: (row) => (
        <Box className="flex items-center justify-center gap-1">
          <Tooltip title={t('common.edit', 'Chỉnh sửa')}>
            <IconButton size="small" color="primary" onClick={() => handleOpenEdit(row)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('common.delete', 'Xóa')}>
            <IconButton size="small" color="error" onClick={() => handleOpenDelete(row)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
    {
      title: t('administrativeUnit.code', 'Mã DVHC'),
      field: 'code',
      align: 'center',
      width: '110px',
      render: (row) => <span className="font-semibold text-primary">{row.code}</span>,
    },
    {
      title: t('administrativeUnit.name', 'Tên Đơn vị hành chính'),
      field: 'name',
      render: (row) => <span className="font-medium">{row.name}</span>,
    },
    {
      title: t('administrativeUnit.divisionType', 'Phân loại'),
      field: 'divisionType',
      align: 'center',
      width: '140px',
      render: (row) =>
        row.divisionType ? <Chip label={row.divisionType} size="small" variant="outlined" color="primary" /> : '---',
    },
    {
      title: t('administrativeUnit.level', 'Cấp độ'),
      field: 'level',
      width: '140px',
      align: 'center',
      render: (row) =>
        row.level === 1 ? (
          <Chip label={t('administrativeUnit.level1', 'Cấp 1 (Tỉnh/Thành phố)')} size="small" color="success" />
        ) : (
          <Chip label={t('administrativeUnit.level2', 'Cấp 2 (Xã/Phường)')} size="small" color="info" />
        ),
    },
    {
      title: t('administrativeUnit.parentName', 'Đơn vị cha'),
      field: 'parentName',
      align: 'center',
      width: '180px',
      render: (row) => row.parentName || row.parentCode || '---',
    },
  ];

  const levelOptions = FILTER_LEVEL_OPTIONS.map((opt) => ({
    value: String(opt.value),
    label: t(opt.labelKey, opt.defaultLabel),
  }));

  return (
    <Box className="space-y-4">
      <Paper elevation={0} className="py-4 px-2 md:px-4 border border-border">
        <FormikProvider value={filterFormik}>
          <ListToolbar
            searchDraft={searchDraft}
            onSearchDraftChange={setSearchDraft}
            onSearch={handleSearch}
            onReset={handleReset}
            onAdd={handleOpenAdd}
            addLabel={t('administrativeUnit.add', 'Thêm đơn vị hành chính')}
            searchPlaceholder={t('administrativeUnit.search_placeholder', 'Tìm theo mã hoặc tên đơn vị hành chính...')}
            filter={{
              open: filterOpen,
              onToggle: setFilterOpen,
              activeCount: activeFilterCount,
            }}
          />

          <FilterPanel
            open={filterOpen}
            onOpenChange={setFilterOpen}
            onApply={filterFormik.handleSubmit}
            onReset={handleReset}
          >
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <SelectInput
                  label={t('administrativeUnit.filter_level', 'Lọc theo cấp độ')}
                  name="level"
                  options={levelOptions}
                  keyValue="value"
                  displayvalue="label"
                />
              </Grid>
            </Grid>
          </FilterPanel>
        </FormikProvider>

        <Table
          columns={columns}
          data={unitData?.content || []}
          loading={isFetching}
          page={page}
          pageSize={pageSize}
          totalElements={unitData?.totalElements || 0}
          handleChangePage={(e, newPage) => setPage(newPage)}
          setRowsPerPage={(e) => setPageSize(parseInt(e.target.value, 10))}
        />
      </Paper>

      <AdministrativeUnitForm />

      <ConfirmationDialog
        open={openConfirm}
        onConfirmDialogClose={() => setOpenConfirm(false)}
        onYesClick={handleConfirmDelete}
        title={t('administrativeUnit.delete_confirm_title', 'Xác nhận xóa Đơn vị hành chính')}
        text={t('administrativeUnit.delete_confirm_text', { name: selectedUnit?.name, code: selectedUnit?.code }, `Bạn có chắc chắn muốn xóa đơn vị "${selectedUnit?.name}" (${selectedUnit?.code}) này không?`)}
        agree={t('common.confirm', 'Xác nhận')}
        cancel={t('common.cancel', 'Hủy bỏ')}
      />
    </Box>
  );
};

export default AdministrativeUnitPage;
