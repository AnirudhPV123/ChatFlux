import { UserType } from "@/redux/userSlice";
import { UseMutationResult } from "@tanstack/react-query";

export interface CustomError extends Error {
  response?: {
    data?: {
      message: string;
    };
  };
}

export type AuthResponse = {
  data: {
    data: UserType;
  };
};

export type AuthMutation<T> = UseMutationResult<AuthResponse, Error, T>;
