import { useFormik, FormikErrors, FormikHelpers } from "formik";
import InputField from "./InputField";
import { AuthFormProps } from "./types";
import useHandleAuth from "@/hooks/useHandleAuth";
import Button from "./Button";
import Loader from "../Loader";
import React from "react";
import { InitialValues } from "./types";
import ErrorMessage from "./ErrorMessage";

type CustomFormikErrors = FormikErrors<InitialValues> & {
  server?: string;
};

type UseHandleAuth = {
  handleAuth: (
    values: InitialValues,
    { resetForm, setErrors }: FormikHelpers<InitialValues>,
  ) => Promise<void>;
  isLoading: boolean;
};

const AuthForm: React.FC<AuthFormProps> = ({
  authType,
  initialValues,
  validationSchema,
  inputFields,
}) => {
  const { handleAuth, isLoading }: UseHandleAuth = useHandleAuth({ authType });

  const formik = useFormik<InitialValues>({
    initialValues,
    validationSchema,
    onSubmit: handleAuth,
  });

  let buttonText;
  switch (authType) {
    case "login":
      buttonText = "Login";
      break;
    case "signup":
      buttonText = "Sign Up";
  }

  const { errors }: { errors: CustomFormikErrors } = formik;

  return (
    <>
      {errors?.server ? <ErrorMessage message={errors.server} /> : null}
      <form
        onSubmit={formik.handleSubmit}
        noValidate
        className="flex w-full flex-col gap-2"
      >
        {inputFields.map(({ name, type, placeholder }) => (
          <InputField
            key={name}
            name={name as keyof InitialValues} // Type assertion here
            type={type}
            placeholder={placeholder}
            formik={formik}
          />
        ))}

        <Button type="submit">
          {isLoading ? <Loader loaderSize="loading-md" /> : buttonText}
        </Button>
      </form>
    </>
  );
};

export default AuthForm;
