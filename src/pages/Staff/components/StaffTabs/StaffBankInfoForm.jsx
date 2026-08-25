import React, { useState } from 'react';
import { Box, Button, Typography, Chip, Paper, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import Table from '../../../../components/ui/Table';
import ConfirmationDialog from '../../../../components/ui/ConfirmationDialog';
import StaffBankAccountFormDialog from './StaffBankAccountFormDialog';
import { 
    useStaffBankAccounts, 
    useSaveStaffBankAccount, 
    useSetDefaultStaffBankAccount, 
    useDeleteStaffBankAccount 
} from '../../api';

const StaffBankInfoForm = ({ staffData, isView = false }) => {
    const staffId = staffData?.id;
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [deleteId, setDeleteId] = useState(null);

    // TanStack Query
    const { data: bankAccounts = [], isLoading } = useStaffBankAccounts(staffId);
    const saveMutation = useSaveStaffBankAccount();
    const setDefaultMutation = useSetDefaultStaffBankAccount();
    const deleteMutation = useDeleteStaffBankAccount();

    const handleAdd = () => {
        setSelectedAccount(null);
        setOpenDialog(true);
    };

    const handleEdit = (account) => {
        setSelectedAccount(account);
        setOpenDialog(true);
    };

    const handleSetDefault = (account) => {
        setDefaultMutation.mutate(account.id);
    };

    const handleDelete = () => {
        if (!deleteId) return;
        deleteMutation.mutate(deleteId, {
            onSuccess: () => setDeleteId(null),
        });
    };

    const handleSave = (dto) => {
        saveMutation.mutate({ ...dto, staffId }, {
            onSuccess: () => setOpenDialog(false),
        });
    };

    const columns = [
        {
            field: 'bankName',
            title: 'Ngân hàng',
            minWidth: 250,
            render: (row) => (
                <Box display="flex" alignItems="center" gap={1}>
                    {row.bankLogo && (
                        <img src={row.bankLogo} alt={row.bankShortName} style={{ width: 24, height: 24, objectFit: 'contain' }} />
                    )}
                    <Box>
                        <Typography variant="body2" fontWeight={600}>
                            {row.bankShortName || row.bankName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {row.bankName}
                        </Typography>
                    </Box>
                </Box>
            )
        },
        {
            field: 'accountNumber',
            title: 'Số tài khoản',
            minWidth: 160,
            align: 'center',
        },
        {
            field: 'accountName',
            title: 'Chủ tài khoản',
            minWidth: 180,
            align: 'center',
            render: (row) => row.accountName?.toUpperCase() || '—'
        },
        {
            field: 'branchName',
            title: 'Chi nhánh',
            minWidth: 160,
            render: (row) => row.branchName || '—'
        },
        {
            field: 'isDefault',
            title: 'Trạng thái',
            minWidth: 130,
            align: 'center',
            render: (row) => row.isDefault ? (
                <Chip label="Mặc định" color="success" size="small" variant="filled" />
            ) : (
                <Chip label="Phụ" color="default" size="small" variant="outlined" />
            )
        },
        {
            field: 'actions',
            title: 'Thao tác',
            minWidth: 140,
            align: 'center',
            render: (row) => !isView && (
                <Box display="flex" alignItems="center" justifyContent="center">
                    {!row.isDefault && (
                        <IconButton size="small" color="warning" onClick={() => handleSetDefault(row)} title="Đặt làm mặc định">
                            <StarBorderIcon fontSize="small" />
                        </IconButton>
                    )}
                    {row.isDefault && (
                        <IconButton size="small" color="warning" disabled title="Tài khoản mặc định">
                            <StarIcon fontSize="small" />
                        </IconButton>
                    )}
                    <IconButton size="small" color="primary" onClick={() => handleEdit(row)}>
                        <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => setDeleteId(row.id)}>
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </Box>
            )
        }
    ];

    return (
        <Paper elevation={0} className='p-4 border border-border rounded-lg shadow-sm mb-4'>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight="bold">
                    Danh sách tài khoản ngân hàng
                </Typography>
                {!isView && (
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        size="small"
                        onClick={handleAdd}
                        sx={{ textTransform: 'none' }}
                    >
                        Thêm tài khoản
                    </Button>
                )}
            </Box>

            <Table
                columns={columns}
                data={bankAccounts}
                loading={isLoading}
                emptyText="Chưa có tài khoản ngân hàng nào"
                nonePagination={true}
            />

            {openDialog && (
                <StaffBankAccountFormDialog
                    open={openDialog}
                    onClose={() => setOpenDialog(false)}
                    bankAccountData={selectedAccount}
                    staffDisplayName={staffData?.displayName}
                    onSave={handleSave}
                />
            )}

            {!!deleteId && (
                <ConfirmationDialog
                    open={!!deleteId}
                    onClose={() => setDeleteId(null)}
                    onConfirm={handleDelete}
                    title="Xác nhận xóa"
                    message="Bạn có chắc chắn muốn xóa tài khoản ngân hàng này không?"
                />
            )}
        </Paper>
    );
};

export default StaffBankInfoForm;
