import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Box, Paper, Typography, Button, Grid, Avatar } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { toast } from 'sonner';

import useAuthStore from '../../store/useAuthStore';

import TabComponent from '../../components/ui/Tab/TabComponent';
import StaffGeneralInfoForm from './components/StaffTabs/StaffGeneralInfoForm';
import StaffSalaryConfigForm from './components/StaffTabs/StaffSalaryConfigForm';
import StaffBankInfoForm from './components/StaffTabs/StaffBankInfoForm';
import StaffCertificateTab from './components/StaffTabs/StaffCertificateTab';
import { getStaffById } from '../../services/StaffService';

const StaffDetailPage = () => {
    const { id: paramId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [staff, setStaff] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tabValue, setTabValue] = useState(0);

    const user = useAuthStore((state) => state.user);
    const isProfile = location.pathname === '/profile';
    const id = isProfile ? user?.staffId : paramId;

    const isEdit = isProfile ? false : (location.state?.isEdit || false);
    const isView = isProfile ? true : (location.state?.isView || !isEdit);

    const fetchStaffDetails = async () => {
        try {
            setLoading(true);
            const response = await getStaffById(id);
            if (response && response.data) {
                setStaff(response.data);
            } else {
                setStaff(response || null);
            }
        } catch (error) {
            console.error('Failed to fetch staff details:', error);
            toast.error('Không thể tải thông tin nhân viên');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id && id !== 'new') {
            fetchStaffDetails();
        } else {
            setLoading(false);
        }
    }, [id]);

    const handleSaveSuccess = () => {
        fetchStaffDetails();
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const tabList = [
        {
            label: 'Thông tin cá nhân',
            icon: <PersonIcon />,
            content: (
                <Box mt={2}>
                    <StaffGeneralInfoForm 
                        staffData={staff} 
                        isView={isView}
                        onClose={() => navigate(isProfile ? '/home' : '/staff/all')} 
                        onSaveSuccess={handleSaveSuccess} 
                    />
                </Box>
            )
        },
        {
            label: 'Bằng cấp & Chứng chỉ',
            icon: <SchoolIcon />,
            content: (
                <Box mt={2}>
                    <StaffCertificateTab 
                        staffId={id} 
                        isView={isView}
                    />
                </Box>
            )
        },
        {
            label: 'Tài khoản ngân hàng',
            icon: <AccountBalanceIcon />,
            content: (
                <Box mt={2}>
                    <StaffBankInfoForm 
                        staffData={staff} 
                        isView={isView}
                        onClose={() => navigate(isProfile ? '/home' : '/staff/all')} 
                        onSaveSuccess={handleSaveSuccess} 
                    />
                </Box>
            )
        },
        {
            label: 'Lương & Phụ cấp',
            icon: <AttachMoneyIcon />,
            content: (
                <Box mt={2}>
                    <StaffSalaryConfigForm 
                        staffId={id} 
                        isView={true}
                    />
                </Box>
            )
        }
    ];

    if (!loading && isProfile && !id) {
        return (
            <Box p={4} textAlign="center" className="text-text-secondary">
                <Typography variant="h6" color="error" gutterBottom>
                    Không tìm thấy hồ sơ nhân sự
                </Typography>
                <Typography variant="body1">
                    Tài khoản của bạn chưa được liên kết với hồ sơ nhân viên nào trong hệ thống.
                </Typography>
                <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={() => navigate('/home')}
                    sx={{ mt: 2, textTransform: 'none' }}
                >
                    Quay lại trang chủ
                </Button>
            </Box>
        );
    }

    return (
        <Box className="space-y-4">
            {/* Header / Breadcrumb navigation */}
            {!isProfile ? (
                <Box display="flex" alignItems="center" gap={1}>
                    <Button
                        variant="text"
                        size="small"
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate('/staff/all')}
                        sx={{ textTransform: 'none', color: 'text.secondary' }}
                    >
                        Danh sách nhân viên
                    </Button>
                </Box>
            ) : (
                <Typography variant="h5" fontWeight="bold" className="text-text-primary px-1">
                    Trang cá nhân
                </Typography>
            )}

            {/* Main Content Tabs */}
            <Paper elevation={0} className='px-4 border border-border'>
                <TabComponent 
                    tabList={tabList} 
                    value={tabValue} 
                    handleChange={handleTabChange} 
                />
            </Paper>
        </Box>
    );
};

export default StaffDetailPage;
