import { routes } from "@/config/global.routes";
import { createSession } from "@/requests/mutations/session";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { schema } from "./schema";

type Schema = z.infer<typeof schema>;

export type SignInProps = {
  email: string;
  password: string;
};

export default function useLoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<number>();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isLoading },
  } = useForm<SignInProps>({
    criteriaMode: "all",
    mode: "all",
    resolver: zodResolver(schema),
    defaultValues: {
      email: "test@example.com",
      password: "password",
    },
  });

  const onSubmit: SubmitHandler<Schema> = useCallback(
    async (values: SignInProps) => {
      try {
        const result = await signIn("credentials", {
          email: values.email,
          password: values.password,
          callbackUrl: routes.church,
          redirect: true,
        });
        console.log(result);
        if (result?.status === 200 || result?.status === 201) {
          await createSession({ ...values });
        }

        if (result?.error) {
          setError(result?.status);
        } else {
          router.push(routes.index);
        }
      } catch (err) {
        console.error(`erro of login: ${err}`);
      }
    },
    [router]
  );

  const handleShowPassword = () => {
    setShowPassword((showPassword) => !showPassword);
  };

  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
  };

  return {
    error,
    errors,
    isLoading,
    isSubmitting,
    showPassword,
    register,
    handleSubmit,
    onSubmit,
    handleShowPassword,
    handleMouseDownPassword,
  };
}
