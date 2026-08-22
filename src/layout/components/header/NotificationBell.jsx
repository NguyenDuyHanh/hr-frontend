import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  IconButton, Badge, Popover, Box, Typography, Divider, 
  List, ListItem, ListItemText, ListItemIcon, Button, Chip, CircularProgress
} from '@mui/material';
import TabComponent from '@/components/ui/Tab/TabComponent';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CampaignIcon from '@mui/icons-material/Campaign';
import InfoIcon from '@mui/icons-material/Info';
import CircleIcon from '@mui/icons-material/Circle';
import DoneAllIcon from '@mui/icons-material/DoneAll';

import useNotificationStore from '@/store/useNotificationStore';
import { NOTIFICATION_TYPES } from '@/constants';
import { formatDate, formatTimeAgo } from '@/LocalFunction';

const getNotificationIcon = (type) => {
  switch (type) {
    case NOTIFICATION_TYPES.TASK:
      return <AssignmentIcon className="text-blue-500" sx={{ fontSize: 20 }} />;
    case NOTIFICATION_TYPES.LEAVE:
      return <EventIcon className="text-amber-500" sx={{ fontSize: 20 }} />;
    case NOTIFICATION_TYPES.TIMESHEET:
      return <AccessTimeIcon className="text-emerald-500" sx={{ fontSize: 20 }} />;
    case NOTIFICATION_TYPES.ANNOUNCEMENT:
      return <CampaignIcon className="text-purple-500" sx={{ fontSize: 20 }} />;
    default:
      return <InfoIcon className="text-gray-500" sx={{ fontSize: 20 }} />;
  }
};



const getTypeName = (type) => {
  switch (type) {
    case NOTIFICATION_TYPES.TASK:
      return 'Công việc';
    case NOTIFICATION_TYPES.LEAVE:
      return 'Nghỉ phép';
    case NOTIFICATION_TYPES.TIMESHEET:
      return 'Chấm công';
    case NOTIFICATION_TYPES.ANNOUNCEMENT:
      return 'Thông báo';
    default:
      return 'Khác';
  }
};

