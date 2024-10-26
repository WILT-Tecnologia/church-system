import { Box } from '@mui/material';

type ContainerTableProps = {
  children: React.ReactNode;
  isPadding?: boolean;
};

const ContainerTable = ({
  children,
  isPadding = false,
}: ContainerTableProps) => {
  return <Box padding={isPadding ? '5rem' : '0rem'}>{children}</Box>;
};

export default ContainerTable;
