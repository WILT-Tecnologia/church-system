import { useEffect, useRef } from "react";

import * as S from "./styles";

export type ContentProps = {
  children: string | React.ReactNode;
  isOpen?: boolean;
  onClick?: () => void;
};

const Content = ({ children, isOpen, onClick }: ContentProps) => {
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
    <S.Wrapper ref={ref} isOpen={isOpen} onClick={onClick}>
      {children}
    </S.Wrapper>
  );
};

export default Content;
