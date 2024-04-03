import {
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
  forwardRef,
  useEffect,
  useRef,
  useState,
} from "react";
import { mergeRefs } from "react-merge-refs";
import { CSSProperties } from "styled-components";

import { masks } from "../../utils/masks";

import * as S from "./styles";

type InputHtmlProps =
  | InputHTMLAttributes<HTMLInputElement>
  | TextareaHTMLAttributes<HTMLTextAreaElement>;

export type InputAs = "input" | "textarea";

export type TextFieldProps = InputHtmlProps & {
  name: string;
  label: string;
  as?: InputAs;
  size?: "large" | "medium" | "small";
  type?: string;
  icon?: React.ReactNode;
  mask?: keyof typeof masks;
  error?: string | ReactNode;
  containerStyle?: CSSProperties;
  onChangeValue?: (value?: string) => void;
  onClickIcon?: () => void;
  required?: boolean;
  disabled?: boolean;
};

const TextField: React.ForwardRefRenderFunction<
  HTMLInputElement,
  TextFieldProps
> = (
  {
    as = "input",
    size = "large",
    name,
    label,
    value,
    mask,
    icon,
    error: errorProp,
    containerStyle,
    disabled = false,
    required,
    onChangeValue,
    onClickIcon,
    ...props
  },
  ref,
) => {
  const [fieldValue, setFieldValue] = useState<string>();
  const fieldRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  const handleChange: React.ChangeEventHandler<
    HTMLInputElement | HTMLTextAreaElement
  > = (event) => {
    const { value } = event.target;

    const masked = mask ? masks[mask](value) : value;
    setFieldValue(masked);

    if (fieldRef.current) {
      fieldRef.current.value = masked || "";
    }

    onChangeValue && onChangeValue(masked);
  };

  useEffect(() => {
    if (fieldRef.current) {
      fieldRef.current.value = fieldValue || "";
    }
  }, [fieldValue]);

  const inputHasValue = !!fieldRef.current?.value;

  return (
    <S.Wrapper
      inputAs={as}
      disabled={disabled}
      style={containerStyle}
      size={size}
    >
      <S.Container hasClickableIcon={!!icon && !!onClickIcon}>
        <S.Label
          htmlFor={name}
          hasValue={inputHasValue}
          inputAs={as}
          isDisabled={disabled}
        >
          <span>
            {label} {required ? "*" : ""}
          </span>
          <S.InputContainer size={size} hasIcon={!!icon}>
            {/* @ts-ignore */}
            <S.Input
              inputSize={size}
              id={name}
              as={as}
              ref={mergeRefs([fieldRef, ref])}
              name={name}
              disabled={disabled}
              value={fieldValue}
              onChange={handleChange}
              {...props}
            />
            {!!icon && !onClickIcon && <S.IconButton>{icon}</S.IconButton>}
          </S.InputContainer>
        </S.Label>
        {!!icon && !!onClickIcon && (
          <S.IconButton onClick={onClickIcon}>{icon}</S.IconButton>
        )}
      </S.Container>
    </S.Wrapper>
  );
};

export default forwardRef(TextField);
