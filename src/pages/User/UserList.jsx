import React, { useEffect, useState } from 'react';
import { Button, Grid, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import UiTable from '../../components/ui/UiTable';
import { getUsers, deleteUser } from '../../services/UserService';
import UserForm from './UserForm';

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [openForm, setOpenForm] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const loadData = async () => {
        try {
            const data = await getUsers();
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users', error);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleAdd = () => {
        setSelectedUser(null);
        setOpenForm(true);
    };

    const handleEdit = (user) => {
        setSelectedUser(user);
        setOpenForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await deleteUser(id);
                loadData();
            } catch (error) {
                console.error('Error deleting user', error);
            }
        }
    };

    const columns = [
        { title: 'Username', field: 'username' },
        { title: 'Email', field: 'email' },
        { title: 'Active', field: 'active', render: (rowData) => rowData.active ? 'Yes' : 'No' },
        { title: 'Linked Staff', render: (rowData) => rowData.staff ? rowData.staff.displayName : '' },
        {
            title: 'Actions',
            render: (rowData) => (
                <div>
                    <IconButton color="primary" onClick={() => handleEdit(rowData)}>
                        <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDelete(rowData.id)}>
                        <DeleteIcon />
                    </IconButton>
                </div>
            ),
        },
    ];

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h2>User Management</h2>
                <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleAdd}>
                    Add User
                </Button>
            </div>
            
            <UiTable 
                columns={columns} 
                data={users} 
            />

            {openForm && (
                <UserForm 
                    open={openForm} 
                    onClose={() => setOpenForm(false)} 
                    userData={selectedUser}
                    onSaveSuccess={() => {
                        setOpenForm(false);
                        loadData();
                    }}
                />
            )}
        </div>
    );
};

export default UserList;
