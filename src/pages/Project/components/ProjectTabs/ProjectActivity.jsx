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
import { format } from 'date-fns';

import { 
    getProjectActivities, addProjectActivity, 
    updateProjectActivity, deleteProjectActivity,
    reorderProjectActivities
} from '../../../../services/projectService';

// Common Components
import Table from '../../../../components/ui/Table';
import ListToolbar from '../../../../components/ui/ListToolbar';
import Popup from '../../../../components/ui/Popup';
import TextField from '../../../../components/ui/TextField';
import DateTimePicker from '../../../../components/ui/DateTimePicker';
import ConfirmationDialog from '../../../../components/ui/ConfirmationDialog';

// Form Dialog Component using Formik and Popup
const ActivityFormDialog = ({ open, onClose, activityData, activitiesCount, onSave }) => {
    const initialValues = useMemo(() => ({
        id: activityData?.id || null,
        name: activityData?.name || '',
        code: activityData?.code || '',
        description: activityData?.description || '',
        displayOrder: activityData?.displayOrder !== undefined ? activityData.displayOrder : activitiesCount + 1,
        startTime: activityData?.startTime ? new Date(activityData.startTime) : null,
        endTime: activityData?.endTime ? new Date(activityData.endTime) : null,
    }), [activityData, activitiesCount]);

    const validationSchema = Yup.object({
        name: Yup.string().trim().required('Tên hoạt động không được để trống'),
    });

    const formik = useFormik({
        initialValues,
        enableReinitialize: true,
        validationSchema,
        onSubmit: (values) => {
            const payload = {
                ...values,
                startTime: values.startTime ? format(new Date(values.startTime), "yyyy-MM-dd'T'HH:mm:ss") : null,
                endTime: values.endTime ? format(new Date(values.endTime), "yyyy-MM-dd'T'HH:mm:ss") : null,
            };
            onSave(payload);
        }
    });

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
            title={activityData?.id ? "Sửa hoạt động" : "Thêm hoạt động mới"}
            size="sm"
            action={actions}
        >
            <FormikProvider value={formik}>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-x-4">
                    <div className="md:col-span-12">
                        <TextField
                            label="Tên hoạt động"
                            name="name"
                            required
                        />
                    </div>
                    <div className="md:col-span-6">
                        <TextField
                            label="Mã hoạt động"
                            name="code"
                        />
                    </div>
                    <div className="md:col-span-6">
                        <TextField
                            label="Thứ tự hiển thị"
                            name="displayOrder"
                            type="number"
                        />
                    </div>
                    <div className="md:col-span-12">
                        <TextField
                            label="Mô tả"
                            name="description"
                            multiline
                            rows={2}
                        />
                    </div>
                    <div className="md:col-span-6">
                        <DateTimePicker
                            label="Thời gian bắt đầu"
                            name="startTime"
                            notValueMillisecond={false}
                        />
                    </div>
                    <div className="md:col-span-6">
                        <DateTimePicker
                            label="Thời gian kết thúc"
                            name="endTime"
                            notValueMillisecond={true}
                        />
                    </div>
                </div>
            </FormikProvider>
        </Popup>
    );
};

