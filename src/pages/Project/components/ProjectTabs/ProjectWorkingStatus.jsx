import React, { useEffect, useState, useMemo } from 'react';
import { IconButton, Tooltip, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { toast } from 'sonner';
import { useFormik, FormikProvider } from 'formik';
import * as Yup from 'yup';

import { 
    getProjectWorkingStatuses, addProjectWorkingStatus, 
    updateProjectWorkingStatus, deleteProjectWorkingStatus, 
    reorderProjectWorkingStatuses 
} from '../../../../services/projectService';

// Common Components
import Table from '../../../../components/ui/Table';
import ListToolbar from '../../../../components/ui/ListToolbar';
import Popup from '../../../../components/ui/Popup';
import TextField from '../../../../components/ui/TextField';
import ConfirmationDialog from '../../../../components/ui/ConfirmationDialog';

// Form Dialog Component using Formik and Popup
const WorkingStatusFormDialog = ({ open, onClose, statusData, statusesCount, onSave }) => {
    const initialValues = useMemo(() => ({
        id: statusData?.id || null,
        name: statusData?.name || '',
        code: statusData?.code || '',
        description: statusData?.description || '',
        color: statusData?.color || '#1976d2',
        displayOrder: statusData?.displayOrder !== undefined ? statusData.displayOrder : statusesCount + 1,
    }), [statusData, statusesCount]);

    const validationSchema = Yup.object({
        name: Yup.string().trim().required('Tên trạng thái không được để trống'),
        code: Yup.string().trim().required('Mã trạng thái không được để trống'),
    });

    const formik = useFormik({
        initialValues,
        enableReinitialize: true,
        validationSchema,
        onSubmit: (values) => {
            onSave(values);
        }
    });

    const colors = [
        '#1976d2', '#2e7d32', '#d32f2f', '#ed6c02', 
        '#9c27b0', '#0288d1', '#757575', '#009688'
    ];

    const actions = (
        <>
            <Button onClick={onClose} variant="outlined" color="inherit" sx={{ textTransform: 'none' }}>
                Hủy
            </Button>
            <Button onClick={formik.handleSubmit} color="primary" variant="contained" sx={{ textTransform: 'none', ml: 1 }}>
                Lưu lại
            </Button>
        </>
    );

    return (
        <Popup
            open={open}
            onClosePopup={onClose}
            title={statusData?.id ? "Sửa trạng thái" : "Thêm trạng thái mới"}
            size="sm"
            action={actions}
        >
            <FormikProvider value={formik}>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-x-4">
                    <div className="md:col-span-12 mb-3">
                        <TextField
                            label="Tên trạng thái"
                            name="name"
                            required
                        />
                    </div>
                    <div className="md:col-span-12 mb-3">
                        <TextField
                            label="Mã trạng thái"
                            name="code"
                            required
                        />
                    </div>
                    <div className="md:col-span-12 mb-3">
                        <TextField
                            label="Mô tả"
                            name="description"
                            multiline
                            rows={2}
                        />
                    </div>
                    <div className="md:col-span-12">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Chọn màu sắc đại diện
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {colors.map(c => (
                                <div 
                                    key={c}
                                    onClick={() => formik.setFieldValue('color', c)}
                                    className={`w-8 h-8 rounded-full cursor-pointer transition-transform border ${formik.values.color === c ? 'scale-110 border-black ring-2 ring-gray-300' : 'border-gray-200'}`}
                                    style={{ backgroundColor: c }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </FormikProvider>
        </Popup>
    );
};

const ProjectWorkingStatus = ({ projectId }) => {
    const [statuses, setStatuses] = useState([]);
    const [keyword, setKeyword] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogData, setDialogData] = useState(null);
    const [loading, setLoading] = useState(false);

    // Deletion states
    const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
    const [statusToDelete, setStatusToDelete] = useState(null);

    const loadStatuses = async () => {
        setLoading(true);
        try {
            const res = await getProjectWorkingStatuses(projectId, searchQuery);
            const sorted = (res?.data || []).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
            setStatuses(sorted);
        } catch (err) {
            console.error(err);
            toast.error("Không thể tải danh sách trạng thái");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (projectId) {
            loadStatuses();
        }
    }, [projectId, searchQuery]);

    const filteredStatuses = statuses;

    const handleSearch = () => {
        setSearchQuery(keyword);
    };

    const handleReset = () => {
        setKeyword('');
        setSearchQuery('');
    };

    const handleOpenAdd = () => {
        setDialogData({
            id: null,
            name: '',
            code: '',
            description: '',
            color: '#1976d2',
            displayOrder: statuses.length + 1
        });
        setOpenDialog(true);
    };

    const handleOpenEdit = (status) => {
        setDialogData({
            id: status.id,
            name: status.name || '',
            code: status.code || '',
            description: status.description || '',
            color: status.color || '#1976d2',
            displayOrder: status.displayOrder || 0
        });
        setOpenDialog(true);
    };

    const handleDeleteClick = (id) => {
        setStatusToDelete(id);
        setOpenDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        if (!statusToDelete) return;
        try {
            await deleteProjectWorkingStatus(projectId, statusToDelete);
            toast.success("Xóa trạng thái công việc thành công");
            loadStatuses();
        } catch (err) {
            console.error(err);
            toast.error("Không thể xóa trạng thái");
        }
    };

    const handleSave = async (payload) => {
        try {
            if (payload.id) {
                await updateProjectWorkingStatus(projectId, payload.id, payload);
                toast.success("Cập nhật trạng thái thành công");
            } else {
                await addProjectWorkingStatus(projectId, payload);
                toast.success("Thêm trạng thái thành công");
            }
            setOpenDialog(false);
            loadStatuses();
        } catch (err) {
            console.error(err);
            toast.error("Không thể lưu trạng thái");
        }
    };

    const handleMove = async (index, direction) => {
        const newStatuses = [...statuses];
        const targetIndex = index + direction;
        
        if (targetIndex < 0 || targetIndex >= statuses.length) return;

        // Swap
        const temp = newStatuses[index];
        newStatuses[index] = newStatuses[targetIndex];
        newStatuses[targetIndex] = temp;

        const idsOrdered = newStatuses.map(s => s.id);

        try {
            await reorderProjectWorkingStatuses(projectId, idsOrdered);
            toast.success("Thay đổi thứ tự thành công");
            loadStatuses();
        } catch (err) {
            console.error(err);
            toast.error("Không thể sắp xếp lại trạng thái");
        }
    };

    const columns = [
        {
            title: 'STT',
            field: 'stt',
            align: 'center',
            width: 60,
            render: (rowData) => {
                const idx = filteredStatuses.findIndex(s => s.id === rowData.id);
                return idx + 1;
            }
        },
        { 
            title: 'Mã', 
            field: 'code',
            align: 'center',
            width: 150,
            render: (rowData) => <span className="font-bold">{rowData.code}</span>
        },
        { 
            title: 'Tên trạng thái', 
            field: 'name',
            align: 'center',
            width: 200,
            render: (rowData) => (
                <div className="flex items-center justify-center space-x-2">
                    <div 
                        className="w-3.5 h-3.5 rounded-full border border-gray-200"
                        style={{ backgroundColor: rowData.color || '#9e9e9e' }}
                    />
                    <span className="font-semibold">{rowData.name}</span>
                </div>
            )
        },
        { 
            title: 'Mô tả', 
            field: 'description',
            align: 'center',
            render: (rowData) => rowData.description || '—'
        },
        { 
            title: 'Thao tác', 
            field: 'actions',
            width: 180,
            align: 'center',
            render: (rowData) => {
                const idx = statuses.findIndex(s => s.id === rowData.id);
                return (
                    <div className="flex items-center justify-center space-x-1">
                        <Tooltip title="Di chuyển lên">
                            <span>
                                <IconButton 
                                    size="small" 
                                    disabled={idx === 0}
                                    onClick={() => handleMove(idx, -1)}
                                >
                                    <ArrowUpwardIcon fontSize="inherit" />
                                </IconButton>
                            </span>
                        </Tooltip>
                        <Tooltip title="Di chuyển xuống">
                            <span>
                                <IconButton 
                                    size="small" 
                                    disabled={idx === statuses.length - 1}
                                    onClick={() => handleMove(idx, 1)}
                                >
                                    <ArrowDownwardIcon fontSize="inherit" />
                                </IconButton>
                            </span>
                        </Tooltip>
                        <Tooltip title="Sửa">
                            <IconButton size="small" color="info" onClick={() => handleOpenEdit(rowData)}>
                                <EditIcon fontSize="inherit" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Xóa">
                            <IconButton size="small" color="error" onClick={() => handleDeleteClick(rowData.id)}>
                                <DeleteIcon fontSize="inherit" />
                            </IconButton>
                        </Tooltip>
                    </div>
                );
            }
        }
    ];

    return (
        <div className="pt-2 pb-4 bg-background">
            <ListToolbar
                searchDraft={keyword}
                onSearchDraftChange={setKeyword}
                onSearch={handleSearch}
                onReset={handleReset}
                onAdd={handleOpenAdd}
                addLabel="Thêm trạng thái"
            />

            {loading ? (
                <div className="text-center py-6 text-gray-500">Đang tải danh sách trạng thái...</div>
            ) : (
                <Table 
                    columns={columns} 
                    data={filteredStatuses} 
                    totalElements={filteredStatuses.length}
                    page={1}
                    pageSize={filteredStatuses.length || 10}
                    handleChangePage={() => {}}
                    setRowsPerPage={() => {}}
                    nonePagination={true}
                    showIndex={false}
                />
            )}

            {/* Dialog Form */}
            {openDialog && (
                <WorkingStatusFormDialog
                    open={openDialog}
                    onClose={() => setOpenDialog(false)}
                    statusData={dialogData}
                    statusesCount={statuses.length}
                    onSave={handleSave}
                />
            )}

            {/* Confirmation Dialog */}
            <ConfirmationDialog
                open={openDeleteConfirm}
                onConfirmDialogClose={() => setOpenDeleteConfirm(false)}
                onYesClick={confirmDelete}
                title="Xác nhận xóa trạng thái"
                text="Bạn có chắc chắn muốn xóa trạng thái công việc này? Thao tác này không thể hoàn tác."
                agree="Xác nhận"
                cancel="Hủy bỏ"
            />
        </div>
    );
};

export default ProjectWorkingStatus;
