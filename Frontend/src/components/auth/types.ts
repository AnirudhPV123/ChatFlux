import { FormikErrors, FormikHelpers } from "formik";

// Initial values types
export type LoginInitialValues = {
  email: string;
  password: string;
};

export type SignUpInitialValues = {
  username: string;
  email: string;
  password: string;
  dateOfBirth: { year: string; month: string; day: string };
  gender: string;
  otp: null | string;
};

export type UseHandleAuth<T> = {
  handleAuth: (
    values: T,
    { resetForm, setErrors }: FormikHelpers<T>,
  ) => Promise<void>;
  isLoading: boolean;
};

export type CustomFormikErrors<T> = FormikErrors<T> & {
  server?: string;
};
