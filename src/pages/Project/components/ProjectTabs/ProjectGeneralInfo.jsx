import React, { useMemo } from 'react';
import { 
    Paper, 
    Typography, 
    Box, 
    Grid, 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow, 
    IconButton,
    Button 
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import PeopleIcon from '@mui/icons-material/People';
import SaveIcon from '@mui/icons-material/Save';
import { FormikProvider, useFormik } from 'formik';
import * as Yup from 'yup';
import { format } from 'date-fns';
import { toast } from 'sonner';

import { saveProject } from '../../../../services/projectService';
import useProjectStore from '../../../../store/useProjectStore';
import { pagingStaffs } from '../../../../services/StaffService';
import TextField from '../../../../components/ui/TextField';
import DateTimePicker from '../../../../components/ui/DateTimePicker';
import CheckBox from '../../../../components/ui/CheckBox';
import PagingAutocomplete from '../../../../components/ui/PagingAutocomplete';
import SelectInputV2 from '../../../../components/ui/SelectInput';
import { ProjectRoleOptions } from '../../../../constants';

const validationSchema = Yup.object({
    name: Yup.string().required('Tên dự án là bắt buộc'),
    code: Yup.string().required('Mã dự án là bắt buộc'),
});

const ProjectGeneralInfo = ({ isViewMode = false, onSaved }) => {
    const project = useProjectStore((state) => state.selectedProject);
    const initialValues = useMemo(() => ({
        name: project?.name || '',
        code: project?.code || '',
        description: project?.description || '',
        startDate: project?.startDate ? new Date(project.startDate) : null,
        endDate: project?.endDate ? new Date(project.endDate) : null,
        isFinished: project?.isFinished || false,
        staffs: project?.staffs || [],
        selectedStaffForAdd: project?.staffs ? project.staffs.map(ps => ({
            id: ps.staffId,
            staffCode: ps.staffCode,
            displayName: ps.displayName,
            email: ps.email
        })) : [],
    }), [project]);

    const formik = useFormik({
        initialValues,
        enableReinitialize: true,
        validationSchema,
        onSubmit: async (values, { setSubmitting }) => {
            const submitValues = {
                id: project?.id,
                name: values.name,
                code: values.code,
                description: values.description,
                startDate: values.startDate ? format(new Date(values.startDate), 'yyyy-MM-dd') : null,
                endDate: values.endDate ? format(new Date(values.endDate), 'yyyy-MM-dd') : null,
                isFinished: values.isFinished,
                staffs: values.staffs.map(m => ({
                    staffId: m.staffId,
                    projectRole: m.projectRole || 'MEMBER',
                    joinedDate: m.joinedDate ? (typeof m.joinedDate === 'string' ? m.joinedDate : format(new Date(m.joinedDate), 'yyyy-MM-dd')) : format(new Date(), 'yyyy-MM-dd')
                }))
            };

            try {
                await saveProject(submitValues);
                toast.success("Cập nhật dự án thành công!");
                if (onSaved) onSaved();
            } catch (err) {
                console.error(err);
                toast.error("Không thể lưu thay đổi");
            } finally {
                setSubmitting(false);
            }
        },
    });

    const handleSelectedStaffChange = (selectedStaffs) => {
        const currentStaffs = formik.values.staffs || [];
        const checkedStaffs = selectedStaffs || [];
        
        // 1. Filter out staffs that are no longer selected
        const updatedStaffs = currentStaffs.filter(m => 
            checkedStaffs.some(s => s.id === m.staffId)
        );

        // 2. Add new selected staff
        checkedStaffs.forEach(staff => {
            const exists = updatedStaffs.some(m => m.staffId === staff.id);
            if (!exists) {
                updatedStaffs.push({
                    staffId: staff.id,
                    staffCode: staff.staffCode,
                    displayName: staff.displayName,
                    email: staff.email,
                    projectRole: 'MEMBER',
                    joinedDate: new Date().toISOString().split('T')[0]
                });
            }
        });

        formik.setFieldValue('staffs', updatedStaffs);
        formik.setFieldValue('selectedStaffForAdd', checkedStaffs);
    };

    const handleRemoveMemberInForm = (index) => {
        const updatedStaffs = [...formik.values.staffs];
        const removedStaff = updatedStaffs[index];
        updatedStaffs.splice(index, 1);
        formik.setFieldValue('staffs', updatedStaffs);

        // Also remove from selectedStaffForAdd so it unchecks in the Autocomplete dropdown
        const updatedSelected = (formik.values.selectedStaffForAdd || []).filter(s => s.id !== removedStaff.staffId);
        formik.setFieldValue('selectedStaffForAdd', updatedSelected);
    };

    return (
        <FormikProvider value={formik}>
            <Box mt={2}>
                <Grid container spacing={2} mt={3}>
                    {/* Row 1: Code and Name */}
                    <Grid item xs={12} sm={6}>
                        <TextField 
                            label="Mã dự án" 
                            name="code" 
                            required
                            disabled={isViewMode}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField 
                            label="Tên dự án" 
                            name="name" 
                            required
                            disabled={isViewMode}
                        />
                    </Grid>

                    {/* Row 2: Start Date and End Date */}
                    <Grid item xs={12} sm={6}>
                        <DateTimePicker 
                            label="Ngày bắt đầu" 
                            name="startDate" 
                            notValueMillisecond={true}
                            disabled={isViewMode}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <DateTimePicker 
                            label="Ngày kết thúc" 
                            name="endDate" 
                            notValueMillisecond={true}
                            disabled={isViewMode}
                        />
                    </Grid>

                    {/* Row 5: PagingAutocomplete */}
                    <Grid item xs={12}>
                        <PagingAutocomplete
                            multiple
                            name="selectedStaffForAdd"
                            label="Nhân viên thực hiện"
                            api={pagingStaffs}
                            getOptionLabel={(option) => option ? `${option.displayName || ''} (${option.staffCode || ''})` : ''}
                            onChange={(event, selectedOptions) => handleSelectedStaffChange(selectedOptions)}
                            className="mb-2"
                            disabled={isViewMode}
                        />
                    </Grid>

                    {/* Row 6: List of Members */}
                    <Grid item xs={12}>
                        <Box className="space-y-3 mt-4">
                            <Typography className="flex items-center gap-2 text-muted-foreground font-bold text-sm uppercase tracking-wider pb-2">
                                <PeopleIcon fontSize="small" />
                                <span>DANH SÁCH THÀNH VIÊN DỰ ÁN ({formik.values.staffs.length})</span>
                            </Typography>

                            <TableContainer component={Paper} className="border border-border max-h-[400px] overflow-auto shadow-none">
                                <Table 
                                    size="small" 
                                    stickyHeader
                                    className="border-collapse [&_td]:border [&_td]:border-border [&_th]:border [&_th]:border-border"
                                >
                                    <TableHead>
                                        <TableRow>
                                            <TableCell className="font-bold text-center">Mã NV</TableCell>
                                            <TableCell className="font-bold text-center">Họ và tên</TableCell>
                                            <TableCell className="font-bold text-center" style={{ width: 160 }}>Vai trò</TableCell>
                                            {!isViewMode && (
                                                <TableCell className="font-bold text-center">Hành động</TableCell>
                                            )}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {formik.values.staffs.map((m, index) => (
                                            <TableRow key={m.staffId || index} hover>
                                                <TableCell className="text-center">{m.staffCode}</TableCell>
                                                <TableCell className="text-center">{m.displayName}</TableCell>
                                                <TableCell className="text-center">
                                                    <SelectInputV2
                                                        name={`staffs[${index}].projectRole`}
                                                        options={ProjectRoleOptions}
                                                        keyValue="value"
                                                        displayvalue="label"
                                                        size="small"
                                                        hideNullOption
                                                        disabled={isViewMode}
                                                        sx={{ 
                                                            '& .MuiOutlinedInput-root': { height: 32, fontSize: '13px' },
                                                            '& .MuiInputBase-root': { height: 32, fontSize: '13px' }
                                                        }}
                                                    />
                                                </TableCell>
                                                {!isViewMode && (
                                                    <TableCell align="center">
                                                        <IconButton 
                                                            size="small" 
                                                            color="error" 
                                                            onClick={() => handleRemoveMemberInForm(index)}
                                                        >
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </TableCell>
                                                )}
                                            </TableRow>
                                        ))}
                                        {formik.values.staffs.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={isViewMode ? 3 : 4} align="center" className="text-muted-foreground py-6">
                                                    Chưa có thành viên nào được gán vào dự án.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    </Grid>

                    {/* Row 3: Description */}
                    <Grid item xs={12} className="mt-4">
                        <TextField 
                            label="Mô tả" 
                            name="description" 
                            multiline
                            rows={3}
                            disabled={isViewMode}
                        />
                    </Grid>

                    {/* Row 4: Status Checkbox */}
                    <Grid item xs={12}>
                        <Box className="pt-1 pb-2">
                            <CheckBox 
                                label="Đã kết thúc dự án" 
                                name="isFinished"
                                alignCenter={false}
                                disabled={isViewMode}
                            />
                        </Box>
                    </Grid>

                    {/* Save button */}
                    {!isViewMode && (
                        <Grid item xs={12}>
                            <Box className="flex justify-end pt-2 pb-2">
                                <Button 
                                    variant="contained" 
                                    color="primary" 
                                    startIcon={<SaveIcon />}
                                    onClick={formik.handleSubmit}
                                    disabled={formik.isSubmitting}
                                >
                                    {formik.isSubmitting ? 'Đang lưu...' : 'Lưu'}
                                </Button>
                            </Box>
                        </Grid>
                    )}
                </Grid>
            </Box>
        </FormikProvider>
    );
};

export default ProjectGeneralInfo;
