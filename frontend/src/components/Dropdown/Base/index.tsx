import { useState } from "react";

import * as S from "./styles";

export type BaseProps = {
  children: string | React.ReactNode;
  isOpen?: boolean;
};

const Base = ({ children }: BaseProps) => {
  const [show, setShow] = useState(false);

  const toggleBase = () => {
    setShow((current) => !current);
  };

  return (
    <S.Wrapper>
      <S.Container isOpen={show} onClick={toggleBase}>
        {children}
      </S.Container>
      {/* <S.Overlay isOpen={show} onClick={() => setShow(false)} /> */}
    </S.Wrapper>
  );
};
export default Base;
