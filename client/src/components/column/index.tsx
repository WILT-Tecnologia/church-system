import { Box } from '@mui/material';

export default function Column({ children }: { children: React.ReactNode }) {
  return (
    <Box className="flex justify-between gap-4 my-4 lg:flex-row mg:flex-col">
      {children}
    </Box>
  );
}
