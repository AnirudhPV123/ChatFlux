import { FormikErrors, FormikHelpers } from "formik";
import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { useState } from "react";
import { loginUser, signupUser } from "@/services/api/auth";

interface CustomError extends Error {
  response?: {
    data?: {
      message: string;
    };
  };
}

interface ResponseValues {
  createdAt: string;
  updatedAt: string;
  username: string;
  _v: number;
  _id: string;
}

type AuthResponse = {
  data: {
    data: ResponseValues;
  };
};

// Generalize the mutation result
type AuthMutation<T> = UseMutationResult<AuthResponse, Error, T>;

function useHandleAuth<T >({ authType }: { authType: "login" | "signup" }) {
  const [step, setStep] = useState(1);

  const mutation: AuthMutation<T> = useMutation({
    mutationFn: authType === "login" ? loginUser : signupUser,
    mutationKey: ["authUser"],
  });

  const handleAuth = async (
    values: T,
    { resetForm, setErrors }: FormikHelpers<T>,
  ) => {
    try {
      const res = await mutation.mutateAsync(values);
      // Handle the response based on authType
      if (authType === "login") {
        const data: ResponseValues = (res as AuthResponse).data.data;
        console.log(data);
        setStep(2); // Go to OTP input page if login is successful
      } else {
        // Handle signup response
        console.log("Signup successful");
      }
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

  return { handleAuth, isLoading: mutation.isPending, step };
}

export default useHandleAuth;
