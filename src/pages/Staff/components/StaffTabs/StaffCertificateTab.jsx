import React, { useState } from 'react';
import { Box, Button, Typography, Chip, Paper, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SchoolIcon from '@mui/icons-material/School';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import Table from '../../../../components/ui/Table';
import ConfirmationDialog from '../../../../components/ui/ConfirmationDialog';
import StaffCertificateFormDialog from './StaffCertificateFormDialog';
import { useStaffCertificates, useSaveStaffCertificate, useDeleteStaffCertificate } from '../../api';
import { DegreeGradeOptions, DegreeLevelOptions, QUALIFICATION_TYPE } from '../../../../constants';

const StaffCertificateTab = ({ staffId, isView = false }) => {
    const [filterType, setFilterType] = useState('ALL'); // ALL, DEGREE, CERTIFICATE
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedCert, setSelectedCert] = useState(null);
    const [deleteId, setDeleteId] = useState(null);

    // TanStack Query: Fetch certificates filtered by type directly from API
    const { data: certificates = [], isLoading } = useStaffCertificates(staffId, filterType);

    // TanStack Query mutations
    const saveMutation = useSaveStaffCertificate();
    const deleteMutation = useDeleteStaffCertificate();

    const handleAdd = () => {
        setSelectedCert(null);
        setOpenDialog(true);
    };

    const handleEdit = (cert) => {
        setSelectedCert(cert);
        setOpenDialog(true);
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        deleteMutation.mutate(deleteId, {
            onSuccess: () => setDeleteId(null),
        });
    };

    const handleSave = async (dto) => {
        saveMutation.mutate({ ...dto, staffId }, {
            onSuccess: () => setOpenDialog(false),
        });
    };

    const columns = [
        {
            field: 'type',
            title: 'Loại',
            align: 'center',
            minWidth: 140,
            render: (row) => (
                <Chip
                    icon={row.type === QUALIFICATION_TYPE.DEGREE ? <SchoolIcon /> : <WorkspacePremiumIcon />}
                    label={row.type === QUALIFICATION_TYPE.DEGREE ? 'Bằng cấp' : 'Chứng chỉ'}
                    color={row.type === QUALIFICATION_TYPE.DEGREE ? 'primary' : 'secondary'}
                    size="small"
                    variant="outlined"
                />
            )
        },
        {
            field: 'certificateName',
            title: 'Tên bằng / Chứng chỉ',
            align: 'center',
            minWidth: 200,
            render: (row) => (
                <Box>
                    <Typography variant="body2" fontWeight={600}>
                        {row.certificateName}
                    </Typography>
                </Box>
            )
        },
        {
            field: 'institution',
            title: 'Nơi cấp / Trường',
            minWidth: 180
        },
        {
            field: 'majorOrCredential',
            title: 'Chuyên ngành',
            align: 'center',
            minWidth: 160,
            render: (row) => row.type === QUALIFICATION_TYPE.DEGREE ? row.major : row.credentialId
        },
        {
            field: 'issueDate',
            title: 'Ngày cấp',
            align: 'center',
            minWidth: 120,
            render: (row) => row.issueDate || '—'
        },
        {
            field: 'expiryDate',
            title: 'Ngày hết hạn',
            minWidth: 120,
            render: (row) => row.type === QUALIFICATION_TYPE.CERTIFICATE ? (row.expiryDate || 'Vô hạn') : '—'
        },
        {
            field: 'grade',
            title: 'Xếp loại / Điểm',
            minWidth: 120,
            render: (row) => {
                if (!row.grade) return '—';
                const found = DegreeGradeOptions.find(o => o.value === row.grade);
                return found ? found.name : row.grade;
            }
        },
        {
            field: 'actions',
            title: 'Thao tác',
            minWidth: 120,
            align: 'center',
            render: (row) => !isView && (
                <Box>
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
                <Box display="flex" gap={1}>
                    <Chip
                        label="Tất cả"
                        clickable
                        color={filterType === 'ALL' ? 'primary' : 'default'}
                        onClick={() => setFilterType('ALL')}
                    />
                    <Chip
                        label="Bằng cấp"
                        clickable
                        color={filterType === QUALIFICATION_TYPE.DEGREE ? 'primary' : 'default'}
                        onClick={() => setFilterType(QUALIFICATION_TYPE.DEGREE)}
                    />
                    <Chip
                        label="Chứng chỉ"
                        clickable
                        color={filterType === QUALIFICATION_TYPE.CERTIFICATE ? 'primary' : 'default'}
                        onClick={() => setFilterType(QUALIFICATION_TYPE.CERTIFICATE)}
                    />
                </Box>
                {!isView && (
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        size="small"
                        onClick={handleAdd}
                        sx={{ textTransform: 'none' }}
                    >
                        Thêm mới
                    </Button>
                )}
            </Box>

            <Table
                columns={columns}
                data={certificates}
                loading={isLoading}
                emptyText="Chưa có thông tin bằng cấp hoặc chứng chỉ"
                nonePagination={true}
            />

            {openDialog && (
                <StaffCertificateFormDialog
                    open={openDialog}
                    onClose={() => setOpenDialog(false)}
                    certData={selectedCert}
                    onSave={handleSave}
                />
            )}

            {!!deleteId && (
                <ConfirmationDialog
                    open={!!deleteId}
                    onClose={() => setDeleteId(null)}
                    onConfirm={handleDelete}
                    title="Xác nhận xóa"
                    message="Bạn có chắc chắn muốn xóa thông tin bằng cấp / chứng chỉ này không?"
                />
            )}
        </Paper>
    );
};

export default StaffCertificateTab;
