import React, { memo } from "react";
import { useTranslation } from "react-i18next";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import Icon from "@mui/material/Icon";
import Paper from "@mui/material/Paper";
import Draggable from "react-draggable";
import PropTypes from "prop-types";
import clsx from "clsx";

/**
 * Draggable Paper component for MUI Dialog.
 */
function PaperComponent(props) {
  const { popupId, ...other } = props;
  return (
    <Draggable
      handle={popupId ? `#${popupId}` : "#ui-draggable-dialog-title"}
      cancel={'[class*="MuiDialogContent-root"]'}
    >
      <Paper {...other} />
    </Draggable>
  );
}

/**
 * Standardized High-performance Popup component.
 */
function UiPopup({
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
      PaperComponent={(props) => <PaperComponent {...props} popupId={popupId} />}
      scroll={scroll}
      maxWidth={size}
      aria-labelledby={popupId || "ui-draggable-dialog-title"}
      className="dialog-container"
      {...otherProps}
    >
      {!noHeader && (
        <>
          <DialogTitle
            className="dialog-header"
            sx={{ 
              cursor: "move", 
              bgcolor: "primary.main", 
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              p: 2,
              ...styleTitle 
            }}
            id={popupId || "ui-draggable-dialog-title"}
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
        <DialogActions className="dialog-footer" sx={{ p: 2, mt: 0 }}>
          {action}
        </DialogActions>
      )}
    </Dialog>
  );
}

UiPopup.propTypes = {
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

export default memo(UiPopup);