const ProjectActivity = ({ projectId }) => {
    const [activities, setActivities] = useState([]);
    const [keyword, setKeyword] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogData, setDialogData] = useState(null);
    const [loading, setLoading] = useState(false);

    // Deletion states
    const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
    const [activityToDelete, setActivityToDelete] = useState(null);

    const loadActivities = async () => {
        setLoading(true);
        try {
            const res = await getProjectActivities(projectId, searchQuery);
            const sorted = (res?.data || []).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
            setActivities(sorted);
        } catch (err) {
            console.error(err);
            toast.error("Không thể tải danh sách hoạt động");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (projectId) {
            loadActivities();
        }
    }, [projectId, searchQuery]);

    const filteredActivities = activities;

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
            startTime: '',
            endTime: '',
            displayOrder: activities.length + 1
        });
        setOpenDialog(true);
    };

    const handleOpenEdit = (act) => {
        setDialogData({
            id: act.id,
            name: act.name || '',
            code: act.code || '',
            description: act.description || '',
            startTime: act.startTime || '',
            endTime: act.endTime || '',
            displayOrder: act.displayOrder || 0
        });
        setOpenDialog(true);
    };

    const handleDeleteClick = (id) => {
        setActivityToDelete(id);
        setOpenDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        if (!activityToDelete) return;
        try {
            await deleteProjectActivity(projectId, activityToDelete);
            toast.success("Xóa hoạt động thành công");
            loadActivities();
        } catch (err) {
            console.error(err);
            toast.error("Không thể xóa hoạt động");
        }
    };

    const handleSave = async (payload) => {
        try {
            if (payload.id) {
                await updateProjectActivity(projectId, payload.id, payload);
                toast.success("Cập nhật hoạt động thành công");
            } else {
                await addProjectActivity(projectId, payload);
                toast.success("Thêm hoạt động thành công");
            }
            setOpenDialog(false);
            loadActivities();
        } catch (err) {
            console.error(err);
            toast.error("Không thể lưu hoạt động");
        }
    };

    const handleMove = async (index, direction) => {
        const newActivities = [...activities];
        const targetIndex = index + direction;
        
        if (targetIndex < 0 || targetIndex >= activities.length) return;

        // Swap
        const temp = newActivities[index];
        newActivities[index] = newActivities[targetIndex];
        newActivities[targetIndex] = temp;

        const idsOrdered = newActivities.map(a => a.id);

        try {
            await reorderProjectActivities(projectId, idsOrdered);
            toast.success("Thay đổi thứ tự thành công");
            loadActivities();
        } catch (err) {
            console.error(err);
            toast.error("Không thể sắp xếp lại hoạt động");
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('vi-VN');
        } catch (e) {
            return dateStr;
        }
    };

    const columns = [
        {
            title: 'STT',
            field: 'stt',
            align: 'center',
            width: 60,
            render: (rowData) => {
                const idx = filteredActivities.findIndex(a => a.id === rowData.id);
                return idx + 1;
            }
        },
        { 
            title: 'Tên hoạt động', 
            field: 'name',
            align: 'center',
            render: (rowData) => (
                <div className="flex items-center justify-center space-x-2">
                    <span className="font-semibold">{rowData.name}</span>
                </div>
            )
        },
        {
            title: 'Thứ tự hiển thị',
            field: 'displayOrder',
            align: 'center',
            width: 120,
            render: (rowData) => rowData.displayOrder || 0
        },
        { 
            title: 'Ngày bắt đầu', 
            field: 'startTime',
            align: 'center',
            render: (rowData) => formatDate(rowData.startTime)
        },
        { 
            title: 'Ngày kết thúc', 
            field: 'endTime',
            align: 'center',
            render: (rowData) => formatDate(rowData.endTime)
        },
        { 
            title: 'Thao tác', 
            field: 'actions',
            width: 180,
            align: 'center',
            render: (rowData) => {
                const idx = activities.findIndex(a => a.id === rowData.id);
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
                                    disabled={idx === activities.length - 1}
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
                addLabel="Thêm hoạt động"
            />

            {loading ? (
                <div className="text-center py-6 text-gray-500">Đang tải danh sách hoạt động...</div>
            ) : (
                <Table 
                    columns={columns} 
                    data={filteredActivities} 
                    totalElements={filteredActivities.length}
                    page={1}
                    pageSize={filteredActivities.length || 10}
                    handleChangePage={() => {}}
                    setRowsPerPage={() => {}}
                    nonePagination={true}
                    showIndex={false}
                />
            )}

            {/* Dialog Form */}
            {openDialog && (
                <ActivityFormDialog
                    open={openDialog}
                    onClose={() => setOpenDialog(false)}
                    activityData={dialogData}
                    activitiesCount={activities.length}
                    onSave={handleSave}
                />
            )}

            {/* Confirmation Dialog */}
            <ConfirmationDialog
                open={openDeleteConfirm}
                onConfirmDialogClose={() => setOpenDeleteConfirm(false)}
                onYesClick={confirmDelete}
                title="Xác nhận xóa hoạt động"
                text="Bạn có chắc chắn muốn xóa hoạt động này? Thao tác này không thể hoàn tác."
                agree="Xác nhận"
                cancel="Hủy bỏ"
            />
        </div>
    );
};

export default ProjectActivity;
