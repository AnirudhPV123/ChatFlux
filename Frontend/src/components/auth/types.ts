import { FormikErrors, FormikHelpers } from "formik";
import { ObjectSchema } from "yup";

// Initial values types
export type LoginInitialValues = {
  email: string;
  password: string;
};

export type SignUpInitialValues = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

// Validation schema types
type LoginValidationSchemaTypes = ObjectSchema<LoginInitialValues>;

type SignUpValidationSchemaTypes = ObjectSchema<SignUpInitialValues>;

// Props fr login form
export type LoginFormProps = {
  authType: "login";
  initialValues: LoginInitialValues;
  validationSchema: LoginValidationSchemaTypes;
  inputFields: Array<{ name: string; type: string; placeholder: string }>;
};

// Props for signup form
export type SignUpFormProps = {
  authType: "signup";
  initialValues: SignUpInitialValues;
  validationSchema: SignUpValidationSchemaTypes;
  inputFields: Array<{ name: string; type: string; placeholder: string }>;
};

export type UseHandleAuth<T> = {
  handleAuth: (
    values: T,
    {
      resetForm,
      setErrors,
    }: FormikHelpers<T>,
  ) => Promise<void>;
  isLoading: boolean;
  step: number;
};

export type CustomFormikErrors<T> = FormikErrors<T> & {
  server?: string;
};
