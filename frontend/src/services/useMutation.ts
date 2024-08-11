import {
  MutationFunction,
  useQueryClient,
  useMutation as useReactQueryUseMutation,
} from "@tanstack/react-query";
import { AxiosError } from "axios";
import { Flip, ToastContent, toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";

type ProcessQueryDataFn = (oldData: any, newData: any) => any;

type UseMutationOptions<TData = unknown, TError = unknown> = {
  linkedQueries?: Record<string, ProcessQueryDataFn>;
  renderLoading?: (data: any) => ToastContent;
  renderError?: (data: any, error: AxiosError<TError>) => ToastContent;
  renderSuccess?: (data: any) => ToastContent;
  onMutate?: () => void;
};

const useMutation = <TData = string, TError = unknown>(
  key: string,
  mutationFn: MutationFunction<any, any>,
  options: UseMutationOptions<TData, TError> = {}
) => {
  const queryClient = useQueryClient();

  return useReactQueryUseMutation({
    mutationKey: [key],
    mutationFn,
    onMutate: async (data: any) => {
      const toastKey = options.renderLoading ? `${key}-${uuidv4()}` : undefined;
      if (toastKey && options.renderLoading) {
        toast.info(options.renderLoading(data), {
          position: "top-right",
          toastId: toastKey,
          autoClose: 3000,
          closeButton: true,
          type: "info",
          theme: "colored",
        });
      }
      const previousQueriesData: Record<string, any> = {};
      if (options.linkedQueries) {
        const promises = Object.entries(options.linkedQueries).map(
          async ([query, processQueryFn]) => {
            await queryClient.cancelQueries({ queryKey: [query] });

            const previousData = queryClient.getQueryData([query]);
            queryClient.setQueryData([query], (old: any) =>
              processQueryFn(old, data)
            );

            previousQueriesData[query] = previousData;
          }
        );
        await Promise.all(promises);
      }

      options.onMutate && options.onMutate();

      return { previousQueriesData, toastKey };
    },

    onError: (err: any, variables: any, context: any) => {
      const ctx = context || {};
      if (options.renderError) {
        const toastObj = {
          type: toast.error,
          render: options.renderError(variables, err),
          autoClose: 3000,
        };

        if (ctx.toastKey) {
          toast.update(ctx.toastKey, {
            ...toastObj,
            type: "error",
            transition: Flip,
            theme: "colored",
          });
        } else {
          toast(toastObj as unknown as ToastContent);
        }
      } else if (ctx.toastKey) {
        toast.dismiss(ctx.toastKey);
      }

      Object.entries(ctx.previousQueriesData || {}).forEach(
        ([key, value]: [string, any]) => queryClient.setQueryData([key], value)
      );
    },
    onSuccess: (data: any, variables: any, context: any) => {
      if (options.renderSuccess) {
        const toastObj = {
          type: toast.success,
          render: options.renderSuccess(data),
          autoClose: 3000,
        };

        if (context?.toastKey) {
          toast.update(context.toastKey, {
            ...toastObj,
            type: "success",
            transition: Flip,
            theme: "colored",
          });
        } else {
          toast(toastObj as unknown as ToastContent);
        }
      } else if (context?.toastKey) {
        toast.dismiss(context.toastKey);
      }
    },

    onSettled: () => {
      if (options.linkedQueries) {
        Object.keys(options.linkedQueries).forEach((query) =>
          queryClient.invalidateQueries({ queryKey: [query] })
        );
      }
    },
    ...options,
  });
};

export default useMutation;
