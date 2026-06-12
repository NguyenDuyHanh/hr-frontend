import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, Grid, CircularProgress, Card, Divider, Button } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SecurityIcon from '@mui/icons-material/Security';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import BadgeIcon from '@mui/icons-material/Badge';
import BusinessIcon from '@mui/icons-material/Business';
import WorkIcon from '@mui/icons-material/Work';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import { toast } from 'sonner';

import useAuthStore from '@/store/useAuthStore';
import Avatar from '@/components/ui/Avatar';
import TabComponent from '@/components/ui/Tab/TabComponent';
import StaffGeneralInfoForm from './components/StaffTabs/StaffGeneralInfoForm';
import { getStaffById } from '@/services/StaffService';

const ProfilePage = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [staff, setStaff] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tabValue, setTabValue] = useState(0);


    const fetchStaffDetails = async (staffId) => {
        try {
            setLoading(true);
            const response = await getStaffById(staffId);
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
        if (user?.staffId) {
            fetchStaffDetails(user.staffId);
        } else {
            setLoading(false);
        }
    }, [user?.staffId]);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress color="primary" />
            </Box>
        );
    }

    if (!user?.staffId) {
        return (
            <Box className="max-w-2xl mx-auto mt-10">
                <Card className="p-8 border border-border shadow-soft text-center space-y-4">
                    <div className="w-16 h-16 bg-amber-50 dark:bg-amber-950/20 text-amber-500 rounded-full flex items-center justify-center mx-auto">
                        <InfoIcon sx={{ fontSize: 36 }} />
                    </div>
                    <Typography variant="h5" fontWeight="bold" className="text-foreground">
                        Tài khoản chưa liên kết nhân sự
                    </Typography>
                    <Typography variant="body2" className="text-muted-foreground max-w-md mx-auto">
                        Tài khoản đăng nhập của bạn (<strong>{user?.username}</strong>) hiện tại chưa được liên kết với bất kỳ hồ sơ nhân viên nào trong hệ thống. Vui lòng liên hệ với Quản trị viên nhân sự để liên kết tài khoản trước khi truy cập trang này.
                    </Typography>
                </Card>
            </Box>
        );
    }

    const tabList = [
        {
            label: 'Thông tin cá nhân',
            icon: <PersonIcon />,
            content: (
                <Box mt={2}>
                    <StaffGeneralInfoForm 
                        staffData={staff} 
                        isView={true}
                        hideActions={true}
                    />
                </Box>
            )
        },
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
            label: 'Bảo hiểm',
            icon: <SecurityIcon />,
            content: (
                <Box p={4} mt={2} component={Paper} variant="outlined" className="text-center text-text-secondary">
                    <Typography variant="body1" className="italic">
                        Thông tin bảo hiểm xã hội đang được phát triển...
                    </Typography>
                </Box>
            )
        }
    ];

    return (
        <Box className="pt-4 space-y-4">
            <Grid container spacing={2}>
                {/* Left side: Premium Quick Overview Card */}
                <Grid item xs={12} lg={3} className="mb-6 lg:mb-0">
                    <Card className="border border-border shadow-soft overflow-hidden h-full flex flex-col">
                        {/* Profile Header Background */}
                        <div className="h-24 bg-muted border-b border-border flex items-end justify-center relative">
                            {/* Avatar positioned overlapping the border */}
                            <div className="absolute -bottom-10 w-24 h-24 rounded-full border-4 border-card shadow-soft overflow-hidden bg-card flex items-center justify-center">
                                <Avatar 
                                    name={staff?.displayName || user?.fullName || user?.username} 
                                    imgPath={staff?.imagePath || user?.imagePath} 
                                    className="w-full h-full text-[2rem] font-bold" 
                                />
                            </div>
                        </div>

                        {/* Profile Details Content */}
                        <Box className="pt-14 px-6 pb-6 flex-grow flex flex-col items-center text-center space-y-4">
                            <Box className="space-y-1">
                                <Typography variant="h5" fontWeight="bold" className="text-foreground">
                                    {staff?.displayName || user?.fullName || 'Chưa cập nhật tên'}
                                </Typography>
                                
                                {staff?.staffCode ? (
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-secondary/10 dark:bg-secondary/20 text-secondary rounded-full text-xs font-bold font-mono tracking-wider">
                                        <BadgeIcon sx={{ fontSize: 14 }} />
                                        {staff.staffCode}
                                    </div>
                                ) : (
                                    <span className="text-xs text-muted-foreground italic">Mã nhân viên: Chưa có</span>
                                )}
                            </Box>

                            <Divider className="w-full border-border" />

                            {/* Job/Contact details list */}
                            <Box className="w-full space-y-3.5 text-left text-sm text-foreground">
                                {staff?.departmentName && (
                                    <Box className="flex items-center gap-3">
                                        <BusinessIcon className="text-primary/70 dark:text-primary/80" sx={{ fontSize: 18 }} />
                                        <div>
                                            <span className="text-xs text-muted-foreground block leading-none mb-0.5">Phòng ban</span>
                                            <span className="font-semibold">{staff.departmentName}</span>
                                        </div>
                                    </Box>
                                )}

                                {staff?.positionName && (
                                    <Box className="flex items-center gap-3">
                                        <WorkIcon className="text-primary/70 dark:text-primary/80" sx={{ fontSize: 18 }} />
                                        <div>
                                            <span className="text-xs text-muted-foreground block leading-none mb-0.5">Chức danh</span>
                                            <span className="font-semibold">{staff.positionName}</span>
                                        </div>
                                    </Box>
                                )}

                                <Box className="flex items-center gap-3">
                                    <EmailIcon className="text-primary/70 dark:text-primary/80" sx={{ fontSize: 18 }} />
                                    <div className="min-w-0 flex-1">
                                        <span className="text-xs text-muted-foreground block leading-none mb-0.5">Email</span>
                                        <span className="font-semibold block truncate" title={staff?.email || user?.email}>
                                            {staff?.email || user?.email || 'Chưa cập nhật email'}
                                        </span>
                                    </div>
                                </Box>

                                {(staff?.phoneNumber || user?.phoneNumber) && (
                                    <Box className="flex items-center gap-3">
                                        <PhoneIcon className="text-primary/70 dark:text-primary/80" sx={{ fontSize: 18 }} />
                                        <div>
                                            <span className="text-xs text-muted-foreground block leading-none mb-0.5">Số điện thoại</span>
                                            <span className="font-semibold">{staff?.phoneNumber || user?.phoneNumber}</span>
                                        </div>
                                    </Box>
                                )}

                                <Box className="flex items-center gap-3">
                                    <CheckCircleIcon className="text-online" sx={{ fontSize: 18 }} />
                                    <div>
                                        <span className="text-xs text-muted-foreground block leading-none mb-0.5">Trạng thái tài khoản</span>
                                        <span className="font-semibold text-online">Đang hoạt động</span>
                                    </div>
                                </Box>
                            </Box>
                        </Box>
                    </Card>
                </Grid>

                {/* Right side: Detailed Staff Info Tabs */}
                <Grid item xs={12} lg={9}>
                    <Paper elevation={0} className="px-4 border border-border rounded-xl shadow-soft">
                        <TabComponent 
                            tabList={tabList} 
                            value={tabValue} 
                            handleChange={handleTabChange} 
                        />
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default ProfilePage;
