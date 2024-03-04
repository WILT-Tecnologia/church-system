import * as S from './styles';

export type BadgeProps = {
  children: React.ReactNode | string;
  styledType: 'success' | 'info' | 'orange' | 'error';
};

const Badge = ({ children, styledType = 'success' }: BadgeProps) => (
  <S.Wrapper styledType={styledType}>{children}</S.Wrapper>
);

export default Badge;
