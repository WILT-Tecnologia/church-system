import { CircularProgress } from '@mui/material';
import * as S from './styles';

type ToastContentProps = {
  children: React.ReactNode;
  showSpinner?: boolean;
};

const ToastContent = ({ children, showSpinner = false }: ToastContentProps) => (
  <S.Wrapper>
    {showSpinner && <CircularProgress />}
    {children}
  </S.Wrapper>
);

export default ToastContent;
