import { AppDispatch } from "@/redux/store";
import { setUserSlice, UserType } from "@/redux/userSlice";
import { signupUser, signupVerifyOtp } from "@/services/api/auth";
import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { FormikErrors, FormikHelpers } from "formik";
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

function useHandleSignup<T>({
  next,
  isLastStep,
}: {
  next: () => void;
  isLastStep: boolean;
}) {
  const dispatch: AppDispatch = useDispatch();

  const mutation: AuthMutation<T> = useMutation({
    mutationFn: isLastStep ? signupVerifyOtp : signupUser,
    mutationKey: ["authUser"],
  });

  const handleAuth = async (
    values: T,
    { setErrors, resetForm, setTouched }: FormikHelpers<T>,
  ) => {
    try {
      if (isLastStep) {
        const { otp, email } = values;
        const res = await mutation.mutateAsync({ otp, email });
        const data = (res as AuthResponse).data.data;
        dispatch(setUserSlice(data));
        resetForm();
      } else {
        const res = await mutation.mutateAsync(values);
        next();
      }
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

export default useHandleSignup;
