import { FC, memo } from "react";
import { LoginInitialValues, UseHandleAuth } from "../types";
import { CustomError, Button, InputField } from "../";
import { FormikProvider } from "@/context/FormikContext";
import useHandleLogin from "@/hooks/useHandleLogin";
import PasswordField from "../PasswordField";
import useLoginFormik from "@/hooks/useLoginFormik";

const LoginForm: FC = () => {
  const { handleAuth, isLoading }: UseHandleAuth<LoginInitialValues> =
    useHandleLogin();

  const { handleSubmit, errors, ...formik } = useLoginFormik(handleAuth);

  return (
    <FormikProvider formik={{ handleSubmit, errors, ...formik }}>
      {errors?.server && <CustomError message={errors.server} />}
      <form
        onSubmit={handleSubmit}
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
};

export default memo(LoginForm);
