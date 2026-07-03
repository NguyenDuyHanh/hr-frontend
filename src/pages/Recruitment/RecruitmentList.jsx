import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Button, Grid, IconButton, Paper, Chip, 
    CircularProgress, Box, Stack
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { toast } from 'sonner';
import { Formik } from 'formik';

import Table from '../../components/ui/Table';
import ConfirmationDialog from '../../components/ui/ConfirmationDialog';
import { generateRecruitmentCode } from '../../services/recruitmentService';
import { pagingStaffs } from '../../services/StaffService';

import RecruitmentFormDialog from './components/RecruitmentFormDialog';
import { RECRUITMENT_STATUSES, ROLES } from '../../constants';

import useRecruitmentStore from '../../store/useRecruitmentStore';
import useAuthStore from '../../store/useAuthStore';
import ListToolbar from '../../components/ui/ListToolbar';
import FilterPanel from '../../components/ui/FilterPanel';
import SelectInput from '../../components/ui/SelectInput';
import TextField from '../../components/ui/TextField';
import AsyncAutocomplete from '../../components/ui/AsyncAutocomplete';

const RecruitmentList = () => {
    const navigate = useNavigate();
    const staffSearchObj = useMemo(() => ({ pageIndex: 1, pageSize: 100, extWhereClause: 'recruitment_approvers' }), []);

    // Confirmation Dialog states
    const [openConfirmDeleteRecruitment, setOpenConfirmDeleteRecruitment] = useState(false);

    // useRecruitmentStore Destructuring
    const {
        recruitments,
        loadingRecruitments,
        totalRecruitments,
        recruitmentPage,
        setRecruitmentPage,
        recruitmentPageSize,
        setRecruitmentPageSize,
        recruitmentKeyword,
        setRecruitmentKeyword,
        recruitmentFilters,
        setRecruitmentFilters,
        selectedRecruitment,
        setSelectedRecruitment,
        openRecruitmentForm,
        setOpenRecruitmentForm,
        recruitmentInput,
        setRecruitmentInput,
        loadRecruitments,
        addRecruitment,
        removeRecruitment,
        resetStore
    } = useRecruitmentStore();

    const { user } = useAuthStore();
    const userRoles = user?.role || [];
    const isRecruiterOnly = userRoles.includes(ROLES.HR_RECRUITMENT) && !userRoles.includes(ROLES.ADMIN) && !userRoles.includes(ROLES.HR_MANAGER);

    // Toolbar & Filter states for Recruitments
    const recruitmentFormikRef = useRef();
    const [recruitmentSearchDraft, setRecruitmentSearchDraft] = useState(recruitmentKeyword || '');
    const [recruitmentFilterOpen, setRecruitmentFilterOpen] = useState(false);

    // Sync draft with keyword from store (e.g. if reset)
    useEffect(() => {
        setRecruitmentSearchDraft(recruitmentKeyword || '');
    }, [recruitmentKeyword]);

    useEffect(() => {
        if (isRecruiterOnly && user?.staffId) {
            setRecruitmentFilters({ personApproveCVId: user.staffId });
        } else {
            setRecruitmentFilters({});
        }
        return () => {
            resetStore();
        };
    }, [isRecruiterOnly, user?.staffId]);

    useEffect(() => {
        // Skip initial fetch if recruiter filter is not populated yet
        if (isRecruiterOnly && user?.staffId && !recruitmentFilters.personApproveCVId) {
            return;
        }
        loadRecruitments();
    }, [recruitmentPage, recruitmentPageSize, recruitmentKeyword, recruitmentFilters, isRecruiterOnly, user?.staffId]);

    // Recruitment CRUD Handlers
    const handleAddRecruitment = async () => {
        try {
            const codeRes = await generateRecruitmentCode();
            setRecruitmentInput({
                id: null, 
                code: codeRes?.data || '', 
                name: '', 
                description: '', 
                status: 1, 
                personApproveCVId: isRecruiterOnly && user?.staffId ? user.staffId : '',
                personApproveCVName: isRecruiterOnly && user?.staffName ? user.staffName : ''
            });
            setOpenRecruitmentForm(true);
        } catch (err) {
            toast.error("Lỗi khởi tạo mã tin tuyển dụng");
        }
    };

    const handleDeleteRecruitmentClick = (recruitment) => {
        setSelectedRecruitment(recruitment);
        setOpenConfirmDeleteRecruitment(true);
    };

    const handleConfirmDeleteRecruitment = async () => {
        if (selectedRecruitment?.id) {
            try {
                await removeRecruitment(selectedRecruitment.id);
                toast.success("Xóa tin tuyển dụng thành công");
                setSelectedRecruitment(null);
                setOpenConfirmDeleteRecruitment(false);
            } catch (err) {
                toast.error("Lỗi khi xóa tin tuyển dụng");
            }
        }
    };

    const handleSaveRecruitment = async (values) => {
        try {
            await addRecruitment(values);
            toast.success(values.id ? "Cập nhật tin tuyển dụng thành công" : "Tạo tin tuyển dụng thành công");
        } catch (err) {
            toast.error(err?.response?.data?.message || "Lỗi lưu tin tuyển dụng");
        }
    };

    // Recruitment Filter Handlers
    const handleRecruitmentSearch = () => {
        setRecruitmentKeyword(recruitmentSearchDraft);
    };

    const handleApplyRecruitmentFilters = () => {
        setRecruitmentKeyword(recruitmentSearchDraft);
        recruitmentFormikRef.current?.handleSubmit();
    };

    const handleResetRecruitmentFilters = () => {
        setRecruitmentSearchDraft('');
        recruitmentFormikRef.current?.resetForm();
        setRecruitmentKeyword('');
        if (isRecruiterOnly && user?.staffId) {
            setRecruitmentFilters({ personApproveCVId: user.staffId });
        } else {
            setRecruitmentFilters({});
        }
    };

    // Recruitment Columns
    const recruitmentColumns = [
        {
            title: 'Thao tác',
            field: 'actions',
            align: 'center',
            width: 120,
            render: (row) => (
                <div className="flex items-center justify-center space-x-1">
                    <IconButton size="small" sx={{ color: '#1976d2' }} onClick={() => navigate(`/recruitments/${row.id}/view`)} title="Xem chi tiết">
                        <VisibilityIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" sx={{ color: '#ed6c02' }} onClick={() => navigate(`/recruitments/${row.id}/edit`)} title="Chỉnh sửa">
                        <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" sx={{ color: '#d32f2f' }} onClick={() => handleDeleteRecruitmentClick(row)} title="Xóa">
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </div>
            )
        },
        { title: 'Mã tin', field: 'code', align: 'center', width: 130 },
        { title: 'Tiêu đề tuyển dụng', field: 'name', align: 'center', width: 220 },
        { 
            title: 'Người duyệt CV', 
            field: 'personApproveCVName', 
            align: 'center',
            width: 180,
            render: (row) => row.personApproveCVName || 'Chưa phân công'
        },
        {
            title: 'Trạng thái',
            field: 'status',
            align: 'center',
            width: 150,
            render: (row) => {
                const st = RECRUITMENT_STATUSES.find(s => s.value === row.status) || RECRUITMENT_STATUSES[0];
                return <Chip label={st.label} color={st.color} size="small" variant="outlined" />;
            }
        }
    ];

    return (
        <Stack spacing={3}>
            {/* Top Section: List of Recruitments */}
            <Paper elevation={0} className="p-4 border border-border">
                <Formik
                    innerRef={recruitmentFormikRef}
                    enableReinitialize={true}
                    initialValues={{
                        status: '',
                        code: '',
                        name: '',
                        personApproveCV: isRecruiterOnly && user?.staffId 
                            ? { id: user.staffId, displayName: user.staffName || '' } 
                            : null
                    }}
                    onSubmit={(values) => {
                        const filtersObj = {};
                        if (values.status !== '') {
                            filtersObj.status = parseInt(values.status, 10);
                        }
                        if (values.code && values.code.trim()) {
                            filtersObj.code = values.code.trim();
                        }
                        if (values.name && values.name.trim()) {
                            filtersObj.name = values.name.trim();
                        }
                        if (values.personApproveCV) {
                            filtersObj.personApproveCVId = values.personApproveCV.id;
                        }
                        setRecruitmentFilters(filtersObj);
                    }}
                >
                    {() => (
                        <>
                            <ListToolbar
                                searchDraft={recruitmentSearchDraft}
                                onSearchDraftChange={setRecruitmentSearchDraft}
                                onSearch={handleRecruitmentSearch}
                                onReset={handleResetRecruitmentFilters}
                                onAdd={handleAddRecruitment}
                                addLabel="Đăng tin tuyển dụng"
                                filter={{
                                    open: recruitmentFilterOpen,
                                    onToggle: setRecruitmentFilterOpen,
                                    activeCount: Object.keys(recruitmentFilters).length
                                }}
                            />

                            <FilterPanel
                                open={recruitmentFilterOpen}
                                onOpenChange={setRecruitmentFilterOpen}
                                onApply={handleApplyRecruitmentFilters}
                                onReset={handleResetRecruitmentFilters}
                            >
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            name="code"
                                            label="Mã tin tuyển dụng"
                                            placeholder="Nhập mã tin..."
                                            fullWidth
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            name="name"
                                            label="Tiêu đề tuyển dụng"
                                            placeholder="Nhập tiêu đề..."
                                            fullWidth
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <AsyncAutocomplete
                                            name="personApproveCV"
                                            label="Người duyệt hồ sơ"
                                            api={pagingStaffs}
                                            searchObject={staffSearchObj}
                                            placeholder="Chọn người duyệt hồ sơ..."
                                            displayName="displayName"
                                            fullWidth
                                            disabled={isRecruiterOnly}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <SelectInput
                                            name="status"
                                            label="Trạng thái tin"
                                            options={[
                                                { value: '', name: 'Tất cả' },
                                                ...RECRUITMENT_STATUSES.map(opt => ({ value: String(opt.value), name: opt.label }))
                                            ]}
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

                {loadingRecruitments ? (
                    <Box display="flex" justifyContent="center" py={4}>
                        <CircularProgress size={30} />
                    </Box>
                ) : (
                    <Table
                        columns={recruitmentColumns}
                        data={recruitments}
                        totalElements={totalRecruitments}
                        page={recruitmentPage}
                        pageSize={recruitmentPageSize}
                        handleChangePage={(e, p) => setRecruitmentPage(p)}
                        setRowsPerPage={(e) => setRecruitmentPageSize(parseInt(e.target.value, 10))}
                    />
                )}
            </Paper>

            {/* Dialog: Recruitment Add Form */}
            <RecruitmentFormDialog
                open={openRecruitmentForm}
                onClose={() => setOpenRecruitmentForm(false)}
                recruitmentInput={recruitmentInput}
                onSave={handleSaveRecruitment}
            />

            {/* Confirmation Dialogs */}
            <ConfirmationDialog
                open={openConfirmDeleteRecruitment}
                onConfirmDialogClose={() => setOpenConfirmDeleteRecruitment(false)}
                onYesClick={handleConfirmDeleteRecruitment}
                title="Xác nhận xóa tin tuyển dụng"
                text="Bạn có chắc chắn muốn xóa tin tuyển dụng này không? Mọi ứng viên nộp hồ sơ vào tin này vẫn được lưu giữ nhưng liên kết sẽ bị xóa."
                agree="Xác nhận"
                cancel="Hủy"
            />
        </Stack>
    );
};

export default RecruitmentList;
