import React, { memo, useState } from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Typography } from "@mui/material";

function TabAccordion({ children, title, component, className = "", open = true, handleOnClick }) {
    const [expanded, setExpanded] = useState(open);

    return (
        <Accordion
            expanded={expanded}
            onChange={(_, value) => {
                setExpanded(value);
                if (handleOnClick) handleOnClick(value);
            }}
            sx={{
                boxShadow: 'none',
                border: (theme) => `1px solid ${theme.palette.mode === 'light' ? '#e0e0e0' : 'rgba(255, 255, 255, 0.1)'} !important`,
                borderRadius: '6px !important',
                overflow: 'hidden',
                mb: 2,
                transition: 'all 0.2s ease-in-out',
                '&:before': {
                    display: 'none',
                },
                '&.Mui-expanded': {
                    boxShadow: (theme) => theme.palette.mode === 'light' 
                        ? '0 4px 12px rgba(0, 0, 0, 0.05)' 
                        : '0 4px 12px rgba(0, 0, 0, 0.25)',
                }
            }}
            className={className}
        >
            <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: 'primary.main', fontSize: '1.25rem' }} />}
                sx={{
                    backgroundColor: (theme) => theme.palette.mode === 'light' 
                        ? 'rgba(25, 118, 210, 0.03)' 
                        : 'rgba(255, 255, 255, 0.01)',
                    borderBottom: (theme) => expanded 
                        ? `1px solid ${theme.palette.mode === 'light' ? '#e0e0e0' : 'rgba(255, 255, 255, 0.1)'} !important`
                        : 'none !important',
                    minHeight: '44px !important',
                    px: 3,
                    '& .MuiAccordionSummary-content': {
                        margin: '10px 0 !important',
                    },
                    '&:hover': {
                        backgroundColor: (theme) => theme.palette.mode === 'light' 
                            ? 'rgba(25, 118, 210, 0.06)' 
                            : 'rgba(255, 255, 255, 0.03)',
                    }
                }}
            >
                <Typography variant="body1" fontWeight="600" color="primary.main" sx={{ fontSize: '0.925rem' }}>
                    {title}
                </Typography>
            </AccordionSummary>

            <AccordionDetails sx={{ p: 3, backgroundColor: 'background.paper' }}>
                {children ? children : component ? component : ''}
            </AccordionDetails>
        </Accordion>
    );
}

export default memo(TabAccordion);
