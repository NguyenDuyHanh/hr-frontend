import React, { useEffect, useState } from 'react';
import { IconButton, Paper, Tooltip, Box } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTranslation } from 'react-i18next';

import Table from '@/components/ui/Table';
import ConfirmationDialog from '@/components/ui/ConfirmationDialog';
import ListToolbar from '@/components/ui/ListToolbar';
import EthnicForm from './components/EthnicForm';
import useEthnicStore from '@/store/ethnicStore';
import { useEthnics, useDeleteEthnic } from './api';

const EthnicPage = () => {
  const { t } = useTranslation();
  const {
    page,
    pageSize,
    keyword,
    setPage,
    setPageSize,
    setKeyword,
    setOpenForm,
    selectedEthnic,
    setSelectedEthnic,
    resetStore,
  } = useEthnicStore();

  const { data: ethnicData, isFetching } = useEthnics({ pageIndex: page, pageSize, keyword });
  const deleteEthnicMutation = useDeleteEthnic();

  const [searchDraft, setSearchDraft] = useState(keyword || '');
  const [openConfirm, setOpenConfirm] = useState(false);

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
  };

  const handleReset = () => {
    setSearchDraft('');
    setKeyword('');
  };

  const handleOpenAdd = () => {
    setSelectedEthnic(null);
    setOpenForm(true);
  };

  const handleOpenEdit = (item) => {
    setSelectedEthnic(item);
    setOpenForm(true);
  };

  const handleOpenDelete = (item) => {
    setSelectedEthnic(item);
    setOpenConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedEthnic && selectedEthnic.id) {
      await deleteEthnicMutation.mutateAsync(selectedEthnic.id);
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
      title: t('ethnic.code', 'Mã Dân tộc'),
      field: 'code',
      align: 'center',
      width: '150px',
      render: (row) => <span className="font-semibold text-primary">{row.code}</span>,
    },
    {
      title: t('ethnic.name', 'Tên Dân tộc'),
      field: 'name',
      align: 'center',
      width: '200px',
      render: (row) => <span className="font-medium">{row.name}</span>,
    },
    {
      title: t('ethnic.description', 'Mô tả'),
      field: 'description',
      render: (row) => row.description || '---',
    },
  ];

  return (
    <Box className="space-y-4">
      <Paper elevation={0} className="py-4 px-2 md:px-4 border border-border">
        <ListToolbar
          searchDraft={searchDraft}
          onSearchDraftChange={setSearchDraft}
          onSearch={handleSearch}
          onReset={handleReset}
          onAdd={handleOpenAdd}
          addLabel={t('ethnic.add', 'Thêm mới Dân tộc')}
          searchPlaceholder={t('ethnic.search_placeholder', 'Tìm theo mã hoặc tên dân tộc...')}
        />

        <Table
          columns={columns}
          data={ethnicData?.content || []}
          loading={isFetching}
          page={page}
          pageSize={pageSize}
          totalElements={ethnicData?.totalElements || 0}
          handleChangePage={(e, newPage) => setPage(newPage)}
          setRowsPerPage={(e) => setPageSize(parseInt(e.target.value, 10))}
        />
      </Paper>

      <EthnicForm />

      <ConfirmationDialog
        open={openConfirm}
        onConfirmDialogClose={() => setOpenConfirm(false)}
        onYesClick={handleConfirmDelete}
        title={t('ethnic.delete_confirm_title', 'Xác nhận xóa Dân tộc')}
        text={t('ethnic.delete_confirm_text', { name: selectedEthnic?.name, code: selectedEthnic?.code }, `Bạn có chắc chắn muốn xóa dân tộc "${selectedEthnic?.name}" (${selectedEthnic?.code}) này không?`)}
        agree={t('common.confirm', 'Xác nhận')}
        cancel={t('common.cancel', 'Hủy bỏ')}
      />
    </Box>
  );
};

export default EthnicPage;
