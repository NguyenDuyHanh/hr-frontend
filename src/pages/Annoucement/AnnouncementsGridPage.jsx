import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Grid,
    Box,
    Button,
    Chip,
    Typography,
    Paper,
    Card,
    CardContent,
    Pagination,
    Skeleton
} from '@mui/material';
import CampaignIcon from '@mui/icons-material/Campaign';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import InfoIcon from '@mui/icons-material/Info';
import DownloadIcon from '@mui/icons-material/Download';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import ScheduleIcon from '@mui/icons-material/Schedule';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';

import { useFormik, FormikProvider } from 'formik';
import useAnnouncementStore from '../../store/useAnnouncementStore';
import { markAsRead } from '../../services/notificationService';
import useNotificationStore from '../../store/useNotificationStore';
import { ANNOUNCEMENT_CATEGORIES } from '../../constants/notification';
import { formatDate } from '../../LocalFunction';

import ListToolbar from '../../components/ui/ListToolbar';
import FilterPanel from '../../components/ui/FilterPanel';
import SelectInput from '../../components/ui/SelectInput';
import Popup from '../../components/ui/Popup';
import { useAnnouncements } from './api';

const AnnouncementsGridPage = () => {
    const { t } = useTranslation();

    const {
        page,
        setPage,
        pageSize,
        keyword,
        setKeyword,
        filterCategory,
        setFilterCategory,
        resetStore
    } = useAnnouncementStore();

    // Query
    const { data: announcementData, isFetching: loading } = useAnnouncements({
        pageIndex: page,
        pageSize,
        keyword: keyword || null,
        category: filterCategory || null,
        status: 'PUBLISHED'
    });

    const announcements = announcementData?.content || [];
    const totalElements = announcementData?.totalElements || 0;

    const { fetchUnreadCount } = useNotificationStore();

    const [selectedAnn, setSelectedAnn] = useState(null);
    const [openViewDialog, setOpenViewDialog] = useState(false);
    const [filterOpen, setFilterOpen] = useState(false);
    const [searchDraft, setSearchDraft] = useState(keyword);

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

    const getCategoryDetails = (cat) => {
        switch (cat) {
            case ANNOUNCEMENT_CATEGORIES.HOLIDAY:
                return {
                    label: t('announcement.categories.holiday', 'Lịch nghỉ lễ'),
                    color: 'warning',
                    icon: <CalendarTodayIcon sx={{ fontSize: 14 }} />,
                    chipClass: 'bg-orange-50 text-orange-700 border border-orange-200/50 dark:bg-orange-950/20 dark:text-orange-400 dark:border-orange-900/50'
                };
            case ANNOUNCEMENT_CATEGORIES.EVENT:
                return {
                    label: t('announcement.categories.event', 'Sự kiện'),
                    color: 'secondary',
                    icon: <CampaignIcon sx={{ fontSize: 14 }} />,
                    chipClass: 'bg-purple-50 text-purple-700 border border-purple-200/50 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-900/50'
                };
            case ANNOUNCEMENT_CATEGORIES.POLICY:
                return {
                    label: t('announcement.categories.policy', 'Chính sách'),
                    color: 'info',
                    icon: <BookmarkIcon sx={{ fontSize: 14 }} />,
                    chipClass: 'bg-blue-50 text-blue-700 border border-blue-200/50 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/50'
                };
            default:
                return {
                    label: t('announcement.categories.general', 'Thông báo chung'),
                    color: 'default',
                    icon: <InfoIcon sx={{ fontSize: 14 }} />,
                    chipClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200/50 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50'
                };
        }
    };

    const filterFormik = useFormik({
        initialValues: {
            category: filterCategory
        },
        enableReinitialize: true,
        onSubmit: (values) => {
            setFilterCategory(values.category);
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
        filterFormik.resetForm({ values: { category: '' } });
        setFilterCategory('');
        setPage(1);
    };

    const activeFilterCount = useMemo(() => {
        return filterCategory ? 1 : 0;
    }, [filterCategory]);

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

    const stripHtml = (html) => {
        if (!html) return '';
        const rawText = html.replaceAll(/<[^>]*>/g, " ").trim();
        return rawText.replaceAll(/\s+/g, " ");
    };

    const totalPages = Math.ceil(totalElements / pageSize) || 1;

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="pt-4 px-4 border border-border rounded-sm">
                <FormikProvider value={filterFormik}>
                    <ListToolbar
                        searchDraft={searchDraft}
                        onSearchDraftChange={setSearchDraft}
                        onSearch={handleSearch}
                        onReset={handleReset}
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
                            <Grid item xs={12} sm={6}>
                                <SelectInput
                                    label={t('announcement.fields.category', 'Phân loại danh mục')}
                                    name="category"
                                    options={categoryOptions}
                                    keyValue="value"
                                    displayvalue="displayValue"
                                    hideNullOption={true}
                                />
                            </Grid>
                        </Grid>
                    </FilterPanel>
                </FormikProvider>
            </div>

            {loading ? (
                <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
                    {Array.from({ length: pageSize || 6 }).map((_, index) => (
                        <Card key={index} elevation={0} className="border border-border rounded-xl bg-card overflow-hidden h-[240px]">
                            <CardContent className="p-5 h-full flex flex-col justify-between space-y-4">
                                <div className="flex items-center justify-between">
                                    <Skeleton variant="rounded" width={110} height={24} sx={{ borderRadius: '12px' }} animation="wave" />
                                    <Skeleton variant="text" width={65} height={16} animation="wave" />
                                </div>
                                <div className="space-y-2">
                                    <Skeleton variant="text" width="90%" height={22} animation="wave" />
                                    <Skeleton variant="text" width="60%" height={22} animation="wave" />
                                </div>
                                <div className="space-y-1.5 flex-1 pt-1">
                                    <Skeleton variant="text" width="100%" height={14} animation="wave" />
                                    <Skeleton variant="text" width="95%" height={14} animation="wave" />
                                    <Skeleton variant="text" width="70%" height={14} animation="wave" />
                                </div>
                                <div className="border-t border-border/50 pt-3 flex items-center justify-between">
                                    <Skeleton variant="text" width={80} height={16} animation="wave" />
                                    <Skeleton variant="text" width={110} height={16} animation="wave" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : announcements.length === 0 ? (
                <Paper elevation={0} className="py-6 border border-border rounded-xs flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-4">
                        <InfoIcon className="w-6 h-6" color="primary" />
                    </div>
                    <Typography variant="subtitle1" className="font-semibold text-foreground mb-1">
                        Không tìm thấy thông báo nào
                    </Typography>
                    <Typography variant="body2" className="text-muted-foreground max-w-sm">
                        Chưa có thông báo nào được đăng hoặc bộ lọc hiện tại của bạn không có kết quả phù hợp.
                    </Typography>
                </Paper>
            ) : (
                <div className="mt-4">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
                        {announcements.map((ann) => {
                            const details = getCategoryDetails(ann.category);
                            const textExcerpt = stripHtml(ann.content);
                            const previewText = textExcerpt.length > 140 ? textExcerpt.substring(0, 137) + '...' : textExcerpt;

                            return (
                                <div key={ann.id}>
                                    <Card 
                                        elevation={0}
                                        onClick={() => handleViewDetail(ann)}
                                        className="h-full flex flex-col border border-border hover:border-primary/40 hover:shadow-md cursor-pointer rounded-xl group overflow-hidden bg-card"
                                    >
                                        <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase ${details.chipClass}`}>
                                                    {details.icon}
                                                    <span>{details.label}</span>
                                                </div>
                                                {ann.code && (
                                                    <Typography className="text-[11px] font-medium text-primary tracking-wider uppercase">
                                                        {ann.code}
                                                    </Typography>
                                                )}
                                                {ann.isRead === false && (
                                                    <Chip 
                                                        label={t('announcement.new', 'MỚI')} 
                                                        size="small" 
                                                        color="error" 
                                                        icon={<NewReleasesIcon style={{ fontSize: 10, color: '#fff' }} />}
                                                        sx={{ 
                                                            height: 18, 
                                                            fontSize: 9, 
                                                            fontWeight: 800,
                                                            '& .MuiChip-label': { px: 0.8 },
                                                            '& .MuiChip-icon': { ml: 0.5, mr: -0.3, color: '#fff' }
                                                        }} 
                                                    />
                                                )}
                                            </div>

                                            <div className="space-y-1.5">
                                                <Typography 
                                                    variant="h6" 
                                                    className="font-bold text-[15px] leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-2"
                                                >
                                                    {ann.title}
                                                </Typography>
                                            </div>

                                            <Typography variant="body2" className="text-muted-foreground/90 text-[13px] leading-relaxed line-clamp-3 flex-1">
                                                {previewText}
                                            </Typography>

                                            <div className="border-t border-border/50 pt-3 flex items-center justify-between text-[12px] text-muted-foreground">
                                                <div className="flex items-center gap-1.5">
                                                    <PersonOutlineIcon sx={{ fontSize: 16 }} className="text-muted-foreground/60" />
                                                    <span>{ann.createdBy || 'Admin'}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <ScheduleIcon sx={{ fontSize: 14 }} className="text-muted-foreground/60" />
                                                    <span>
                                                        {ann.publishDate ? formatDate(ann.publishDate, 'dd/MM/yyyy, HH:mm') : formatDate(ann.createDate, 'dd/MM/yyyy, HH:mm')}
                                                    </span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            );
                        })}
                    </div>

                    {totalPages > 1 && (
                        <div className="flex justify-center pt-4">
                            <Pagination 
                                count={totalPages} 
                                page={page} 
                                onChange={(e, p) => setPage(p)} 
                                color="primary" 
                                size="medium"
                                showFirstButton
                                showLastButton
                            />
                        </div>
                    )}
                </div>
            )}

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
                            <div className="flex items-center gap-1.5">
                                {t('announcement.fields.category', 'Danh mục')}: <span className={`rounded-lg px-2 py-0.5 text-[10px] font-bold ${getCategoryDetails(selectedAnn.category).chipClass}`}>
                                    {getCategoryDetails(selectedAnn.category).label}
                                </span>
                            </div>
                            {selectedAnn.code && (
                                <div>
                                    {t('announcement.fields.code', 'Mã thông báo')}: <span className="font-bold text-primary">{selectedAnn.code}</span>
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
        </div>
    );
};

export default AnnouncementsGridPage;
