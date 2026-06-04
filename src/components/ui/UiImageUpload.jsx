import React, { memo, useState, useRef, useMemo } from 'react';
import { FastField, getIn } from 'formik';
import { Box, Button, CircularProgress, Typography, Avatar } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { toast } from 'sonner';
import { uploadImage } from '../../services/CloudinaryService';

/**
 * UiImageUpload - A premium, Formik-integrated image uploader component.
 * Allows choosing a local file, shows an immediate preview, uploads directly to Cloudinary,
 * and updates the Formik state with the absolute Cloudinary secure URL.
 */
const UiImageUpload = React.forwardRef((props, ref) => {
    return (
        <FastField
            name={props.name}
            shouldUpdate={shouldComponentUpdate}
        >
            {({ field, meta, form }) => (
                <MyImageUpload
                    {...props}
                    field={field}
                    meta={meta}
                    form={form}
                    ref={ref}
                />
            )}
        </FastField>
    );
});

const shouldComponentUpdate = (nextProps, currentProps) => {
    return (
        nextProps.name !== currentProps.name ||
        nextProps.label !== currentProps.label ||
        nextProps.disabled !== currentProps.disabled ||
        nextProps.required !== currentProps.required ||
        nextProps.formik.isSubmitting !== currentProps.formik.isSubmitting ||
        getIn(nextProps.formik.values, currentProps.name) !==
        getIn(currentProps.formik.values, currentProps.name) ||
        getIn(nextProps.formik.errors, currentProps.name) !==
        getIn(currentProps.formik.errors, currentProps.name) ||
        getIn(nextProps.formik.touched, currentProps.name) !==
        getIn(currentProps.formik.touched, currentProps.name)
    );
};

const MyImageUpload = React.forwardRef(({
    label,
    name,
    required = false,
    disabled = false,
    field,
    meta,
    form,
    ...otherProps
}, ref) => {
    const fileInputRef = useRef(null);
    const [isUploading, setIsUploading] = useState(false);
    const [localPreview, setLocalPreview] = useState(null);

    const value = field.value || '';
    const isError = !!(meta && meta.touched && meta.error);
    const helperText = isError ? meta.error : '';

    const handleSelectFile = () => {
        if (disabled || isUploading) return;
        if (fileInputRef.current) {
            fileInputRef.current.value = null;
            fileInputRef.current.click();
        }
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validation for file type & size (max 5MB)
        if (!file.type.startsWith('image/')) {
            toast.error('Vui lòng chọn tệp hình ảnh hợp lệ (PNG, JPG, JPEG, WEBP,...)');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Dung lượng ảnh tối đa là 5MB');
            return;
        }

        // Show local preview immediately via FileReader
        const reader = new FileReader();
        reader.onloadend = () => {
            setLocalPreview(reader.result);
        };
        reader.readAsDataURL(file);

        // Upload to Cloudinary
        setIsUploading(true);

        try {
            const secureUrl = await uploadImage(file);
            form.setFieldValue(name, secureUrl);
            form.setFieldTouched(name, true);
            toast.success('Tải ảnh đại diện thành công!');
        } catch (err) {
            console.error('Cloudinary upload error:', err);
            toast.error('Lỗi khi tải ảnh.');
            setLocalPreview(null);
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemoveImage = (e) => {
        e.stopPropagation();
        setLocalPreview(null);
        form.setFieldValue(name, '');
        form.setFieldTouched(name, true);
        if (fileInputRef.current) {
            fileInputRef.current.value = null;
        }
    };

    const displayImage = localPreview || value;

    return (
        <div className="w-full mb-4">
            {label && (
                <label className="block text-sm font-semibold mb-1.5 text-gray-700 dark:text-gray-400">
                    {label} {required && <span className="text-red-500 font-bold ml-1">*</span>}
                </label>
            )}

            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid',
                    borderColor: isError ? 'error.main' : 'hsl(var(--border))',
                    borderRadius: '8px',
                    padding: '16px',
                    backgroundColor: (theme) => theme.palette.mode === 'light' ? '#fafafa' : 'rgba(255,255,255,0.02)',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                        borderColor: 'primary.main',
                        backgroundColor: (theme) => theme.palette.mode === 'light' ? '#f5f5f5' : 'rgba(255,255,255,0.04)',
                    }
                }}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    style={{ display: 'none' }}
                    disabled={disabled || isUploading}
                />

                <Box
                    onClick={handleSelectFile}
                    sx={{
                        position: 'relative',
                        cursor: disabled || isUploading ? 'default' : 'pointer',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        width: '140px',
                        height: '140px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                        border: '2px solid #ffffff',
                        mb: 2,
                        '&:hover .avatar-overlay': {
                            opacity: disabled || isUploading ? 0 : 1,
                        }
                    }}
                >
                    {isUploading && (
                        <Box
                            sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: 'rgba(0,0,0,0.5)',
                                zIndex: 2
                            }}
                        >
                            <CircularProgress size={28} sx={{ color: '#fff' }} />
                        </Box>
                    )}

                    {displayImage ? (
                        <img
                            src={displayImage}
                            alt="Avatar Preview"
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                            }}
                        />
                    ) : (
                        <Avatar
                            sx={{
                                width: '100%',
                                height: '100%',
                                backgroundColor: (theme) => theme.palette.mode === 'light' ? '#e0f2fe' : 'rgba(14, 165, 233, 0.15)',
                                color: (theme) => theme.palette.mode === 'light' ? '#0284c7' : '#38bdf8',
                                fontSize: '60px'
                            }}
                        >
                            <PhotoCameraIcon fontSize="medium" />
                        </Avatar>
                    )}

                    {/* Premium Hover Overlay */}
                    {!disabled && !isUploading && (
                        <Box
                            className="avatar-overlay"
                            sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                                color: '#fff',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                opacity: 0,
                                transition: 'opacity 0.2s ease-in-out',
                                zIndex: 1
                            }}
                        >
                            <PhotoCameraIcon fontSize="small" />
                            <Typography variant="caption" sx={{ fontSize: '10px', mt: 0.5 }}>Đổi ảnh</Typography>
                        </Box>
                    )}
                </Box>

                {!disabled && (
                    <Box display="flex" gap={1}>
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={handleSelectFile}
                            startIcon={<CloudUploadIcon />}
                            disabled={isUploading}
                            sx={{ textTransform: 'none', fontSize: '12px' }}
                        >
                            Chọn ảnh
                        </Button>
                        {value && (
                            <Button
                                variant="outlined"
                                color="error"
                                size="small"
                                onClick={handleRemoveImage}
                                startIcon={<DeleteIcon />}
                                disabled={isUploading}
                                sx={{ textTransform: 'none', fontSize: '12px' }}
                            >
                                Xóa ảnh
                            </Button>
                        )}
                    </Box>
                )}

                {helperText && (
                    <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                        {helperText}
                    </Typography>
                )}
            </Box>
        </div>
    );
});

export default memo(UiImageUpload);
