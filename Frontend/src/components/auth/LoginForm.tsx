import { useFormik } from "formik";
import useHandleAuth from "@/hooks/useHandleAuth";
import { loginValidationSchema } from "@/validators/authValidatorSchema";
import { loginFields } from "@/constants/formFields";
import { CustomFormikErrors, LoginInitialValues, UseHandleAuth } from "./types";
import { Loader } from "@/components/index";
import { CustomError, FormFields, Button } from "./index";

const initialValues: LoginInitialValues = {
  email: "",
  password: "",
};

function LoginForm() {
  const { handleAuth, isLoading }: UseHandleAuth<LoginInitialValues> =
    useHandleAuth({
      authType: "login",
    });

  const formik = useFormik<LoginInitialValues>({
    initialValues,
    validationSchema: loginValidationSchema,
    onSubmit: handleAuth,
  });

  const errors: CustomFormikErrors<LoginInitialValues> = formik.errors;

  return (
    <>
      {errors?.server ? <CustomError message={errors.server} /> : null}
      <form
        onSubmit={formik.handleSubmit}
        noValidate
        className="flex w-full flex-col gap-2"
      >
        <FormFields formFields={loginFields} formik={formik} />
        <Button type="submit">
          {isLoading ? <Loader loaderSize="loading-md" /> : "Login"}
        </Button>
      </form>
    </>
  );
}

export default LoginForm;
