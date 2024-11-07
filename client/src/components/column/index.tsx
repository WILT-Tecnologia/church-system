import { Box } from '@mui/material';

export default function Column({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', lg: 'row' }, // flex-col para xs até lg flex-row
        justifyContent: 'space-between',
        gap: 4,
        my: 3,
      }}
    >
      {children}
    </Box>
  );
}
