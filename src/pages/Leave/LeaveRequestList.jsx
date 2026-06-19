import React, { useEffect, useState, useRef } from 'react';
import { Paper, Button, IconButton, Chip, Grid, TextField as MuiTextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useTranslation } from 'react-i18next';
import { Formik } from 'formik';
import { toast } from 'sonner';

import useLeaveStore from '../../store/useLeaveStore';
import Table from '../../components/ui/Table';
import ListToolbar from '../../components/ui/ListToolbar';
import FilterPanel from '../../components/ui/FilterPanel';
import SelectInput from '../../components/ui/SelectInput';
import AsyncAutocomplete from '../../components/ui/AsyncAutocomplete';
import LeaveRequestForm from './components/LeaveRequestForm';
import ConfirmationDialog from '../../components/ui/ConfirmationDialog';
import { formatDate } from '../../LocalFunction';
import { pagingStaffs } from '../../services/StaffService';

const LeaveRequestList = () => {
    const { t } = useTranslation();
    const {
        requests,
        loading,
        page,
        pageSize,
        totalElements,
        setPage,
        setPageSize,
        setFilters,
        filters,
        loadRequests,
        approveRequest,
        rejectRequest,
        removeLeaveRequest,
        setSelectedRequest,
        selectedRequest,
        openForm,
        setOpenForm,
        keyword,
        setKeyword,
        resetStore
    } = useLeaveStore();

    const [filterOpen, setFilterOpen] = useState(false);
    const [searchDraft, setSearchDraft] = useState(keyword || '');
    const [openApproveConfirm, setOpenApproveConfirm] = useState(false);
    const [openRejectDialog, setOpenRejectDialog] = useState(false);
    const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const formikRef = useRef();

    useEffect(() => {
        return () => {
            resetStore();
        };
    }, [resetStore]);

    useEffect(() => {
        setSearchDraft(keyword || '');
    }, [keyword]);

    useEffect(() => {
        // If filters has staffId but no staff filter is selected in Formik (e.g. carried-over from MyLeaveRequests),
        // we reset the store state first to avoid loading incorrect data and calling the API twice.
        if (filters.staffId && !formikRef.current?.values?.staff?.id) {
            resetStore();
            return;
        }
        loadRequests();
    }, [page, pageSize, keyword, filters, loadRequests, resetStore]);

    const handleSearch = () => {
        setKeyword(searchDraft);
    };

    const handleApplyFilters = () => {
        setKeyword(searchDraft);
        formikRef.current?.handleSubmit();
    };

    const handleReset = () => {
        setSearchDraft('');
        formikRef.current?.resetForm();
        setKeyword('');
        setFilters({});
    };

    const handleAdd = () => {
        setSelectedRequest(null);
        setOpenForm(true);
    };

    const handleEdit = (row) => {
        setSelectedRequest(row);
        setOpenForm(true);
    };

    const handleApproveClick = (row) => {
        setSelectedRequest(row);
        setOpenApproveConfirm(true);
    };

    const handleRejectClick = (row) => {
        setSelectedRequest(row);
        setRejectReason('');
        setOpenRejectDialog(true);
    };

    const handleDeleteClick = (row) => {
        setSelectedRequest(row);
        setOpenDeleteConfirm(true);
    };

    const confirmApprove = async () => {
        if (selectedRequest?.id) {
            try {
                await approveRequest(selectedRequest.id, '');
                toast.success(t('leave.message.approveSuccess', 'Phê duyệt đơn nghỉ phép thành công'));
                setOpenApproveConfirm(false);
                setSelectedRequest(null);
            } catch (error) {
                toast.error(error.response?.data?.message || t('leave.message.approveError', 'Lỗi khi phê duyệt'));
            }
        }
    };

    const confirmReject = async () => {
        if (selectedRequest?.id) {
            try {
                await rejectRequest(selectedRequest.id, rejectReason);
                toast.success(t('leave.message.rejectSuccess', 'Từ chối đơn nghỉ phép thành công'));
                setOpenRejectDialog(false);
                setSelectedRequest(null);
            } catch (error) {
                toast.error(error.response?.data?.message || t('leave.message.rejectError', 'Lỗi khi từ chối'));
            }
        }
    };

    const confirmDelete = async () => {
        if (selectedRequest?.id) {
            try {
                await removeLeaveRequest(selectedRequest.id);
                toast.success(t('leave.message.deleteSuccess', 'Xóa đơn nghỉ phép thành công'));
                setOpenDeleteConfirm(false);
                setSelectedRequest(null);
            } catch (error) {
                toast.error(error.response?.data?.message || t('leave.message.deleteError', 'Lỗi khi xóa đơn'));
            }
        }
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
            width: 150,
            align: 'center',
            render: (rowData) => {
                const isPending = rowData.approvalStatus === 'PENDING';
                return (
                    <div className="flex items-center justify-center">
                        {isPending ? (
                            <>
                                <IconButton size="small" sx={{ color: '#2e7d32' }} onClick={() => handleApproveClick(rowData)} title={t('leave.action.approve', 'Phê duyệt')}>
                                    <CheckIcon fontSize="small" />
                                </IconButton>
                                <IconButton size="small" sx={{ color: '#d32f2f' }} onClick={() => handleRejectClick(rowData)} title={t('leave.action.reject', 'Từ chối')}>
                                    <CloseIcon fontSize="small" />
                                </IconButton>
                                <IconButton size="small" sx={{ color: '#1976d2' }} onClick={() => handleEdit(rowData)} title={t('general.edit', 'Sửa')}>
                                    <EditIcon fontSize="small" />
                                </IconButton>
                            </>
                        ) : (
                            <IconButton size="small" sx={{ color: '#d32f2f' }} onClick={() => handleDeleteClick(rowData)} title={t('general.delete', 'Xóa')}>
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        )}
                    </div>
                );
            }
        },
        {
            title: t('leave.field.staffCode', 'Mã nhân viên'),
            field: 'requestStaffCode',
            width: 130,
            render: (rowData) => <span className="font-semibold">{rowData.requestStaffCode}</span>
        },
        {
            title: t('leave.field.staffName', 'Tên nhân viên'),
            field: 'requestStaffName',
            width: 180,
            render: (rowData) => <span className="font-semibold">{rowData.requestStaffName}</span>
        },
        {
            title: t('leave.field.department', 'Phòng ban'),
            field: 'departmentName',
            width: 150,
            render: (rowData) => <span>{rowData.departmentName || '---'}</span>
        },
        {
            title: t('leave.field.leaveType', 'Loại phép'),
            field: 'leaveType',
            width: 140,
            render: (rowData) => <span>{getLeaveTypeName(rowData.leaveType)}</span>
        },
        {
            title: t('leave.field.fromDate', 'Từ ngày'),
            field: 'fromDate',
            width: 120,
            align: 'center',
            render: (rowData) => <span>{formatDate(rowData.fromDate)}</span>
        },
        {
            title: t('leave.field.toDate', 'Đến ngày'),
            field: 'toDate',
            width: 120,
            align: 'center',
            render: (rowData) => <span>{formatDate(rowData.toDate)}</span>
        },
        {
            title: t('leave.field.totalDays', 'Số ngày'),
            field: 'totalDays',
            width: 90,
            align: 'center',
            render: (rowData) => <span className="font-semibold">{rowData.totalDays}</span>
        },
        {
            title: t('leave.field.status', 'Trạng thái'),
            field: 'approvalStatus',
            width: 120,
            align: 'center',
            render: (rowData) => getStatusChip(rowData.approvalStatus)
        },
        {
            title: t('leave.field.reason', 'Lý do nghỉ'),
            field: 'requestReason',
            width: 200,
            render: (rowData) => <span className="line-clamp-2">{rowData.requestReason || '---'}</span>
        },
        {
            title: t('leave.field.rejectReason', 'Ý kiến phản hồi'),
            field: 'rejectReason',
            width: 200,
            render: (rowData) => <span className="line-clamp-2">{rowData.rejectReason || '---'}</span>
        }
    ];

    const leaveTypeOptions = [
        { value: '', name: t('general.all', 'Tất cả') },
        { value: 'ANNUAL', name: t('leave.type.annual', 'Phép năm') },
        { value: 'UNPAID', name: t('leave.type.unpaid', 'Phép không lương') }
    ];

    const approvalStatusOptions = [
        { value: '', name: t('general.all', 'Tất cả') },
        { value: 'PENDING', name: t('leave.status.pending', 'Chờ duyệt') },
        { value: 'APPROVED', name: t('leave.status.approved', 'Đã duyệt') },
        { value: 'REJECTED', name: t('leave.status.rejected', 'Từ chối') }
    ];

    return (
        <>
            <Paper elevation={0} className="p-4 border border-border">
                <Formik
                    innerRef={formikRef}
                    initialValues={{
                        staff: null,
                        leaveType: '',
                        approvalStatus: '',
                    }}
                    onSubmit={(values) => {
                        const newFilters = {};
                        if (values.staff?.id) newFilters.staffId = values.staff.id;
                        if (values.leaveType) newFilters.leaveType = values.leaveType;
                        if (values.approvalStatus) newFilters.approvalStatus = values.approvalStatus;
                        setFilters(newFilters);
                    }}
                >
                    {({ formik }) => (
                        <>
                            <ListToolbar
                                searchDraft={searchDraft}
                                onSearchDraftChange={setSearchDraft}
                                onSearch={handleSearch}
                                onReset={handleReset}
                                onAdd={handleAdd}
                                addLabel={t('leave.action.createHR', 'Tạo hộ đơn nghỉ')}
                                filter={{
                                    open: filterOpen,
                                    onToggle: setFilterOpen,
                                    activeCount: Object.keys(filters).length
                                }}
                            />

                            <FilterPanel
                                open={filterOpen}
                                onOpenChange={setFilterOpen}
                                onApply={handleApplyFilters}
                                onReset={handleReset}
                            >
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={4}>
                                        <AsyncAutocomplete
                                            name="staff"
                                            label={t('leave.field.staff', 'Nhân viên')}
                                            api={pagingStaffs}
                                            searchObject={{ pageIndex: 1, pageSize: 50 }}
                                            displayName="displayName"
                                            formik={formik}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <SelectInput
                                            name="leaveType"
                                            label={t('leave.field.leaveType', 'Loại phép')}
                                            options={leaveTypeOptions}
                                            keyValue="value"
                                            displayvalue="name"
                                            hideNullOption={true}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <SelectInput
                                            name="approvalStatus"
                                            label={t('leave.field.status', 'Trạng thái')}
                                            options={approvalStatusOptions}
                                            keyValue="value"
                                            displayvalue="name"
                                            hideNullOption={true}
                                        />
                                    </Grid>
                                </Grid>
                            </FilterPanel>
                        </>
                    )}
                </Formik>

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

            {/* Hộp thoại Phê duyệt */}
            <ConfirmationDialog
                open={openApproveConfirm}
                onConfirmDialogClose={() => setOpenApproveConfirm(false)}
                onYesClick={confirmApprove}
                title={t('leave.title.approveConfirm', 'Phê duyệt đơn nghỉ phép')}
                text={t('leave.message.approveConfirmText', 'Bạn có chắc chắn muốn phê duyệt đơn nghỉ phép này không?')}
                agree={t('general.confirm', 'Xác nhận')}
                cancel={t('general.cancel', 'Hủy bỏ')}
            />

            {/* Hộp thoại Từ chối kèm lý do */}
            <Dialog open={openRejectDialog} onClose={() => setOpenRejectDialog(false)} fullWidth maxWidth="xs">
                <DialogTitle>{t('leave.title.rejectConfirm', 'Từ chối đơn nghỉ phép')}</DialogTitle>
                <DialogContent>
                    <div className="pt-2">
                        <MuiTextField
                            label={t('leave.field.rejectReason', 'Ý kiến phản hồi / Lý do từ chối')}
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            fullWidth
                            multiline
                            rows={3}
                            variant="outlined"
                            size="small"
                        />
                    </div>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setOpenRejectDialog(false)} color="inherit" variant="outlined" sx={{ textTransform: 'none' }}>
                        {t('general.cancel', 'Hủy bỏ')}
                    </Button>
                    <Button onClick={confirmReject} color="primary" variant="contained" sx={{ textTransform: 'none', px: 3 }}>
                        {t('general.confirm', 'Từ chối')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Hộp thoại Xóa đơn */}
            <ConfirmationDialog
                open={openDeleteConfirm}
                onConfirmDialogClose={() => setOpenDeleteConfirm(false)}
                onYesClick={confirmDelete}
                title={t('general.deleteConfirm', 'Xác nhận xóa')}
                text={t('leave.message.deleteConfirmText', 'Bạn có chắc chắn muốn xóa đơn nghỉ phép này không? Thao tác này không thể phục hồi.')}
                agree={t('general.confirm', 'Xác nhận')}
                cancel={t('general.cancel', 'Hủy bỏ')}
            />
        </>
    );
};

export default LeaveRequestList;
