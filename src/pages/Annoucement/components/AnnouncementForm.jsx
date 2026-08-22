import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Grid,
    Box,
    Button,
    CircularProgress,
    Avatar,
    Typography,
    IconButton
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';

import { useFormik, FormikProvider } from 'formik';
import * as Yup from 'yup';
import { toast } from 'sonner';

import { getAllDepartments } from '../../../services/departmentService';
import { generateAnnouncementCode } from '../../../services/notificationService';
import { ANNOUNCEMENT_CATEGORIES, ANNOUNCEMENT_STATUS } from '../../../constants/notification';
import { uploadFile, uploadImage } from '../../../services/CloudinaryService';

import Popup from '../../../components/ui/Popup';
import Editor from '../../../components/ui/Editor';
import TextField from '../../../components/ui/TextField';
import SelectInput from '../../../components/ui/SelectInput';
import { useAddAnnouncement, useModifyAnnouncement } from '../api';

const AnnouncementForm = ({ open, onClose, isEdit, announcement }) => {
    const { t } = useTranslation();
    const addMutation = useAddAnnouncement();
    const modifyMutation = useModifyAnnouncement();

    const [departments, setDepartments] = useState([]);
    const [autoCode, setAutoCode] = useState('');
    const [saving, setSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isUploadingTitleImage, setIsUploadingTitleImage] = useState(false);

    const isImageUrl = (url) => {
        if (!url) return false;
        return url.match(/\.(jpeg|jpg|gif|png|webp)($|\?)/i) || url.includes('/image/upload/');
    };

    const getFileNameFromUrl = (url) => {
        if (!url) return '';
        const parts = url.split('/');
        const nameWithExt = parts[parts.length - 1];
        return decodeURIComponent(nameWithExt);
    };

    const handleUploadFile = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
            toast.error(t('announcement.message.file_too_large', 'Dung lượng file tối đa là 10MB'));
            return;
        }

        setIsUploading(true);
        try {
            const secureUrl = await uploadFile(file);
            formik.setFieldValue('attachments', secureUrl);
            toast.success(t('announcement.message.upload_success', 'Tải tệp đính kèm lên thành công!'));
        } catch (err) {
            console.error("Upload error:", err);
            toast.error(t('announcement.message.upload_failed', 'Lỗi khi tải tệp lên.'));
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemoveAttachment = () => {
        formik.setFieldValue('attachments', '');
    };

    const handleUploadTitleImage = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error(t('announcement.message.image_only', 'Vui lòng chọn tệp hình ảnh'));
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error(t('announcement.message.image_too_large', 'Dung lượng ảnh tối đa là 5MB'));
            return;
        }

        setIsUploadingTitleImage(true);
        try {
            const secureUrl = await uploadImage(file);
            formik.setFieldValue('titleImageUrl', secureUrl);
            toast.success(t('announcement.message.upload_title_image_success', 'Tải ảnh tiêu đề lên thành công!'));
        } catch (err) {
            console.error("Upload title image error:", err);
            toast.error(t('announcement.message.upload_failed', 'Lỗi khi tải tệp lên.'));
        } finally {
            setIsUploadingTitleImage(false);
            e.target.value = '';
        }
    };

    const handleRemoveTitleImage = () => {
        formik.setFieldValue('titleImageUrl', '');
    };

    // Load target departments for creator dropdown
    useEffect(() => {
        if (open) {
            getAllDepartments().then(res => {
                if (res && res.data) {
                    setDepartments(res.data);
                }
            }).catch(err => {
                console.error("Failed to load departments:", err);
            });
        }
    }, [open]);

    // Automatically generate announcement code when the form is opened for creation
    useEffect(() => {
        const fetchCode = async () => {
            if (open && !isEdit) {
                try {
                    const codeRes = await generateAnnouncementCode();
                    const codeVal = codeRes?.data || codeRes;
                    if (codeVal) {
                        setAutoCode(codeVal);
                    }
                } catch (err) {
                    console.error("Failed to generate announcement code", err);
                }
            } else if (!open) {
                setAutoCode('');
            }
        };
        fetchCode();
    }, [open, isEdit]);

    const categoryOptions = [
        { value: ANNOUNCEMENT_CATEGORIES.HOLIDAY, displayValue: t('announcement.categories.holiday', 'Lịch nghỉ lễ') },
        { value: ANNOUNCEMENT_CATEGORIES.EVENT, displayValue: t('announcement.categories.event', 'Sự kiện') },
        { value: ANNOUNCEMENT_CATEGORIES.POLICY, displayValue: t('announcement.categories.policy', 'Chính sách') },
        { value: ANNOUNCEMENT_CATEGORIES.GENERAL, displayValue: t('announcement.categories.general', 'Thông báo chung') }
    ];

    const statusOptions = [
        { value: ANNOUNCEMENT_STATUS.DRAFT, displayValue: t('announcement.status.draft', 'Bản nháp') },
        { value: ANNOUNCEMENT_STATUS.PUBLISHED, displayValue: t('announcement.status.published', 'Đã ban hành') }
    ];

    // Formik for Announcement form
    const validationSchema = Yup.object({
        title: Yup.string().trim().required(t('announcement.message.required_title', 'Tiêu đề không được để trống')),
        category: Yup.string().required(t('announcement.message.required_category', 'Phân loại danh mục là bắt buộc')),
        content: Yup.string().trim().required(t('announcement.message.required_content', 'Nội dung thông báo là bắt buộc'))
    });

    const formik = useFormik({
        initialValues: {
            code: autoCode || '',
            title: '',
            category: '',
            status: ANNOUNCEMENT_STATUS.PUBLISHED,
            content: '',
            titleImageUrl: '',
            attachments: '',
            targetDeptId: ''
        },
        validationSchema,
        onSubmit: async (values) => {
            setSaving(true);
            try {
                const payload = {
                    ...values,
                    targetDeptId: values.targetDeptId || null,
                    titleImageUrl: values.titleImageUrl || null,
                    attachments: values.attachments || null
                };

                if (isEdit && announcement) {
                    await modifyMutation.mutateAsync({ id: announcement.id, ...payload });
                } else {
                    await addMutation.mutateAsync(payload);
                }
                onClose();
            } catch (err) {
                console.error("Failed to save announcement:", err);
            } finally {
                setSaving(false);
            }
        }
    });

    // Reset form when dialog opens/closes or when switching edit mode/selected announcement or autoCode changes
    useEffect(() => {
        if (open) {
            if (isEdit && announcement) {
                formik.resetForm({
                    values: {
                        code: announcement.code || '',
                        title: announcement.title || '',
                        category: announcement.category || '',
                        status: announcement.status || ANNOUNCEMENT_STATUS.PUBLISHED,
                        content: announcement.content || '',
                        titleImageUrl: announcement.titleImageUrl || '',
                        attachments: announcement.attachments || '',
                        targetDeptId: announcement.targetDeptId || ''
                    }
                });
            } else {
                formik.resetForm({
                    values: {
                        code: autoCode || '',
                        title: '',
                        category: '',
                        status: ANNOUNCEMENT_STATUS.PUBLISHED,
                        content: '',
                        titleImageUrl: '',
                        attachments: '',
                        targetDeptId: ''
                    }
                });
            }
        }
    }, [open, isEdit, announcement, autoCode]);

    return (
        <Popup
            open={open}
            onClosePopup={onClose}
            title={isEdit ? t('announcement.edit_title', 'Cập nhật thông báo') : t('announcement.create_title', 'Ban hành thông báo mới')}
            size="md"
            action={
                <>
                    <Button onClick={onClose} color="inherit" disabled={saving}>
                        {t('common.cancel', 'Hủy bỏ')}
                    </Button>
                    <Button
                        onClick={formik.handleSubmit}
                        color="primary"
                        variant="contained"
                        disabled={saving}
                    >
                        {saving ? t('common.saving', 'Đang lưu...') : (isEdit ? t('common.save_changes', 'Lưu thay đổi') : t('announcement.add_btn', 'Ban hành'))}
                    </Button>
                </>
            }
        >
            <FormikProvider value={formik}>
                <Grid container spacing={2} className="pt-2">
                    <Grid item xs={12}>
                        <TextField
                            label={t('announcement.fields.title', 'Tiêu đề thông báo')}
                            name="title"
                            required
                            placeholder={t('announcement.fields.title_placeholder', 'VD: Thông báo nghỉ Tết Dương Lịch 2026')}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6} className="order-6 mb-4">
                        <Box className="w-full">
                            <label className="block text-sm font-semibold mb-1.5 text-muted-foreground">
                                {t('announcement.fields.titleImageUrl', 'Ảnh tiêu đề')}
                            </label>

                            <Box className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                {formik.values.titleImageUrl && (
                                    <Box className="flex min-w-0 flex-1 items-center gap-3 rounded-lg border border-border bg-card p-1">
                                        <Box
                                            component="img"
                                            src={formik.values.titleImageUrl}
                                            alt="Title image preview"
                                            className="h-11 w-[72px] rounded-md border border-border object-cover"
                                        />
                                        <Typography
                                            variant="body2"
                                            noWrap
                                            className="min-w-0 flex-1 font-mono text-[12px]"
                                        >
                                            {formik.values.titleImageUrl}
                                        </Typography>
                                        <IconButton size="small" color="error" onClick={handleRemoveTitleImage}>
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                )}

                                <Button
                                    component="label"
                                    variant="outlined"
                                    startIcon={isUploadingTitleImage ? <CircularProgress size={16} /> : <CloudUploadIcon />}
                                    disabled={isUploadingTitleImage}
                                    className="h-10 whitespace-nowrap normal-case"
                                >
                                    {isUploadingTitleImage ? t('common.uploading', 'Đang tải lên...') : t('announcement.upload_title_image_btn', 'Tải ảnh tiêu đề')}
                                    <input
                                        type="file"
                                        hidden
                                        onChange={handleUploadTitleImage}
                                        accept="image/*"
                                    />
                                </Button>
                            </Box>
                        </Box>
                    </Grid>

                    <Grid item xs={12} sm={6} className="order-2">
                        <SelectInput
                            label={t('announcement.fields.category', 'Phân loại danh mục')}
                            name="category"
                            options={categoryOptions}
                            keyValue="value"
                            displayvalue="displayValue"
                            required
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} className="order-3">
                        <TextField
                            label={t('announcement.fields.code', 'Mã thông báo')}
                            name="code"
                            disabled
                            required
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} className="order-5">
                        <SelectInput
                            label={t('announcement.fields.status', 'Trạng thái')}
                            name="status"
                            options={statusOptions}
                            keyValue="value"
                            displayvalue="displayValue"
                            hideNullOption
                            required
                        />
                    </Grid>

                    <Grid item xs={12} sm={6} className="order-4">
                        <SelectInput
                            label={t('announcement.fields.targetDept', 'Phòng ban nhận tin (Để trống gửi toàn công ty)')}
                            name="targetDeptId"
                            options={[
                                { id: '', displayName: t('common.all', 'Gửi toàn bộ công ty (Global)') },
                                ...departments
                            ]}
                            keyValue="id"
                            displayvalue="displayName"
                            hideNullOption
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} className="order-7">
                        <Box className="w-full">
                            <label className="block text-sm font-semibold mb-1.5 text-muted-foreground">
                                {t('announcement.fields.attachments', 'Tệp đính kèm')}
                            </label>

                            {formik.values.attachments ? (
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 2,
                                        p: 1,
                                        border: '1px solid',
                                        borderColor: 'hsl(var(--border))',
                                        borderRadius: '8px',
                                        height: 40,
                                        bgcolor: (theme) => theme.palette.mode === 'light' ? '#fcfcfc' : 'rgba(255,255,255,0.02)'
                                    }}
                                >
                                    {isImageUrl(formik.values.attachments) ? (
                                        <Box
                                            component="img"
                                            src={formik.values.attachments}
                                            alt="Attachment Preview"
                                            sx={{
                                                width: 28,
                                                height: 28,
                                                borderRadius: '4px',
                                                objectFit: 'cover',
                                                border: '1px solid',
                                                borderColor: 'hsl(var(--border))'
                                            }}
                                        />
                                    ) : (
                                        <Avatar
                                            variant="rounded"
                                            sx={{
                                                width: 28,
                                                height: 28,
                                                bgcolor: 'primary.light',
                                                color: 'primary.contrastText',
                                            }}
                                        >
                                            <InsertDriveFileIcon sx={{ fontSize: '16px' }} />
                                        </Avatar>
                                    )}

                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography
                                            variant="body2"
                                            noWrap
                                            sx={{
                                                fontWeight: 'medium',
                                                fontFamily: 'monospace',
                                                fontSize: '12px'
                                            }}
                                        >
                                            {getFileNameFromUrl(formik.values.attachments)}
                                        </Typography>
                                    </Box>

                                    <Box display="flex" gap={0.5}>
                                        <IconButton
                                            size="small"
                                            color="primary"
                                            href={formik.values.attachments}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <DownloadIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            color="error"
                                            onClick={handleRemoveAttachment}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                </Box>
                            ) : (
                                <Button
                                    component="label"
                                    variant="outlined"
                                    fullWidth
                                    startIcon={isUploading ? <CircularProgress size={16} /> : <CloudUploadIcon />}
                                    disabled={isUploading}
                                    sx={{
                                        height: 40,
                                        textTransform: 'none',
                                        color: 'text.secondary',
                                        fontSize: '13px',
                                        '&:hover': {
                                            borderColor: 'primary.main',
                                            bgcolor: (theme) => theme.palette.mode === 'light' ? 'rgba(0,0,0,0.01)' : 'rgba(255,255,255,0.01)'
                                        }
                                    }}
                                >
                                    {isUploading ? t('common.uploading', 'Đang tải lên...') : t('announcement.upload_btn', 'Tải lên hình ảnh hoặc tài liệu')}
                                    <input
                                        type="file"
                                        hidden
                                        onChange={handleUploadFile}
                                        accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                                    />
                                </Button>
                            )}
                        </Box>
                    </Grid>

                    <Grid item xs={12} className="order-8">
                        <Editor
                            label={t('announcement.fields.content', 'Nội dung chi tiết thông báo')}
                            name="content"
                            required
                            placeholder={t('announcement.fields.content_placeholder', 'Nhập nội dung văn bản chi tiết tại đây...')}
                        />
                    </Grid>
                </Grid>
            </FormikProvider>
        </Popup>
    );
};

export default AnnouncementForm;
