import { Box, CircularProgress, CircularProgressProps } from '@mui/material';

type LoadingProps = CircularProgressProps;

const Loading = (props: LoadingProps) => {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        zIndex: 9999,
      }}
    >
      <CircularProgress {...props} />
    </Box>
  );
};

export default Loading;
