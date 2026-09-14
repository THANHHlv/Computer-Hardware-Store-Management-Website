import React from 'react';
import {
  Snackbar,
  Alert,
  AlertTitle,
  Stack,
  Slide,
  type SlideProps,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useAppSelector, useAppDispatch } from '../../store';
import { removeNotification } from '../../store/slices/snackbarSlice';

function SlideTransition(props: SlideProps) {
  return <Slide {...props} direction="left" />;
}

export const AdminToast: React.FC = () => {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector((state) => state.snackbar.notifications);

  const handleClose = (id: string) => {
    dispatch(removeNotification(id));
  };

  if (notifications.length === 0) return null;

  return (
    <Stack
      spacing={1.5}
      sx={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: (theme) => theme.zIndex.snackbar + 10,
        maxWidth: { xs: 'calc(100vw - 32px)', sm: 420 },
        pointerEvents: 'none',
      }}
    >
      {notifications.map((notification) => (
        <Snackbar
          key={notification.id}
          open={true}
          autoHideDuration={notification.duration || 5000}
          onClose={(_event, reason) => {
            if (reason === 'clickaway') return;
            handleClose(notification.id);
          }}
          TransitionComponent={SlideTransition}
          sx={{
            position: 'static',
            transform: 'none !important',
            pointerEvents: 'auto',
          }}
        >
          <Alert
            severity={notification.type || 'info'}
            variant="filled"
            elevation={6}
            action={
              <IconButton
                size="small"
                aria-label="close"
                color="inherit"
                onClick={() => handleClose(notification.id)}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            }
            sx={{
              width: '100%',
              borderRadius: 2,
              fontWeight: 500,
              fontSize: '0.875rem',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
              alignItems: 'center',
            }}
          >
            {notification.title && <AlertTitle sx={{ fontWeight: 700 }}>{notification.title}</AlertTitle>}
            {notification.message}
          </Alert>
        </Snackbar>
      ))}
    </Stack>
  );
};

export default AdminToast;
