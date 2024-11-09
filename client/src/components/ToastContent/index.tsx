import { CircularProgress } from '@mui/material';

type ToastContentProps = {
  children: React.ReactNode;
  showSpinner?: boolean;
};

const ToastContent = ({ children, showSpinner = false }: ToastContentProps) => (
  <div className="flex items-center">
    {showSpinner && <CircularProgress />}
    {children}
  </div>
);

export default ToastContent;
