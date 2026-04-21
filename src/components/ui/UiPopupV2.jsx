import React, { memo, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import Icon from "@mui/material/Icon";
import Paper from "@mui/material/Paper";
import Draggable from "react-draggable";
import AddCircleOutline from "@mui/icons-material/AddCircleOutline";
import PropTypes from "prop-types";

/**
 * Draggable Paper component for MUI Dialog.
 */
function PaperComponent(props) {
  const { popupId, ...other } = props;
  return (
    <Draggable
      handle={popupId ? `#${popupId}` : "#ui-draggable-v2-dialog-title"}
      cancel={'[class*="MuiDialogContent-root"]'}
    >
      <Paper {...other} />
    </Draggable>
  );
}

/**
 * Standardized High-performance Popup V2 component (with Icon and Blue/White Header style).
 */
function UiPopupV2({
  open,
  onClosePopup = () => {},
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
      PaperComponent={(props) => <PaperComponent {...props} popupId={popupId} />}
      scroll={scroll}
      maxWidth={size}
      aria-labelledby={popupId || "ui-draggable-v2-dialog-title"}
      className="dialog-container"
      {...otherProps}
    >
      {!noHeader && (
        <>
          <DialogTitle
            className="dialog-header dialog-header-v2"
            sx={{ 
              cursor: "move", 
              bgcolor: "white", 
              color: "primary.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              p: 1.5,
              borderBottom: "1px solid",
              borderColor: "divider",
              ...styleTitle 
            }}
            id={popupId || "ui-draggable-v2-dialog-title"}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 600 }}>
              <AddCircleOutline fontSize="small" />
              {title}
            </span>
            <IconButton
              aria-label="close"
              onClick={onClosePopup}
              sx={{ color: "text.secondary" }}
              size="small"
            >
              <Icon title={t("general.close")}>close</Icon>
            </IconButton>
          </DialogTitle>
        </>
      )}

      {!noDialogContent ? (
        <DialogContent 
          sx={{ 
            p: 2, 
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
        <DialogActions 
          className="dialog-footer dialog-footer-v2" 
          sx={{ 
            p: 2, 
            mt: 0,
            borderTop: "1px solid",
            borderColor: "divider"
          }}
        >
          {action}
        </DialogActions>
      )}
    </Dialog>
  );
}

UiPopupV2.propTypes = {
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

export default memo(UiPopupV2);
