import { Box } from '@mui/material';

export default function CTA({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column-reverse', lg: 'row' },
        justifyContent: 'flex-end',
        gap: 4,
        my: 3,
      }}
    >
      {children}
    </Box>
  );
}