const NotificationBell = () => {
  const navigate = useNavigate();
  const { 
    notifications, 
    unreadCount, 
    loading,
    fetchNotifications, 
    fetchUnreadCount, 
    markRead, 
    markAllRead,
    activeFilter,
    setActiveFilter
  } = useNotificationStore();

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const filterMap = ['ALL', NOTIFICATION_TYPES.TASK, NOTIFICATION_TYPES.LEAVE, NOTIFICATION_TYPES.ANNOUNCEMENT];
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setActiveFilter(filterMap[newValue]);
  };

  const [cachedCounts, setCachedCounts] = useState({
    [NOTIFICATION_TYPES.TASK]: 0,
    [NOTIFICATION_TYPES.LEAVE]: 0,
    [NOTIFICATION_TYPES.ANNOUNCEMENT]: 0
  });

  useEffect(() => {
    if (activeFilter === 'ALL') {
      const taskCount = notifications.filter(n => n.notificationType === NOTIFICATION_TYPES.TASK && !n.isRead).length;
      const leaveCount = notifications.filter(n => n.notificationType === NOTIFICATION_TYPES.LEAVE && !n.isRead).length;
      const annCount = notifications.filter(n => n.notificationType === NOTIFICATION_TYPES.ANNOUNCEMENT && !n.isRead).length;
      setCachedCounts({
        [NOTIFICATION_TYPES.TASK]: taskCount,
        [NOTIFICATION_TYPES.LEAVE]: leaveCount,
        [NOTIFICATION_TYPES.ANNOUNCEMENT]: annCount
      });
    }
  }, [notifications, activeFilter]);

  const getFilterUnreadCount = (filterType) => {
    if (filterType === 'ALL') return unreadCount;
    return cachedCounts[filterType] || 0;
  };

  useEffect(() => {
    // Lấy số lượng unread ban đầu
    fetchUnreadCount();
  }, []);

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
    setTabValue(0);
    setActiveFilter('ALL');
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleItemClick = (noti) => {
    handleClose();
    if (!noti.isRead) {
      markRead(noti.id);
    }
    if (noti.linkUrl) {
      // Đảm bảo có dấu gạch chéo đầu đường dẫn
      const url = noti.linkUrl.startsWith('/') ? noti.linkUrl : `/${noti.linkUrl}`;
      navigate(url);
    }
  };

  const notificationsContent = (
    <Box className="overflow-y-auto" sx={{ maxHeight: '350px', minHeight: '180px' }}>
      {loading ? (
        <Box className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <CircularProgress size={32} className="text-primary mb-3" />
          <Typography variant="body2" className="text-muted-foreground text-xs font-medium">
            Đang tải thông báo...
          </Typography>
        </Box>
      ) : notifications.length === 0 ? (
        <Box className="flex flex-col items-center justify-center py-10 px-4 text-center">
          <NotificationsIcon className="text-muted-foreground/30 mb-2" sx={{ fontSize: 48 }} />
          <Typography variant="body2" className="text-muted-foreground font-medium text-xs">
            {activeFilter === 'ALL'
              ? 'Không có thông báo mới nào'
              : activeFilter === NOTIFICATION_TYPES.TASK
                ? 'Không có công việc được giao nào'
                : activeFilter === NOTIFICATION_TYPES.LEAVE
                  ? 'Không có thông báo nghỉ phép nào'
                  : 'Không có thông báo công ty nào'}
          </Typography>
        </Box>
      ) : (
        <List className="p-0">
          {notifications.map((noti) => (
            <React.Fragment key={noti.id}>
              <ListItem 
                onClick={() => handleItemClick(noti)}
                className={`px-4 py-3 flex items-start gap-3 transition-colors duration-150 cursor-pointer hover:bg-muted/40 ${
                  noti.isRead 
                    ? 'bg-transparent' 
                    : 'bg-primary/5 dark:bg-primary/5'
                }`}
              >
                <ListItemIcon className="min-w-0 mt-0.5">
                  <Box className="w-9 h-9 rounded-xl flex items-center justify-center bg-muted">
                    {getNotificationIcon(noti.notificationType)}
                  </Box>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box className="flex items-center justify-between mb-0.5 gap-2">
                      <Typography className={`text-[13px] leading-snug truncate ${noti.isRead ? 'font-medium text-foreground/80' : 'font-bold text-foreground'}`}>
                        {getTypeName(noti.notificationType)} • {noti.title}
                      </Typography>
                      {!noti.isRead && (
                        <CircleIcon className="text-primary flex-shrink-0" sx={{ fontSize: 8 }} />
                      )}
                    </Box>
                  }
                  secondary={
                    <Box className="space-y-1">
                      <Typography className="text-[12px] text-muted-foreground line-clamp-2 leading-normal">
                        {noti.content}
                      </Typography>
                      <div className='flex items-center justify-between'>
                        <span className='text-[12px] text-muted-foreground/75 font-medium'>{formatDate(noti.modifyDate, 'dd/MM/yyyy, HH:mm')}</span>
                        <span className='text-[12px] text-muted-foreground/75 font-medium'>{formatTimeAgo(noti.modifyDate || noti.createDate)}</span>
                      </div>
                    </Box>
                  }
                  disableTypography
                />
              </ListItem>
              <Divider className="border-border" />
            </React.Fragment>
          ))}
        </List>
      )}
    </Box>
  );

  const tabList = [
    {
      label: (
        <Box className="flex items-center gap-1.5 font-bold">
          Tất cả
          {unreadCount > 0 && (
            <span className="flex items-center justify-center h-4 text-[10px] px-1 rounded-full bg-red-500 text-white">
              {unreadCount}
            </span>
          )}
        </Box>
      ),
      content: notificationsContent
    },
    {
      label: (
        <Box className="flex items-center gap-1.5 font-bold">
          Công việc
          {getFilterUnreadCount(NOTIFICATION_TYPES.TASK) > 0 && (
            <span className="flex items-center justify-center h-4 text-[10px] px-1 rounded-full bg-red-500 text-white">
              {getFilterUnreadCount(NOTIFICATION_TYPES.TASK)}
            </span>
          )}
        </Box>
      ),
      content: notificationsContent
    },
    {
      label: (
        <Box className="flex items-center gap-1.5 font-bold">
          Nghỉ phép
          {getFilterUnreadCount(NOTIFICATION_TYPES.LEAVE) > 0 && (
            <span className="flex items-center justify-center h-4 text-[10px] px-1 rounded-full bg-red-500 text-white">
              {getFilterUnreadCount(NOTIFICATION_TYPES.LEAVE)}
            </span>
          )}
        </Box>
      ),
      content: notificationsContent
    },
    {
      label: (
        <Box className="flex items-center gap-1.5 font-bold">
          Thông báo công ty
          {getFilterUnreadCount(NOTIFICATION_TYPES.ANNOUNCEMENT) > 0 && (
            <span className="flex items-center justify-center h-4 text-[10px] px-1 rounded-full bg-red-500 text-white">
              {getFilterUnreadCount(NOTIFICATION_TYPES.ANNOUNCEMENT)}
            </span>
          )}
        </Box>
      ),
      content: notificationsContent
    }
  ];

  return (
    <>
      <div 
        onClick={handleOpen}
        className="flex items-center justify-center bg-background hover:bg-primary/10 dark:hover:bg-primary/20 text-primary w-9 h-[32px] rounded-md cursor-pointer relative border border-border active:scale-95"
      >
        <Badge 
          badgeContent={unreadCount} 
          color="error" 
          max={99}
          sx={{
            '& .MuiBadge-badge': {
              fontSize: '10px',
              height: '16px',
              minWidth: '16px',
              padding: '0 4px',
              top: -4,
              right: -4,
            }
          }}
        >
          <NotificationsIcon sx={{ fontSize: '18px' }} />
        </Badge>
      </div>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        disablePortal
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          className: "shadow-2xl mt-2 rounded-xl border border-border bg-popover/90 backdrop-blur-md text-popover-foreground overflow-hidden",
          sx: {
            maxHeight: '500px',
            width: { xs: '360px', sm: '500px' },
          }
        }}
      >
        {/* Header Popover */}
        <Box className="flex items-center justify-between px-4 py-3">
          <Typography className="font-bold text-[18px] text-foreground flex items-center gap-1.5">
            Thông báo
          </Typography>
          {unreadCount > 0 && (
            <Button 
              size="small" 
              onClick={markAllRead} 
              startIcon={<DoneAllIcon sx={{ fontSize: 14 }} />}
              className="text-[12px] font-semibold text-primary capitalize hover:bg-primary/5 rounded-lg px-2"
            >
              Đọc tất cả
            </Button>
          )}
        </Box>
        <Divider className="border-border" />

        <TabComponent
          tabList={tabList}
          value={tabValue}
          handleChange={handleTabChange}
          hideIcon={true}
          scrollButtons={false}
        />

        {/* Footer Popover (Option) */}
        {notifications.length > 0 && (
          <Box className="p-2 text-center bg-muted/20 border-t border-border">
            <Button 
              fullWidth 
              size="small" 
              onClick={() => {
                handleClose();
                navigate('/notifications');
              }}
              className="text-xs font-semibold text-primary pt-1 pb-2 rounded-lg"
            >
              Xem toàn bộ thông báo
            </Button>
          </Box>
        )}
      </Popover>
    </>
  );
};

export default NotificationBell;
