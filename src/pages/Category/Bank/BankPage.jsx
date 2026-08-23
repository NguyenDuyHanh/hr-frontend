import React, { useEffect, useState } from 'react';
import { IconButton, Paper, Tooltip, Box } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTranslation } from 'react-i18next';

import Table from '@/components/ui/Table';
import ConfirmationDialog from '@/components/ui/ConfirmationDialog';
import ListToolbar from '@/components/ui/ListToolbar';
import BankForm from './components/BankForm';
import useBankStore from '@/store/bankStore';
import { useBanks, useDeleteBank } from './api';

const BankPage = () => {
  const { t } = useTranslation();
  const {
    page,
    pageSize,
    keyword,
    setPage,
    setPageSize,
    setKeyword,
    setOpenForm,
    selectedBank,
    setSelectedBank,
    resetStore,
  } = useBankStore();

  const { data: bankData, isFetching } = useBanks({ pageIndex: page, pageSize, keyword });
  const deleteBankMutation = useDeleteBank();

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
    setSelectedBank(null);
    setOpenForm(true);
  };

  const handleOpenEdit = (item) => {
    setSelectedBank(item);
    setOpenForm(true);
  };

  const handleOpenDelete = (item) => {
    setSelectedBank(item);
    setOpenConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedBank && selectedBank.id) {
      await deleteBankMutation.mutateAsync(selectedBank.id);
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
      title: t('bank.code', 'Mã Bank'),
      field: 'code',
      align: 'center',
      width: '110px',
      render: (row) => <span className="font-semibold text-primary">{row.code}</span>,
    },
    {
      title: t('bank.shortName', 'Tên viết tắt'),
      field: 'shortName',
      align: 'center',
      width: '150px',
      render: (row) => <span className="font-bold">{row.shortName || row.code}</span>,
    },
    {
      title: t('bank.name', 'Tên đầy đủ'),
      field: 'name',
      render: (row) => <span className="text-sm">{row.name}</span>,
    },
    {
      title: t('bank.bin', 'Mã BIN (VietQR)'),
      field: 'bin',
      width: '130px',
      align: 'center',
      render: (row) => row.bin || '---',
    },
    {
      title: t('bank.swiftCode', 'SWIFT Code'),
      field: 'swiftCode',
      width: '120px',
      align: 'center',
      render: (row) => row.swiftCode || '---',
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
          addLabel={t('bank.add', 'Thêm mới Ngân hàng')}
          searchPlaceholder={t('bank.search_placeholder', 'Tìm theo mã, tên ngắn hoặc tên ngân hàng...')}
        />

        <Table
          columns={columns}
          data={bankData?.content || []}
          loading={isFetching}
          page={page}
          pageSize={pageSize}
          totalElements={bankData?.totalElements || 0}
          handleChangePage={(e, newPage) => setPage(newPage)}
          setRowsPerPage={(e) => setPageSize(parseInt(e.target.value, 10))}
        />
      </Paper>

      <BankForm />

      <ConfirmationDialog
        open={openConfirm}
        onConfirmDialogClose={() => setOpenConfirm(false)}
        onYesClick={handleConfirmDelete}
        title={t('bank.delete_confirm_title', 'Xác nhận xóa Ngân hàng')}
        text={t('bank.delete_confirm_text', { name: selectedBank?.shortName || selectedBank?.name, code: selectedBank?.code }, `Bạn có chắc chắn muốn xóa ngân hàng "${selectedBank?.shortName || selectedBank?.name}" (${selectedBank?.code}) này không?`)}
        agree={t('common.confirm', 'Xác nhận')}
        cancel={t('common.cancel', 'Hủy bỏ')}
      />
    </Box>
  );
};

export default BankPage;
