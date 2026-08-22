import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Grid,
    Box,
    Button,
    Chip,
    IconButton,
    Tooltip,
    Typography,
    Paper
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CampaignIcon from '@mui/icons-material/Campaign';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import InfoIcon from '@mui/icons-material/Info';
import DownloadIcon from '@mui/icons-material/Download';

import { useFormik, FormikProvider } from 'formik';

import useAuthStore from '../../store/useAuthStore';
import useAnnouncementStore from '../../store/useAnnouncementStore';
import { markAsRead } from '../../services/notificationService';
import useNotificationStore from '../../store/useNotificationStore';
import { ROLES } from '../../constants/roles';
import { ANNOUNCEMENT_CATEGORIES, ANNOUNCEMENT_STATUS } from '../../constants/notification';
import { formatDate } from '../../LocalFunction';

import Popup from '../../components/ui/Popup';
import SelectInput from '../../components/ui/SelectInput';
import ConfirmationDialog from '../../components/ui/ConfirmationDialog';
import Table from '../../components/ui/Table';
import ListToolbar from '../../components/ui/ListToolbar';
import FilterPanel from '../../components/ui/FilterPanel';
import AnnouncementForm from './components/AnnouncementForm';
import { useAnnouncements, useDeleteAnnouncement } from './api';

