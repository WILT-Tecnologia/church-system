import CloseIcon from '@mui/icons-material/Close';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Grow,
  IconButton,
  Typography,
} from '@mui/material';
import React, { ReactNode } from 'react';

type GenericDialogProps = {
  open: boolean;
  title?: string | ReactNode | (() => string | ReactNode);
  content: ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  fullScreen?: boolean;
  onClose?: () => void;
};

const GenericDialog: React.FC<GenericDialogProps> = ({
  open,
  title,
  content,
  maxWidth,
  fullWidth,
  fullScreen,
  onClose,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      fullScreen={fullScreen}
      TransitionComponent={Grow}
      disableEscapeKeyDown
      scroll="paper"
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="h6" component="div">
          {typeof title === 'function' ? title() : title}{' '}
        </Typography>
        <IconButton
          edge="end"
          color="inherit"
          onClick={onClose}
          aria-label="close"
          sx={{ ml: 2 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>{content}</DialogContent>
    </Dialog>
  );
};

export default GenericDialog;
