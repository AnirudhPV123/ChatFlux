import { FormikErrors, FormikHelpers } from "formik";
import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { loginUser } from "@/services/api/auth";
import { setUserSlice, UserType } from "@/redux/userSlice";
import { AppDispatch } from "@/redux/store";
import { useDispatch } from "react-redux";

interface CustomError extends Error {
  response?: {
    data?: {
      message: string;
    };
  };
}

type AuthResponse = {
  data: {
    data: UserType;
  };
};

type AuthMutation<T> = UseMutationResult<AuthResponse, Error, T>;

function useHandleLogin<T>() {
  const dispatch: AppDispatch = useDispatch();

  const mutation: AuthMutation<T> = useMutation({
    mutationFn: loginUser,
    mutationKey: ["authUser"],
  });

  const handleAuth = async (
    values: T,
    { resetForm, setErrors }: FormikHelpers<T>,
  ) => {
    try {
      const res = await mutation.mutateAsync(values);
      const data = (res as AuthResponse).data.data;
      dispatch(setUserSlice(data));
      resetForm();
    } catch (error) {
      const customError = error as CustomError;
      setErrors({
        server:
          customError.response?.data?.message ||
          "An error occurred while attempting to authenticate",
      } as FormikErrors<T>);
    }
  };

  return { handleAuth, isLoading: mutation.isPending };
}

export default useHandleLogin;
