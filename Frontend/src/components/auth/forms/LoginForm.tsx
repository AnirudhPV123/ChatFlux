import { FC, memo } from "react";
import {
  CustomFormikErrors,
  LoginInitialValues,
  UseHandleAuth,
} from "../types";
import {
  CustomError,
  Button,
  InputField,
  PasswordField,
  Footer,
  Header,
} from "../";
import { FormikProvider } from "@/context/FormikContext";
import useHandleLogin from "@/hooks/auth/useHandleLogin";
import { useFormik } from "formik";
import { loginValidationSchema } from "@/validators/authValidatorSchema";
import SocialLoginForm from "./SocialLoginForm";

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
      <Header>Login</Header>
      {errors?.server && <CustomError message={errors.server} />}
      <SocialLoginForm />
      <div className="divider">or</div>
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
      <Footer
        message="Create an account?"
        link="SignUp"
        url="/signup"
        authType="login"
      />
    </FormikProvider>
  );
};

export default memo(LoginForm);
