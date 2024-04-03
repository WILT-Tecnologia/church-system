import styled from "styled-components";

import { AvatarProps } from "./avatar";

export type WrapperProps = Pick<
  AvatarProps,
  "src" | "fallback" | "height" | "width"
>;

export const Wrapper = styled.div<WrapperProps>``;
