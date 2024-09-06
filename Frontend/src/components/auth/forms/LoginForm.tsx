import { useFormik } from "formik";
import { loginValidationSchema } from "@/validators/authValidatorSchema";

import {
  CustomFormikErrors,
  LoginInitialValues,
  UseHandleAuth,
} from "../types";
import { CustomError, Button, InputField } from "../";
import { FormikProvider} from "@/context/FormikContext";
import useHandleLogin from "@/hooks/useHandleLogin";
import PasswordField from "../PasswordField";

const initialValues: LoginInitialValues = {
  email: "",
  password: "",
};

function LoginForm() {
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
        <PasswordField />
        <Button isLoading={isLoading}>Login</Button>
      </form>
    </FormikProvider>
  );
}

export default LoginForm;
