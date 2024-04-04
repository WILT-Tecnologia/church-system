import { useEffect, useRef, useState } from "react";

import * as S from "./styles";

export type BaseProps = {
  children: string | React.ReactNode;
  isOpen?: boolean;
  onClick?: () => void;
};

const Base = ({ children, onClick, isOpen }: BaseProps) => {
  const [show, setShow] = useState(false);

  const toggleBase = () => {
    setShow(!show);
  };

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClick?.();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClick]);

  return (
    <S.Wrapper ref={ref}>
      <S.Container isOpen={isOpen} onClick={toggleBase}>
        {children}
      </S.Container>
      <S.Overlay isOpen={isOpen} onClick={onClick} />
    </S.Wrapper>
  );
};
export default Base;
