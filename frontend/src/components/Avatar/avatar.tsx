import Image, { StaticImageData } from "next/image";

import Typography from "../Typography";

import * as S from "./styles";

export type AvatarProps = {
  fallback?: string | React.ReactNode;
  src?: string | StaticImageData;
  width?: number;
  height?: number;
};

const Avatar = ({ src, fallback, height, width }: AvatarProps) => {
  return (
    <S.Wrapper>
      {!!src && (
        <Image
          src={src}
          height={height}
          width={width}
          alt="image-avatar"
          quality={90}
          priority
        />
      )}
      {!src && (
        <Typography color="primary" size="xsmall">
          {fallback}
        </Typography>
      )}
    </S.Wrapper>
  );
};

export default Avatar;