const AnnouncementsPage = () => {
    const { t } = useTranslation();
    const { user } = useAuthStore();
    const userRoles = user?.role || [];
    const isManager = userRoles.includes(ROLES.ADMIN) || userRoles.includes(ROLES.HR_MANAGER);

    const {
        page,
        setPage,
        pageSize,
        setPageSize,
        keyword,
        setKeyword,
        filterCategory,
        setFilterCategory,
        filterStatus,
        setFilterStatus,
        resetStore
    } = useAnnouncementStore();

    // Query & Mutations
    const { data: announcementData, isFetching } = useAnnouncements({
        pageIndex: page,
        pageSize,
        keyword: keyword || null,
        category: filterCategory || null,
        status: filterStatus || null
    });
    const deleteAnnouncementMutation = useDeleteAnnouncement();

    const { fetchUnreadCount } = useNotificationStore();

    const [openDialog, setOpenDialog] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [selectedAnn, setSelectedAnn] = useState(null);
    const [openViewDialog, setOpenViewDialog] = useState(false);
    const [openConfirmDelete, setOpenConfirmDelete] = useState(false);

    const [searchDraft, setSearchDraft] = useState(keyword);
    const [filterOpen, setFilterOpen] = useState(false);

    useEffect(() => {
        return () => {
            resetStore();
        };
    }, []);

    const categoryOptions = [
        { value: '', displayValue: t('announcement.categories.all', 'Tất cả danh mục') },
        { value: ANNOUNCEMENT_CATEGORIES.HOLIDAY, displayValue: t('announcement.categories.holiday', 'Lịch nghỉ lễ') },
        { value: ANNOUNCEMENT_CATEGORIES.EVENT, displayValue: t('announcement.categories.event', 'Sự kiện') },
        { value: ANNOUNCEMENT_CATEGORIES.POLICY, displayValue: t('announcement.categories.policy', 'Chính sách') },
        { value: ANNOUNCEMENT_CATEGORIES.GENERAL, displayValue: t('announcement.categories.general', 'Thông báo chung') }
    ];

    const statusOptions = [
        { value: '', displayValue: t('announcement.status.all', 'Tất cả trạng thái') },
        { value: ANNOUNCEMENT_STATUS.DRAFT, displayValue: t('announcement.status.draft', 'Bản nháp') },
        { value: ANNOUNCEMENT_STATUS.PUBLISHED, displayValue: t('announcement.status.published', 'Đã ban hành') }
    ];

    const getCategoryDetails = (cat) => {
        switch (cat) {
            case ANNOUNCEMENT_CATEGORIES.HOLIDAY:
                return {
                    label: t('announcement.categories.holiday', 'Lịch nghỉ lễ'),
                    color: 'warning',
                    icon: <CalendarTodayIcon sx={{ fontSize: 16 }} />,
                    chipClass: 'bg-orange-100 text-orange-800'
                };
            case ANNOUNCEMENT_CATEGORIES.EVENT:
                return {
                    label: t('announcement.categories.event', 'Sự kiện'),
                    color: 'secondary',
                    icon: <CampaignIcon sx={{ fontSize: 16 }} />,
                    chipClass: 'bg-purple-100 text-purple-800'
                };
            case ANNOUNCEMENT_CATEGORIES.POLICY:
                return {
                    label: t('announcement.categories.policy', 'Chính sách'),
                    color: 'info',
                    icon: <BookmarkIcon sx={{ fontSize: 16 }} />,
                    chipClass: 'bg-blue-100 text-blue-800'
                };
            default:
                return {
                    label: t('announcement.categories.general', 'Thông báo chung'),
                    color: 'default',
                    icon: <InfoIcon sx={{ fontSize: 16 }} />,
                    chipClass: 'bg-emerald-100 text-emerald-800'
                };
        }
    };

    const filterFormik = useFormik({
        initialValues: {
            category: filterCategory,
            status: filterStatus
        },
        enableReinitialize: true,
        onSubmit: (values) => {
            setFilterCategory(values.category);
            setFilterStatus(values.status);
            setPage(1);
        },
    });

    const handleSearch = () => {
        setKeyword(searchDraft);
        setPage(1);
        if (filterOpen) filterFormik.handleSubmit();
    };

    const handleApplyFilters = () => {
        setKeyword(searchDraft);
        filterFormik.handleSubmit();
    };

    const handleReset = () => {
        setSearchDraft('');
        setKeyword('');
        filterFormik.resetForm({ values: { category: '', status: '' } });
        setFilterCategory('');
        setFilterStatus('');
        setPage(1);
    };

    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (filterCategory) count++;
        if (filterStatus) count++;
        return count;
    }, [filterCategory, filterStatus]);

    const handleOpenAdd = () => {
        setIsEdit(false);
        setSelectedAnn(null);
        setOpenDialog(true);
    };

    const handleOpenEdit = (ann, e) => {
        if (e) e.stopPropagation();
        setIsEdit(true);
        setSelectedAnn(ann);
        setOpenDialog(true);
    };

    const handleOpenDelete = (ann, e) => {
        if (e) e.stopPropagation();
        setSelectedAnn(ann);
        setOpenConfirmDelete(true);
    };

    const handleConfirmDelete = async () => {
        if (selectedAnn && selectedAnn.id) {
            await deleteAnnouncementMutation.mutateAsync(selectedAnn.id);
            setOpenConfirmDelete(false);
        }
    };

    const handleViewDetail = async (ann) => {
        setSelectedAnn(ann);
        setOpenViewDialog(true);
        
        if (ann.isRead === false) {
            try {
                const storedNotis = useNotificationStore.getState().notifications;
                const matchNoti = storedNotis.find(n => n.targetObjectId === ann.id);
                if (matchNoti) {
                    await markAsRead(matchNoti.id);
                    ann.isRead = true;
                    fetchUnreadCount();
                }
            } catch (err) {
                console.warn("Failed to mark notification as read", err);
            }
        }
    };

    const columns = useMemo(() => {
        const baseColumns = [
            {
                title: t('announcement.fields.code', 'Mã thông báo'),
                field: 'code',
                align: 'left',
                width: '140px',
                render: (row) => (
                    <span>{row.code || 'N/A'}</span>
                )
            },
            { 
                title: t('announcement.fields.title', 'Tiêu đề thông báo'), 
                field: 'title', 
                align: 'left',
                render: (row) => (
                    <Typography 
                        variant="body2" 
                        onClick={() => handleViewDetail(row)}
                        className="cursor-pointer hover:text-primary hover:underline transition-colors"
                    >
                        {row.title}
                    </Typography>
                )
            },
            {
                title: t('announcement.fields.category', 'Phân loại danh mục'),
                align: 'center',
                width: '150px',
                render: (row) => {
                    const details = getCategoryDetails(row.category);
                    return (
                        <Chip
                            label={details.label}
                            size="small"
                            className={`${details.chipClass} text-[11px] font-semibold uppercase tracking-wider`}
                        />
                    );
                }
            },
            {
                title: t('announcement.fields.createdBy', 'Người đăng'),
                field: 'createdBy',
                align: 'left',
                width: '180px'
            },
            {
                title: t('announcement.fields.publishDate', 'Ngày đăng'),
                align: 'center',
                width: '150px',
                render: (row) => row.publishDate ? formatDate(row.publishDate, 'dd/MM/yyyy') : formatDate(row.createDate, 'dd/MM/yyyy')
            }
        ];

        if (isManager) {
            baseColumns.push({
                title: t('announcement.fields.status', 'Trạng thái'),
                align: 'center',
                width: '140px',
                render: (row) => (
                    <Chip
                        label={row.status === ANNOUNCEMENT_STATUS.PUBLISHED 
                            ? t('announcement.status.published', 'Đã ban hành') 
                            : t('announcement.status.draft', 'Bản nháp')}
                        color={row.status === ANNOUNCEMENT_STATUS.PUBLISHED ? 'success' : 'default'}
                        variant="outlined"
                        size="small"
                        sx={{ fontSize: '11px', fontWeight: 600 }}
                    />
                )
            });

            baseColumns.unshift({
                title: t('common.actions', 'Thao tác'),
                align: 'center',
                width: '1%',
                render: (rowData) => (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                        <Tooltip title={t('common.edit', 'Chỉnh sửa')} arrow>
                            <IconButton size="small" color="primary" onClick={(e) => handleOpenEdit(rowData, e)}>
                                <EditIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={t('common.delete', 'Xóa')} arrow>
                            <IconButton size="small" color="error" onClick={(e) => handleOpenDelete(rowData, e)}>
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </div>
                )
            });
        }

        return baseColumns;
    }, [isManager, t]);

    return (
        <div className="space-y-4 animate-fade-in">
            <Paper elevation={0} className="py-4 px-2 md:px-4 border border-border">
                <FormikProvider value={filterFormik}>
                    <ListToolbar
                        searchDraft={searchDraft}
                        onSearchDraftChange={setSearchDraft}
                        onSearch={handleSearch}
                        onReset={handleReset}
                        onAdd={isManager ? handleOpenAdd : null}
                        addLabel={t('announcement.add_btn', 'Ban hành thông báo')}
                        searchPlaceholder={t('announcement.search_placeholder', 'Tìm kiếm thông báo...')}
                        filter={{
                            open: filterOpen,
                            onToggle: setFilterOpen,
                            activeCount: activeFilterCount
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
                                <SelectInput
                                    label={t('announcement.fields.category', 'Phân loại danh mục')}
                                    name="category"
                                    options={categoryOptions}
                                    keyValue="value"
                                    displayvalue="displayValue"
                                    hideNullOption={true}
                                />
                            </Grid>
                            {isManager && (
                                <Grid item xs={12} sm={4}>
                                    <SelectInput
                                        label={t('announcement.fields.status', 'Trạng thái')}
                                        name="status"
                                        options={statusOptions}
                                        keyValue="value"
                                        displayvalue="displayValue"
                                        hideNullOption={true}
                                    />
                                </Grid>
                            )}
                        </Grid>
                    </FilterPanel>
                </FormikProvider>

                <Table
                    columns={columns}
                    data={announcementData?.content || []}
                    totalElements={announcementData?.totalElements || 0}
                    page={page}
                    pageSize={pageSize}
                    loading={isFetching}
                    handleChangePage={(e, p) => setPage(p)}
                    setRowsPerPage={(e) => setPageSize(parseInt(e.target.value, 10))}
                />
            </Paper>

            <Popup
                open={openViewDialog}
                onClosePopup={() => setOpenViewDialog(false)}
                title={selectedAnn ? selectedAnn.title : t('announcement.view_title', 'Chi tiết thông báo')}
                size="md"
                action={
                    <>
                        {selectedAnn?.attachments && (
                            <Button
                                variant="outlined"
                                color="primary"
                                startIcon={<DownloadIcon />}
                                href={selectedAnn.attachments}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {t('announcement.download_attachment', 'Tải tài liệu đính kèm')}
                            </Button>
                        )}
                        <Button onClick={() => setOpenViewDialog(false)} variant="contained" color="inherit">
                            {t('common.close', 'Đóng lại')}
                        </Button>
                    </>
                }
            >
                {selectedAnn && (
                    <Box className="space-y-4">
                        {selectedAnn.titleImageUrl && (
                            <Box
                                component="img"
                                src={selectedAnn.titleImageUrl}
                                alt={selectedAnn.title}
                                className="max-h-[280px] w-full rounded-xl border border-border object-cover"
                            />
                        )}

                        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/50 bg-muted/30 p-3 text-[12px] text-muted-foreground">
                            <div>
                                {t('announcement.fields.category', 'Danh mục')}: <span className={`rounded-lg px-2 py-0.5 text-[10px] font-bold ${getCategoryDetails(selectedAnn.category).chipClass}`}>
                                    {getCategoryDetails(selectedAnn.category).label}
                                </span>
                            </div>
                            {selectedAnn.code && (
                                <div>
                                    {t('announcement.fields.code', 'Mã thông báo')}: <span className="font-mono font-bold text-primary">{selectedAnn.code}</span>
                                </div>
                            )}
                            <div>
                                {t('announcement.fields.createdBy', 'Người ban hành')}: <span className="font-bold text-foreground">{selectedAnn.createdBy || 'Admin'}</span>
                            </div>
                            <div>
                                {t('announcement.fields.publishDate', 'Ngày ban hành')}: <span className="font-bold text-foreground">
                                    {selectedAnn.publishDate ? formatDate(selectedAnn.publishDate, 'dd/MM/yyyy, HH:mm') : formatDate(selectedAnn.createDate, 'dd/MM/yyyy, HH:mm')}
                                </span>
                            </div>
                        </div>

                        <Box
                            className="max-h-[450px] overflow-y-auto rounded-xl border border-border/60 bg-card p-4 md:p-6"
                            sx={{
                                '& img': { maxWidth: '100%', height: 'auto', borderRadius: '8px', my: 2 },
                                '& ul': { listStyleType: 'disc', pl: 3, my: 1.5 },
                                '& ol': { listStyleType: 'decimal', pl: 3, my: 1.5 },
                                '& h1': { fontSize: '1.4rem', fontWeight: '800', mt: 2, mb: 1 },
                                '& h2': { fontSize: '1.2rem', fontWeight: '700', mt: 2, mb: 1 },
                                '& h3': { fontSize: '1.1rem', fontWeight: '700', mt: 1.5, mb: 1 },
                                '& p': { lineHeight: 1.6, my: 1 },
                                '& table': { borderCollapse: 'collapse', width: '100%', my: 2 },
                                '& th, & td': { border: '1px solid var(--border)', p: 1, fontSize: '12px' },
                                '& th': { bgcolor: 'var(--muted)' }
                            }}
                            dangerouslySetInnerHTML={{ __html: selectedAnn.content }}
                        />
                    </Box>
                )}
            </Popup>

            <AnnouncementForm
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                isEdit={isEdit}
                announcement={selectedAnn}
            />

            <ConfirmationDialog
                open={openConfirmDelete}
                onConfirmDialogClose={() => setOpenConfirmDelete(false)}
                onYesClick={handleConfirmDelete}
                title={t('announcement.delete_title', 'Xác nhận xóa thông báo')}
                text={t('announcement.delete_confirm', 'Bạn có chắc chắn muốn xóa thông báo "{{title}}"? Hành động này không thể hoàn tác.', { title: selectedAnn?.title })}
                agree={t('common.confirm', 'Xác nhận xóa')}
                cancel={t('common.cancel', 'Hủy bỏ')}
            />
        </div>
    );
};

export default AnnouncementsPage;
