import React, { memo } from "react";
import { useTranslation } from "react-i18next";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import PropTypes from "prop-types";
import clsx from "clsx";

/**
 * Standardized High-performance Popup component.
 */
function Popup({
  open,
  onClosePopup,
  title,
  size = "lg",
  children,
  styleTitle,
  noHeader,
  styleContent,
  action,
  noDialogContent,
  popupId,
  scroll = "paper",
  ...otherProps
}) {
  const { t } = useTranslation();

  return (
    <Dialog
      fullWidth
      open={open}
      onClose={onClosePopup}
      scroll={scroll}
      maxWidth={size}
      aria-labelledby={popupId || "ui-dialog-title"}
      className="dialog-container"
      container={document.getElementById('root')}
      {...otherProps}
    >
      {!noHeader && (
        <>
          <DialogTitle
            className="dialog-header"
            sx={{ 
              bgcolor: "primary.main", 
              color: "primary.contrastText",
              borderBottom: (theme) => theme.palette.mode === 'light' ? 'none' : '1px solid',
              borderColor: 'divider',
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              p: 2,
              marginBottom: 1,
              ...styleTitle 
            }}
            id={popupId || "ui-dialog-title"}
          >
            <span>{title}</span>
            <IconButton
              aria-label="close"
              onClick={onClosePopup}
              sx={{
                color: "inherit",
              }}
              size="small"
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </DialogTitle>
        </>
      )}

      {!noDialogContent ? (
        <DialogContent 
          sx={{ 
            p: 2,
            pt: '16px !important',
            overflowY: "auto", 
            maxHeight: "75vh", 
            ...styleContent 
          }}
        >
          {children}
        </DialogContent>
      ) : (
        children
      )}

      {action && (
        <DialogActions className="dialog-footer" sx={{ p: 2, mt: 0 }}>
          {action}
        </DialogActions>
      )}
    </Dialog>
  );
}

Popup.propTypes = {
  size: PropTypes.oneOf(["xs", "sm", "md", "lg", "xl", false]),
  open: PropTypes.bool.isRequired,
  onClosePopup: PropTypes.func.isRequired,
  title: PropTypes.string,
  children: PropTypes.node,
  noHeader: PropTypes.bool,
  noDialogContent: PropTypes.bool,
  action: PropTypes.node,
  styleTitle: PropTypes.object,
};

export default memo(Popup);
