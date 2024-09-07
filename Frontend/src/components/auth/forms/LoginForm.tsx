import { FC, memo } from "react";
import {
  CustomFormikErrors,
  LoginInitialValues,
  UseHandleAuth,
} from "../types";
import { CustomError, Button, InputField, PasswordField } from "../";
import { FormikProvider } from "@/context/FormikContext";
import useHandleLogin from "@/hooks/auth/useHandleLogin";
import { useFormik } from "formik";
import { loginValidationSchema } from "@/validators/authValidatorSchema";

const initialValues: LoginInitialValues = {
  email: "",
  password: "",
};

const LoginForm: FC = () => {
  const { handleAuth, isLoading }: UseHandleAuth<LoginInitialValues> =
    useHandleLogin();

  const formik = useFormik<LoginInitialValues>({
    initialValues,
    validationSchema: loginValidationSchema,
    onSubmit: handleAuth,
  });

  const errors: CustomFormikErrors<LoginInitialValues> = formik.errors;

  return (
    <FormikProvider formik={formik}>
      {errors?.server && <CustomError message={errors.server} />}
      <form
        onSubmit={formik.handleSubmit}
        noValidate
        className="flex w-full flex-col gap-2"
      >
        <InputField
          label="Email address"
          key="email"
          type="email"
          name="email"
          placeholder="name@domain.com"
        />
        <PasswordField
          label="Enter your password"
          passwordType="password"
          placeholder="Password"
        />
        <Button isLoading={isLoading}>Login</Button>
      </form>
    </FormikProvider>
  );
};

export default memo(LoginForm);
