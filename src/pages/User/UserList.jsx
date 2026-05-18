import React, { useEffect, useState } from 'react';
import { Button, Grid, IconButton, TextField, Paper } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import UiTable from '../../components/ui/UiTable';
import useUserStore from '../../store/userStore';
import UserForm from './UserForm';

const UserList = () => {

    const {
        users,
        totalElements,
        page,
        setPage,
        pageSize,
        setPageSize,
        keyword,
        setKeyword,
        selectedUser,
        setSelectedUser,
        openForm,
        setOpenForm,
        loadUsers,
        removeUser,
    } = useUserStore();

    useEffect(() => {
        loadUsers();
    }, [page, pageSize, keyword]);

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
                await removeUser(id);
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
            <Paper elevation={0} className="p-4 border border-gray-200" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <h2>User Management</h2>
                    <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleAdd}>
                        Add User
                    </Button>
                </div>

                {/* Search Area */}
                <Grid container spacing={1} alignItems="center" style={{ marginBottom: '20px' }}>
                    <Grid item xs={12} sm={8} md={8}>
                        <TextField 
                            fullWidth
                            size="small"
                            placeholder="Search by username or email..."
                            variant="outlined"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12} sm={4} md={4}>
                        <Button 
                            variant="contained" 
                            color="primary"
                            size="small" 
                            startIcon={<SearchIcon />} 
                            style={{ height: '32px', whiteSpace: 'nowrap' }}
                            onClick={() => loadUsers()}
                        >
                            Search
                        </Button>
                    </Grid>
                </Grid>
                
                <UiTable 
                    columns={columns} 
                    data={users} 
                    totalElements={totalElements}
                    page={page}
                    pageSize={pageSize}
                    handleChangePage={(e, p) => setPage(p)}
                    setRowsPerPage={(e) => setPageSize(parseInt(e.target.value, 10))}
                />
            </Paper>

            {openForm && (
                <UserForm 
                    open={openForm} 
                    onClose={() => setOpenForm(false)} 
                    userData={selectedUser}
                    onSaveSuccess={() => {
                        setOpenForm(false);
                    }}
                />
            )}
        </div>
    );
};

export default UserList;
