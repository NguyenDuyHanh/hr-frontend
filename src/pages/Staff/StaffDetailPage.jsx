import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Box, Paper, Typography, Button, Grid, CircularProgress, Avatar } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import AssignmentIcon from '@mui/icons-material/Assignment';
import HistoryIcon from '@mui/icons-material/History';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SecurityIcon from '@mui/icons-material/Security';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { toast } from 'sonner';

import TabComponent from '../../components/ui/Tab/TabComponent';
import StaffGeneralInfoForm from './components/StaffTabs/StaffGeneralInfoForm';
import StaffSalaryConfigForm from './components/StaffTabs/StaffSalaryConfigForm';
import StaffBankInfoForm from './components/StaffTabs/StaffBankInfoForm';
import { getStaffById } from '../../services/StaffService';

const StaffDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [staff, setStaff] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tabValue, setTabValue] = useState(0);

    const isEdit = location.state?.isEdit || false;
    const isView = location.state?.isView || !isEdit;

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
        toast.success('Lưu thông tin nhân viên thành công');
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
                        onClose={() => navigate('/staff/all')} 
                        onSaveSuccess={handleSaveSuccess} 
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
                        onClose={() => navigate('/staff/all')} 
                        onSaveSuccess={handleSaveSuccess} 
                    />
                </Box>
            )
        },
        /*
        {
            label: 'Hợp đồng lao động',
            icon: <AssignmentIcon />,
            content: (
                <Box p={4} mt={2} component={Paper} variant="outlined" className="text-center text-text-secondary">
                    <Typography variant="body1" className="italic">
                        Thông tin hợp đồng lao động đang được phát triển...
                    </Typography>
                </Box>
            )
        },
        {
            label: 'Quá trình làm việc',
            icon: <HistoryIcon />,
            content: (
                <Box p={4} mt={2} component={Paper} variant="outlined" className="text-center text-text-secondary">
                    <Typography variant="body1" className="italic">
                        Lịch sử quá trình làm việc đang được phát triển...
                    </Typography>
                </Box>
            )
        },
        {
            label: 'Khen thưởng / Kỷ luật',
            icon: <EmojiEventsIcon />,
            content: (
                <Box p={4} mt={2} component={Paper} variant="outlined" className="text-center text-text-secondary">
                    <Typography variant="body1" className="italic">
                        Lịch sử khen thưởng và kỷ luật đang được phát triển...
                    </Typography>
                </Box>
            )
        },
        {
            label: 'Bảo hiểm',
            icon: <SecurityIcon />,
            content: (
                <Box p={4} mt={2} component={Paper} variant="outlined" className="text-center text-text-secondary">
                    <Typography variant="body1" className="italic">
                        Thông tin bảo hiểm xã hội đang được phát triển...
                    </Typography>
                </Box>
            )
        },
        */
        {
            label: 'Lương & Phụ cấp',
            icon: <AttachMoneyIcon />,
            content: (
                <Box mt={2}>
                    <StaffSalaryConfigForm 
                        staffId={id} 
                        isView={isView}
                    />
                </Box>
            )
        }
    ];

    return (
        <Box className="space-y-4">
            {/* Header / Breadcrumb navigation */}
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

            {/* Profile Overview Card */}
            {/* <Paper elevation={0} className="p-6 border border-border">
                <Grid container spacing={3} alignItems="center">
                    <Grid item>
                        <Avatar 
                            sx={{ width: 80, height: 80, bgcolor: 'primary.light', fontSize: '2rem' }}
                        >
                            {staff?.displayName ? staff.displayName.charAt(0).toUpperCase() : 'N'}
                        </Avatar>
                    </Grid>
                    <Grid item xs={12} sm>
                        <Box className="space-y-1">
                            <Typography variant="h5" fontWeight="bold" className="text-text-primary">
                                {staff?.displayName || 'Nhân viên mới'}
                                {staff?.staffCode && (
                                    <Typography component="span" variant="subtitle1" color="text.secondary" className="ml-2 font-mono">
                                        ({staff.staffCode})
                                    </Typography>
                                )}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" className="flex flex-wrap gap-x-3 gap-y-1">
                                {staff?.departmentName && <span>Phòng ban: <strong>{staff.departmentName}</strong></span>}
                                {staff?.departmentName && staff?.positionName && <span>•</span>}
                                {staff?.positionName && <span>Chức danh: <strong>{staff.positionName}</strong></span>}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" className="flex flex-wrap gap-x-3 gap-y-1">
                                {staff?.email && <span>Email: {staff.email}</span>}
                                {staff?.email && staff?.phoneNumber && <span>•</span>}
                                {staff?.phoneNumber && <span>SĐT: {staff.phoneNumber}</span>}
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
            </Paper> */}

            {/* Tab view */}
            <Paper elevation={0} className="p-4 border border-border">
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
