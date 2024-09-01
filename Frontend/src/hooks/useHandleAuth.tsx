import { InitialValues } from "@/components/auth/types";
import { loginUser } from "@/services/api/auth";
import { FormikErrors, FormikHelpers } from "formik";
// import { useTypedDispatch } from "@/hooks/useRedux";
// import { setUserSlice } from "@/redux/userSlice";
import { useMutation, UseMutationResult } from "@tanstack/react-query";

interface CustomFormikErrors extends FormikErrors<InitialValues> {
  server?: string;
}

interface CustomError extends Error {
  response?: {
    data?: {
      message: string;
    };
  };
}

interface ResponseValues extends InitialValues {
  createdAt: string;
  updatedAt: string;
  username: string;
  _v: number;
  _id: string;
}

interface LoginResponse {
  data: {
    data: ResponseValues;
  };
}

type LoginMutation = UseMutationResult<LoginResponse, Error, InitialValues>;

function useHandleAuth({ authType }: { authType: "login" | "signup" }) {
  // const dispatch = useTypedDispatch();

  const mutation: LoginMutation = useMutation({
    mutationFn: loginUser,
    mutationKey: ["authUser"],
  });

  const handleAuth = async (
    values: InitialValues,
    { resetForm, setErrors }: FormikHelpers<InitialValues>,
  ) => {
    if (authType === "login") {
      try {
        const res = await mutation.mutateAsync(values);
        const data: ResponseValues = res.data.data;
        // dispatch(setUserSlice(data));
        console.log(data);

        resetForm();
      } catch (error) {
        const customError = error as CustomError;
        setErrors({
          server:
            customError.response?.data?.message ||
            "An error occurred while attempting to login",
        } as CustomFormikErrors);
      }
    }
  };

  return { handleAuth, isLoading: mutation.isPending };
}

export default useHandleAuth;
