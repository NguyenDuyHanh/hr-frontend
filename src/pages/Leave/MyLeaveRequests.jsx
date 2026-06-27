import React, { useEffect, useState, useMemo } from 'react';
import { Paper, Button, IconButton, Chip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import useLeaveStore from '../../store/useLeaveStore';
import useAuthStore from '../../store/useAuthStore';
import Table from '../../components/ui/Table';
import ListToolbar from '../../components/ui/ListToolbar';
import LeaveRequestForm from './components/LeaveRequestForm';
import ConfirmationDialog from '../../components/ui/ConfirmationDialog';
import { formatDate } from '../../LocalFunction';

const MyLeaveRequests = () => {
    const { t } = useTranslation();
    const { user } = useAuthStore();
    const {
        requests,
        loading,
        page,
        pageSize,
        totalElements,
        setPage,
        setPageSize,
        setFilters,
        loadRequests,
        removeLeaveRequest,
        setSelectedRequest,
        selectedRequest,
        openForm,
        setOpenForm,
        keyword,
        setKeyword,
        resetStore
    } = useLeaveStore();

    const [openConfirm, setOpenConfirm] = useState(false);
    const [searchDraft, setSearchDraft] = useState(keyword || '');

    // Reset store state on unmount
    useEffect(() => {
        return () => {
            resetStore();
        };
    }, [resetStore]);

    // Set staffId filter to display only current employee's requests
    useEffect(() => {
        if (user?.staffId) {
            setFilters({ staffId: user.staffId });
        }
    }, [user, setFilters]);

    // Load requests when page/filters change
    useEffect(() => {
        if (user?.staffId) {
            loadRequests();
        }
    }, [page, pageSize, keyword, loadRequests, user]);

    const handleAdd = () => {
        setSelectedRequest(null);
        setOpenForm(true);
    };

    const handleEdit = (row) => {
        setSelectedRequest(row);
        setOpenForm(true);
    };

    const handleDelete = (row) => {
        setSelectedRequest(row);
        setOpenConfirm(true);
    };

    const confirmDelete = async () => {
        if (selectedRequest?.id) {
            try {
                await removeLeaveRequest(selectedRequest.id);
                toast.success(t('leave.message.deleteSuccess', 'Hủy đơn nghỉ phép thành công'));
                setOpenConfirm(false);
                setSelectedRequest(null);
            } catch (error) {
                toast.error(error.response?.data?.message || t('leave.message.deleteError', 'Lỗi khi hủy đơn'));
            }
        }
    };

    const handleSearch = () => {
        setKeyword(searchDraft);
    };

    const handleReset = () => {
        setSearchDraft('');
        setKeyword('');
    };

    const getLeaveTypeName = (type) => {
        switch (type) {
            case 'ANNUAL': return t('leave.type.annual', 'Phép năm');
            case 'UNPAID': return t('leave.type.unpaid', 'Phép không lương');
            default: return type;
        }
    };

    const getStatusChip = (status) => {
        switch (status) {
            case 'PENDING':
                return <Chip label={t('leave.status.pending', 'Chờ duyệt')} color="warning" size="small" />;
            case 'APPROVED':
                return <Chip label={t('leave.status.approved', 'Đã duyệt')} color="success" size="small" />;
            case 'REJECTED':
                return <Chip label={t('leave.status.rejected', 'Từ chối')} color="error" size="small" />;
            default:
                return <Chip label={status} size="small" />;
        }
    };

    const columns = [
        {
            title: t('general.actions', 'Thao tác'),
            field: 'actions',
            width: 120,
            align: 'center',
            render: (rowData) => {
                const isPending = rowData.approvalStatus === 'PENDING';
                return (
                    <div className="flex items-center justify-center">
                        {isPending && (
                            <>
                                <IconButton size="small" sx={{ color: '#1976d2' }} onClick={() => handleEdit(rowData)} title={t('general.edit', 'Sửa')}>
                                    <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton size="small" sx={{ color: '#d32f2f' }} onClick={() => handleDelete(rowData)} title={t('general.delete', 'Hủy đơn')}>
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </>
                        )}
                    </div>
                );
            }
        },
        {
            title: t('leave.field.leaveType', 'Loại phép'),
            field: 'leaveType',
            width: 150,
            render: (rowData) => <span>{getLeaveTypeName(rowData.leaveType)}</span>
        },
        {
            title: t('leave.field.fromDate', 'Từ ngày'),
            field: 'fromDate',
            width: 130,
            align: 'center',
            render: (rowData) => <span>{formatDate(rowData.fromDate)}</span>
        },
        {
            title: t('leave.field.toDate', 'Đến ngày'),
            field: 'toDate',
            width: 130,
            align: 'center',
            render: (rowData) => <span>{formatDate(rowData.toDate)}</span>
        },
        {
            title: t('leave.field.totalDays', 'Số ngày nghỉ'),
            field: 'totalDays',
            width: 120,
            align: 'center',
            render: (rowData) => <span className="font-semibold">{rowData.totalDays}</span>
        },
        {
            title: t('leave.field.reason', 'Lý do nghỉ'),
            field: 'requestReason',
            width: 250,
            render: (rowData) => <span className="line-clamp-2">{rowData.requestReason || '---'}</span>
        },
        {
            title: t('leave.field.status', 'Trạng thái'),
            field: 'approvalStatus',
            width: 130,
            align: 'center',
            render: (rowData) => getStatusChip(rowData.approvalStatus)
        },
        {
            title: t('leave.field.rejectReason', 'Ý kiến phản hồi'),
            field: 'rejectReason',
            width: 200,
            render: (rowData) => <span className="text-red-500 line-clamp-2">{rowData.rejectReason || '---'}</span>
        }
    ];

    return (
        <>
            <Paper elevation={0} className="p-4 border border-border">
                <ListToolbar
                    searchDraft={searchDraft}
                    onSearchDraftChange={setSearchDraft}
                    onSearch={handleSearch}
                    onReset={handleReset}
                    onAdd={handleAdd}
                    addLabel={t('leave.action.create', 'Tạo yêu cầu nghỉ phép')}
                />

                <Table
                    columns={columns}
                    data={requests}
                    totalElements={totalElements}
                    page={page}
                    pageSize={pageSize}
                    handleChangePage={(e, p) => setPage(p)}
                    setRowsPerPage={(e) => setPageSize(parseInt(e.target.value, 10))}
                    loading={loading}
                />
            </Paper>

            {openForm && (
                <LeaveRequestForm
                    open={openForm}
                    onClose={() => setOpenForm(false)}
                    requestData={selectedRequest}
                />
            )}

            <ConfirmationDialog
                open={openConfirm}
                onConfirmDialogClose={() => setOpenConfirm(false)}
                onYesClick={confirmDelete}
                title={t('leave.title.cancelConfirm', 'Xác nhận hủy đơn nghỉ phép')}
                text={t('leave.message.cancelConfirmText', 'Bạn có chắc chắn muốn hủy đơn nghỉ phép này không? Thao tác này không thể hoàn tác.')}
                agree={t('general.confirm', 'Xác nhận')}
                cancel={t('general.cancel', 'Hủy bỏ')}
            />
        </>
    );
};

export default MyLeaveRequests;
