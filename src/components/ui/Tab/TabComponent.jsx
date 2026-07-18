import React, { memo } from 'react';
import { Box, Tabs, Tab, Typography } from "@mui/material";

function a11yProps(index) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

function TabPanel({ children, value, index, ...other }) {
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box p={0}>
                    <Typography component="div">{children}</Typography>
                </Box>
            )}
        </div>
    );
}

function TabComponent({
    tabList,
    handleChange,
    value,
    className = '',
    hideIcon = false,
    ...props
}) {
    return (
        <Box sx={{ width: '100%' }}>
            <Tabs
                value={value}
                onChange={handleChange}
                aria-label="tabs"
                textColor="primary"
                indicatorColor="primary"
                variant="scrollable"
                scrollButtons="auto"
                allowScrollButtonsMobile
                className={`Mui-tabRootCustom non-maxWidth mb-0 ${!tabList?.every(i => i?.icon) ? 'bottom-0' : ''
                    }`}
                {...props}
            >
                {tabList?.map((tab, index) => (
                    <Tab
                        key={index}
                        label={tab.label}
                        iconPosition="start"
                        icon={!hideIcon ? tab.icon : null}
                        {...a11yProps(index)}
                        className={`Mui-tabCustom ${className}`}
                    />
                ))}
            </Tabs>

            {/* Tab Content */}
            {tabList?.map((tab, index) => (
                <TabPanel
                    key={index}
                    value={value}
                    index={index}
                    className='p-0'
                >
                    {tab.content}
                </TabPanel>
            ))}
        </Box>
    );
}

export default memo(TabComponent);
