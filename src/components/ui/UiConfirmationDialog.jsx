import React, { memo } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import CloseIcon from "@mui/icons-material/Close";
import DoneIcon from "@mui/icons-material/Done";
import BlockIcon from "@mui/icons-material/Block";
import Draggable from "react-draggable";
import { useTranslation } from "react-i18next";

/**
 * UiConfirmationDialog - A modernized confirmation dialog for MUI v5.
 * Features draggable header, premium styling, and full compatibility 
 * with the original logic.
 */

function PaperComponent(props) {
  return (
    <Draggable
      handle="#draggable-confirm-dialog-title"
      cancel={'[class*="MuiDialogContent-root"]'}
    >
      <Paper {...props} />
    </Draggable>
  );
}

const UiConfirmationDialog = React.forwardRef(({
  open,
  onConfirmDialogClose,
  text,
  title,
  agree = "Agree",
  cancel = "Cancel",
  onYesClick,
  handleAfterConfirm,
  needClose = true,
  maxWidth = "xs",
  ...otherProps
}, ref) => {
  const { t } = useTranslation();

  const handleConfirm = async () => {
    if (onYesClick) {
      await onYesClick();
    }
    if (typeof handleAfterConfirm === "function") {
      handleAfterConfirm();
    }
    if (needClose) {
      onConfirmDialogClose();
    }
  };

  return (
    <Dialog
      ref={ref}
      open={open}
      onClose={onConfirmDialogClose}
      maxWidth={maxWidth}
      fullWidth
      PaperComponent={PaperComponent}
      aria-labelledby="draggable-confirm-dialog-title"
      sx={{
        '& .MuiPaper-root': {
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        }
      }}
    >
      <DialogTitle
        id="draggable-confirm-dialog-title"
        sx={{
          cursor: 'move',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          py: 2,
          px: 3,
          fontSize: '1.125rem',
          fontWeight: 700,
          textTransform: 'uppercase',
        }}
      >
        <span>{title}</span>
        <IconButton
          size="small"
          onClick={onConfirmDialogClose}
          sx={{ color: 'inherit', p: 0.5 }}
        >
          <CloseIcon fontSize="small" titleAccess={t("general.close")} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3, pt: 1 }}>
        <p 
          className="text-gray-600 leading-relaxed font-medium"
          style={{ marginTop: '10px' }}
        >
          {text}
        </p>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, pt: 1, justifyContent: 'flex-end', gap: 1 }}>
        <Button
          variant="outlined"
          color="inherit"
          startIcon={<BlockIcon />}
          onClick={onConfirmDialogClose}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            color: 'text.secondary',
            borderColor: 'divider',
            '&:hover': {
              bgcolor: 'grey.100',
              borderColor: 'grey.400',
            }
          }}
        >
          {cancel}
        </Button>
        <Button
          variant="contained"
          startIcon={<DoneIcon />}
          onClick={handleConfirm}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            }
          }}
        >
          {agree}
        </Button>
      </DialogActions>
    </Dialog>
  );
});

export default memo(UiConfirmationDialog);
