import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, FormControlLabel, Checkbox } from '@mui/material';
import UiTextField from '../../components/ui/UiTextField';
import { saveUser } from '../../services/UserService';
import { getStaffs } from '../../services/StaffService';
import UiSelectInput from '../../components/ui/UiSelectInput';
import useUserStore from '../../store/userStore';

const UserForm = ({ open, onClose, userData, onSaveSuccess }) => {
    const { addUser, modifyUser } = useUserStore();

    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: '',
        active: true,
        staff: null,
    });
    
    const [staffList, setStaffList] = useState([]);

    useEffect(() => {
        if (userData) {
            setFormData(userData);
        }
        fetchStaffs();
    }, [userData]);

    const fetchStaffs = async () => {
        try {
            const response = await getStaffs();
            // response is ApiResponse, response.data is the list of active staff
            const staffs = response?.data || [];
            const options = staffs.map(staff => ({
                value: staff.id,
                label: staff.displayName + ' (' + staff.staffCode + ')',
                original: staff
            }));
            setStaffList(options);
        } catch (error) {
            console.error('Failed to load staffs', error);
        }
    }

    const handleChange = (e) => {
        const { name, value, checked, type } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: type === 'checkbox' ? checked : value 
        }));
    };

    const handleStaffChange = (selectedOption) => {
        setFormData(prev => ({ ...prev, staff: selectedOption ? selectedOption.original : null }));
    }

    const handleSave = async () => {
        try {
            if (userData?.id) {
                await modifyUser(userData.id, formData);
            } else {
                await addUser(formData);
            }
            if (onSaveSuccess) onSaveSuccess();
        } catch (error) {
            console.error('Error saving user', error);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{userData ? 'Edit User' : 'Add User'}</DialogTitle>
            <DialogContent dividers>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <UiTextField 
                            label="Username" 
                            name="username" 
                            value={formData.username} 
                            onChange={handleChange} 
                            fullWidth 
                        />
                    </Grid>
                    {!userData && (
                        <Grid item xs={12}>
                            <UiTextField 
                                label="Password" 
                                name="password" 
                                type="password"
                                value={formData.password} 
                                onChange={handleChange} 
                                fullWidth 
                            />
                        </Grid>
                    )}
                    <Grid item xs={12}>
                        <UiTextField 
                            label="Email" 
                            name="email" 
                            value={formData.email} 
                            onChange={handleChange} 
                            fullWidth 
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <FormControlLabel
                            control={
                                <Checkbox 
                                    checked={formData.active} 
                                    onChange={handleChange} 
                                    name="active" 
                                />
                            }
                            label="Active"
                        />
                    </Grid>
                    {/* Add Staff Linkage Component */}
                    <Grid item xs={12}>
                         {/* Replace with UiPagingAutocomplete if available */}
                         <UiSelectInput 
                             label="Linked Staff" 
                             options={staffList} 
                             value={formData.staff ? formData.staff.id : ''} 
                             onChange={(e) => {
                                 const selectedId = e.target.value;
                                 const staff = staffList.find(s => s.value === selectedId)?.original || null;
                                 handleStaffChange({ original: staff });
                             }}
                         />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="inherit">Cancel</Button>
                <Button onClick={handleSave} color="primary" variant="contained">Save</Button>
            </DialogActions>
        </Dialog>
    );
};

export default UserForm;
