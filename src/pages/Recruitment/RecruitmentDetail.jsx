import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
    Button, Grid, IconButton, Paper, Typography, 
    Select, MenuItem, FormControl, Chip, Card, 
    Avatar, Tooltip, Link, 
    Box, Stack
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { toast } from 'sonner';
import { useFormik, FormikProvider, Formik } from 'formik';
import * as Yup from 'yup';

import Table from '../../components/ui/Table';
import ConfirmationDialog from '../../components/ui/ConfirmationDialog';
import { getRecruitmentById, saveRecruitment } from '../../services/recruitmentService';
import { generateCandidateCode } from '../../services/candidateService';
import { getStaffs, getDepartments, getPositions, pagingStaffs } from '../../services/StaffService';

import CandidateFormDialog from './components/CandidateFormDialog';
import RejectionDialog from './components/RejectionDialog';
import { RECRUITMENT_STATUSES, CANDIDATE_STATUSES, ROLES } from '../../constants';

import useRecruitmentStore from '../../store/useRecruitmentStore';
import useAuthStore from '../../store/useAuthStore';
import ListToolbar from '../../components/ui/ListToolbar';
import FilterPanel from '../../components/ui/FilterPanel';
import SelectInput from '../../components/ui/SelectInput';
import TextField from '../../components/ui/TextField';
import AsyncAutocomplete from '../../components/ui/AsyncAutocomplete';
import TabAccordion from '../../components/ui/Tab/TabAccordion';

const RecruitmentDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const isViewMode = location.pathname.endsWith('/view');

    const { user } = useAuthStore();
    const userRoles = user?.role || [];
    const isRecruiterOnly = userRoles.includes(ROLES.HR_RECRUITMENT) && !userRoles.includes(ROLES.ADMIN) && !userRoles.includes(ROLES.HR_MANAGER);

    const [loading, setLoading] = useState(true);
    const [departments, setDepartments] = useState([]);
    const [positions, setPositions] = useState([]);
    const staffSearchObj = useMemo(() => ({ pageIndex: 1, pageSize: 100, extWhereClause: 'recruitment_approvers' }), []);

    // Dialog state for candidate status update
    const [openStatusDialog, setOpenStatusDialog] = useState(false);
    const [targetCandidateStatus, setTargetCandidateStatus] = useState('');
    const [refusalReason, setRefusalReason] = useState('');

    // Confirmation Dialog states
    const [openConfirmDeleteCand, setOpenConfirmDeleteCand] = useState(false);

    // useRecruitmentStore Destructuring
    const {
        selectedRecruitment,
        setSelectedRecruitment,
        candidates,
        loadingCandidates,
        totalCandidates,
        candidatePage,
        setCandidatePage,
        candidatePageSize,
        setCandidatePageSize,
        candidateKeyword,
        setCandidateKeyword,
        candidateFilters,
        setCandidateFilters,
        selectedCandidate,
        setSelectedCandidate,
        openCandidateForm,
        setOpenCandidateForm,
        candidateInput,
        setCandidateInput,
        loadCandidates,
        addCandidate,
        removeCandidate,
        changeCandidateStatus,
        resetStore
    } = useRecruitmentStore();

    // Toolbar & Filter states for Candidates
    const candidateFormikRef = useRef();
    const [candidateSearchDraft, setCandidateSearchDraft] = useState(candidateKeyword || '');
    const [candidateFilterOpen, setCandidateFilterOpen] = useState(false);

    // Sync draft with keyword from store (e.g. if reset)
    useEffect(() => {
        setCandidateSearchDraft(candidateKeyword || '');
    }, [candidateKeyword]);

    // Fetch details & reference data
    const loadRecruitmentDetails = async () => {
        setLoading(true);
        try {
            const res = await getProjectByIdOrRecruitment(id);
            setSelectedRecruitment(res?.data || null);
        } catch (err) {
            console.error(err);
            toast.error("Không thể tải thông tin tin tuyển dụng");
        } finally {
            setLoading(false);
        }
    };

    const getProjectByIdOrRecruitment = async (recId) => {
        return await getRecruitmentById(recId);
    };

    useEffect(() => {
        if (id) {
            loadRecruitmentDetails();
        }
        
        const fetchMetadata = async () => {
            try {
                const deptRes = await getDepartments();
                setDepartments(deptRes?.data || []);
                
                const posRes = await getPositions();
                setPositions(posRes?.data || []);
            } catch (err) {
                console.error("Lỗi lấy dữ liệu cấu hình:", err);
            }
        };
        fetchMetadata();
    }, [id]);

    useEffect(() => {
        return () => {
            resetStore();
        };
    }, []);

    // Load Candidates when selectedRecruitment or paging changes
    useEffect(() => {
        loadCandidates();
    }, [selectedRecruitment, candidatePage, candidatePageSize, candidateKeyword, candidateFilters]);

    // Formik for Recruitment Info Form
    const initialValues = useMemo(() => ({
        id: selectedRecruitment?.id || null,
        code: selectedRecruitment?.code || '',
        name: selectedRecruitment?.name || '',
        personApproveCV: selectedRecruitment?.personApproveCVId 
            ? { id: selectedRecruitment.personApproveCVId, displayName: selectedRecruitment.personApproveCVName || '' } 
            : (isRecruiterOnly && user?.staffId ? { id: user.staffId, displayName: user.staffName || '' } : null),
        status: selectedRecruitment?.status ?? 1,
        description: selectedRecruitment?.description || ''
    }), [selectedRecruitment, isRecruiterOnly, user]);

    const validationSchema = Yup.object({
        name: Yup.string().trim().required('Tiêu đề tuyển dụng là bắt buộc'),
        personApproveCV: Yup.mixed().required('Vui lòng chọn người duyệt hồ sơ'),
    });

    const formik = useFormik({
        initialValues,
        enableReinitialize: true,
        validationSchema,
        onSubmit: async (values) => {
            const submitValues = {
                ...values,
                personApproveCVId: values.personApproveCV?.id || null,
                personApproveCV: undefined
            };
            try {
                const res = await saveRecruitment(submitValues);
                setSelectedRecruitment(res?.data || null);
                toast.success("Cập nhật tin tuyển dụng thành công");
                navigate(`/recruitments/${id}/view`);
            } catch (err) {
                toast.error("Lỗi khi lưu tin tuyển dụng");
            }
        }
    });

    // Candidate CRUD Handlers
    const handleAddCandidate = async () => {
        if (!selectedRecruitment) return;
        try {
            const codeRes = await generateCandidateCode();
            setCandidateInput({
                id: null,
                candidateCode: codeRes?.data || '',
                displayName: '',
                gender: 'MALE',
                birthDate: '',
                email: '',
                phoneNumber: '',
                address: '',
                avatarUrl: '',
                cvFileUrl: '',
                status: 0,
                recruitmentId: selectedRecruitment.id,
                departmentId: '',
                positionId: '',
                note: ''
            });
            setOpenCandidateForm(true);
        } catch (err) {
            toast.error("Lỗi khởi tạo mã ứng viên");
        }
    };

    const handleEditCandidate = (cand) => {
        setCandidateInput({
            id: cand.id,
            candidateCode: cand.candidateCode,
            displayName: cand.displayName,
            gender: cand.gender || 'MALE',
            birthDate: cand.birthDate || '',
            email: cand.email || '',
            phoneNumber: cand.phoneNumber || '',
            address: cand.address || '',
            avatarUrl: cand.avatarUrl || '',
            cvFileUrl: cand.cvFileUrl || '',
            status: cand.status,
            recruitmentId: cand.recruitmentId || selectedRecruitment.id,
            departmentId: cand.departmentId || '',
            positionId: cand.positionId || '',
            note: cand.note || ''
        });
        setOpenCandidateForm(true);
    };

    const handleDeleteCandidateClick = (cand) => {
        setSelectedCandidate(cand);
        setOpenConfirmDeleteCand(true);
    };

    const handleConfirmDeleteCandidate = async () => {
        if (selectedCandidate?.id) {
            try {
                await removeCandidate(selectedCandidate.id);
                toast.success("Xóa ứng viên thành công");
                setSelectedCandidate(null);
                setOpenConfirmDeleteCand(false);
            } catch (err) {
                toast.error("Lỗi khi xóa ứng viên");
            }
        }
    };

    const handleSaveCandidate = async (values) => {
        try {
            await addCandidate(values);
            toast.success(values.id ? "Cập nhật ứng viên thành công" : "Thêm ứng viên thành công");
        } catch (err) {
            toast.error(err?.response?.data?.message || "Lỗi lưu thông tin ứng viên");
        }
    };

    // Candidate Filter Handlers
    const handleCandidateSearch = () => {
        setCandidateKeyword(candidateSearchDraft);
    };

    const handleApplyCandidateFilters = () => {
        setCandidateKeyword(candidateSearchDraft);
        candidateFormikRef.current?.handleSubmit();
    };

    const handleResetCandidateFilters = () => {
        setCandidateSearchDraft('');
        candidateFormikRef.current?.resetForm();
        setCandidateKeyword('');
        setCandidateFilters({});
    };

    // Status Transition Handlers
    const handleStatusChangeClick = (cand, newStatus) => {
        setSelectedCandidate(cand);
        setTargetCandidateStatus(newStatus);
        if (newStatus === 'REJECTED') {
            setRefusalReason(cand.note || '');
            setOpenStatusDialog(true);
        } else {
            submitStatusChange(cand.id, newStatus, null);
        }
    };

    const submitStatusChange = async (candidateId, status, reason) => {
        try {
            await changeCandidateStatus(candidateId, status, reason);
            toast.success("Cập nhật trạng thái ứng viên thành công");
            setOpenStatusDialog(false);
            setRefusalReason('');
        } catch (err) {
            toast.error("Lỗi khi cập nhật trạng thái");
        }
    };


    // Candidate Columns
    const candidateColumns = [
        {
            title: 'Thao tác',
            field: 'actions',
            align: 'center',
            width: 120,
            render: (row) => (
                <div className="flex items-center space-x-1">
                    <IconButton 
                        size="small" 
                        sx={{ color: '#ed6c02' }} 
                        onClick={() => handleEditCandidate(row)} 
                        title="Sửa hồ sơ"
                        disabled={isViewMode}
                    >
                        <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton 
                        size="small" 
                        sx={{ color: '#d32f2f' }} 
                        onClick={() => handleDeleteCandidateClick(row)} 
                        title="Xóa ứng viên"
                        disabled={isViewMode}
                    >
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </div>
            )
        },
        { title: 'Mã ứng viên', field: 'candidateCode',  width: 130 },
        { 
            title: 'Thông tin ứng viên', 
            field: 'displayName', 
            width: 250,
            render: (row) => (
                <Box display="flex" alignItems="center" gap={1.5} py={1}>
                    <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>{row.displayName}</Typography>
                        <Typography variant="caption" color="text.secondary">Ngày sinh: {row.birthDate || '---'}</Typography>
                        <Box>
                            <Typography variant="caption" color="text.secondary">Giới tính: {row.gender === 'MALE' ? 'Nam' : row.gender === 'FEMALE' ? 'Nữ' : row.gender === 'OTHER' ? 'Khác' : (row.gender || '---')}</Typography>
                        </Box>
                    </Box>
                </Box>
            )
        },
        {
            title: 'Liên hệ',
            width: 200,
            render: (row) => (
                <Box py={0.5}>
                    <Typography variant="body2" sx={{ fontSize: '12px' }}>SĐT: {row.phoneNumber || '---'}</Typography>
                    <Typography variant="body2" sx={{ fontSize: '12px', color: 'text.secondary' }}>Email: {row.email || '---'}</Typography>
                </Box>
            )
        },
        {
            title: 'Phòng ban & Vị trí tiếp nhận',
            width: 220,
            render: (row) => (
                <Box py={0.5}>
                    <Typography variant="body2" sx={{ fontSize: '12px', fontWeight: 'bold' }}>PB: {row.departmentName || '---'}</Typography>
                    <Typography variant="body2" sx={{ fontSize: '12px', color: 'text.secondary' }}>VT: {row.positionName || '---'}</Typography>
                </Box>
            )
        },
        {
            title: 'CV Đính kèm',
            field: 'cvFileUrl',
            align: 'center',
            width: 150,
            render: (row) => row.cvFileUrl ? (
                <Box display="flex" alignItems="center" gap={1} justifyContent="center">
                    <Tooltip title="Xem CV ứng viên">
                        <Link href={row.cvFileUrl} target="_blank" rel="noopener" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, color: '#d32f2f', textDecoration: 'none' }}>
                            <PictureAsPdfIcon fontSize="small" />
                            <span style={{ fontSize: '12px', fontWeight: '500' }}>Xem</span>
                        </Link>
                    </Tooltip>
                    <Tooltip title="Tải CV về máy">
                        <IconButton 
                            size="small" 
                            onClick={() => {
                                let downloadUrl = row.cvFileUrl;
                                if (downloadUrl.includes('res.cloudinary.com')) {
                                    downloadUrl = downloadUrl.replace('/upload/', '/upload/fl_attachment/');
                                }
                                window.open(downloadUrl, '_blank');
                            }}
                            sx={{ color: 'primary.main', p: 0.5 }}
                        >
                            <FileDownloadIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
            ) : <Typography variant="caption" color="text.disabled">Chưa nộp</Typography>
        },
        {
            title: 'Trạng thái',
            field: 'status',
            width: 180,
            render: (row) => {
                const st = CANDIDATE_STATUSES.find(s => s.value === row.status) || CANDIDATE_STATUSES[0];
                return (
                    <Box display="flex" flexDirection="column" gap={0.5}>
                        <Box display="flex" alignItems="center" gap={1}>
                            {row.status !== 'ONBOARDED' && row.status !== 'REJECTED' ? (
                                <FormControl size="small" sx={{ minWidth: 130 }}>
                                    <Select
                                        value={row.status}
                                        onChange={(e) => handleStatusChangeClick(row, e.target.value)}
                                        sx={{ fontSize: '12px', height: '30px' }}
                                        disabled={isViewMode}
                                    >
                                        {CANDIDATE_STATUSES.map(opt => (
                                            <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: '12px' }}>
                                                {opt.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            ) : (
                                <Chip label={st.label} color={st.color} size="small" variant="outlined" />
                            )}
                            

                        </Box>
                        {row.note && (
                            <Tooltip title={row.note}>
                                <Typography 
                                    variant="caption" 
                                    color="text.secondary" 
                                    sx={{ 
                                        display: 'block', 
                                        fontStyle: 'italic', 
                                        maxWidth: 160,
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                    }}
                                >
                                    Ghi chú: {row.note}
                                </Typography>
                            </Tooltip>
                        )}
                    </Box>
                );
            }
        }
    ];

    if (loading) {
        return null;
    }

    if (!selectedRecruitment) {
        return (
            <Paper className="p-6 text-center border border-border">
                <Typography variant="h6" color="error">
                    Không tìm thấy thông tin tin tuyển dụng
                </Typography>
                <Button 
                    startIcon={<ArrowBackIcon />} 
                    onClick={() => navigate('/recruitments')}
                    className="mt-4"
                    variant="contained"
                >
                    Quay lại danh sách
                </Button>
            </Paper>
        );
    }

    return (
        <Stack spacing={2}>
            {/* Top section: back button and mode action */}
            <Paper elevation={0} className="p-4 border border-border">
                <div className="flex justify-between items-center mb-4">
                    <Button 
                        startIcon={<ArrowBackIcon />} 
                        onClick={() => navigate('/recruitments')}
                        sx={{ textTransform: 'none', color: 'text.secondary' }}
                        size="small"
                    >
                        Quay lại danh sách
                    </Button>
                    {isViewMode && (
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<EditIcon />}
                            onClick={() => navigate(`/recruitments/${id}/edit`)}
                            sx={{ textTransform: 'none' }}
                            size="small"
                        >
                            Chỉnh sửa tin
                        </Button>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Typography variant="h5" className="font-bold text-foreground">
                        {selectedRecruitment.name}
                    </Typography>
                    <Chip 
                        label={selectedRecruitment.code} 
                        size="small" 
                        className="font-mono font-bold"
                        color="primary" 
                        variant="outlined"
                    />
                </div>
            </Paper>

            {/* Accordion 1: Thông tin tin tuyển dụng */}
            <TabAccordion title="Thông tin tin tuyển dụng" open={true}>
                <FormikProvider value={formik}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                name="code"
                                label="Mã tin tuyển dụng"
                                disabled
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                name="name"
                                label="Tiêu đề tuyển dụng"
                                required
                                disabled={isViewMode}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <AsyncAutocomplete
                                name="personApproveCV"
                                label="Người duyệt hồ sơ"
                                required
                                disabled={isViewMode || isRecruiterOnly}
                                api={pagingStaffs}
                                searchObject={staffSearchObj}
                                placeholder="Chọn người duyệt hồ sơ..."
                                displayName="displayName"
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <SelectInput
                                name="status"
                                label="Trạng thái tin"
                                disabled={isViewMode}
                                options={RECRUITMENT_STATUSES}
                                keyValue="value"
                                displayvalue="label"
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                name="description"
                                label="Mô tả công việc chi tiết (JD, yêu cầu, quyền lợi...)"
                                multiline
                                rows={4}
                                disabled={isViewMode}
                                placeholder="Nhập thông tin JD..."
                                fullWidth
                            />
                        </Grid>
                        {!isViewMode && (
                            <Grid item xs={12} display="flex" justifyContent="flex-end" gap={1.5} sx={{ mt: 2 }}>
                                <Button 
                                    onClick={() => navigate(`/recruitments/${id}/view`)} 
                                    variant="outlined" 
                                    color="inherit" 
                                    sx={{ textTransform: 'none' }}
                                >
                                    Hủy bỏ
                                </Button>
                                <Button 
                                    onClick={formik.handleSubmit} 
                                    variant="contained" 
                                    color="primary" 
                                    sx={{ textTransform: 'none' }}
                                >
                                    Lưu lại
                                </Button>
                            </Grid>
                        )}
                    </Grid>
                </FormikProvider>
            </TabAccordion>

            {/* Accordion 2: Danh sách hồ sơ ứng tuyển */}
            <TabAccordion title="Danh sách hồ sơ ứng tuyển" open={true}>
                <Formik
                    innerRef={candidateFormikRef}
                    initialValues={{
                        status: ''
                    }}
                    onSubmit={(values) => {
                        const filtersObj = {};
                        if (values.status !== '') {
                            filtersObj.status = values.status;
                        }
                        setCandidateFilters(filtersObj);
                    }}
                >
                    {() => (
                        <>
                            <ListToolbar
                                searchDraft={candidateSearchDraft}
                                onSearchDraftChange={setCandidateSearchDraft}
                                onSearch={handleCandidateSearch}
                                onReset={handleResetCandidateFilters}
                                onAdd={handleAddCandidate}
                                addDisabled={isViewMode}
                                addLabel="Thêm ứng viên"
                                filter={{
                                    open: candidateFilterOpen,
                                    onToggle: setCandidateFilterOpen,
                                    activeCount: Object.keys(candidateFilters).length
                                }}
                            />

                            <FilterPanel
                                open={candidateFilterOpen}
                                onOpenChange={setCandidateFilterOpen}
                                onApply={handleApplyCandidateFilters}
                                onReset={handleResetCandidateFilters}
                            >
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <SelectInput
                                            name="status"
                                            label="Trạng thái tuyển dụng"
                                            options={[
                                                { value: '', name: 'Tất cả' },
                                                ...CANDIDATE_STATUSES.map(opt => ({ value: String(opt.value), name: opt.label }))
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

                <Table
                    columns={candidateColumns}
                    data={candidates}
                    totalElements={totalCandidates}
                    page={candidatePage}
                    pageSize={candidatePageSize}
                    handleChangePage={(e, p) => setCandidatePage(p)}
                    setRowsPerPage={(e) => setCandidatePageSize(parseInt(e.target.value, 10))}
                />
            </TabAccordion>

            {/* Dialog: Candidate Add/Edit Form */}
            {openCandidateForm && (
                <CandidateFormDialog
                    open={openCandidateForm}
                    onClose={() => setOpenCandidateForm(false)}
                    candidateInput={candidateInput}
                    onSave={handleSaveCandidate}
                    departments={departments}
                    positions={positions}
                />
            )}

            {/* Dialog: Candidate rejection reason */}
            {openStatusDialog && (
                <RejectionDialog
                    open={openStatusDialog}
                    onClose={() => setOpenStatusDialog(false)}
                    refusalReason={refusalReason}
                    setRefusalReason={setRefusalReason}
                    onConfirm={() => submitStatusChange(selectedCandidate.id, targetCandidateStatus, refusalReason)}
                />
            )}

            {/* Confirmation Dialogs */}
            <ConfirmationDialog
                open={openConfirmDeleteCand}
                onConfirmDialogClose={() => setOpenConfirmDeleteCand(false)}
                onYesClick={handleConfirmDeleteCandidate}
                title="Xác nhận xóa hồ sơ ứng viên"
                text="Bạn có chắc chắn muốn xóa hồ sơ ứng viên này khỏi hệ thống không? Hành động này không thể phục hồi."
                agree="Xác nhận"
                cancel="Hủy"
            />
        </Stack>
    );
};

export default RecruitmentDetail;
