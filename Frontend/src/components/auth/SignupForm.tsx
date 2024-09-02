import {
  CustomFormikErrors,
  SignUpInitialValues,
  UseHandleAuth,
} from "./types";
import useHandleAuth from "@/hooks/useHandleAuth";
import { useFormik } from "formik";
import { signUpValidationSchema } from "@/validators/authValidatorSchema";
import { signUpFields } from "@/constants/formFields";
import { Loader } from "../index";
import { CustomError, FormFields, Button } from "./index";

const initialValues: SignUpInitialValues = {
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
};

function SignupForm() {
  const { handleAuth, isLoading }: UseHandleAuth<SignUpInitialValues> =
    useHandleAuth({
      authType: "signup",
    });

  const formik = useFormik<SignUpInitialValues>({
    initialValues,
    validationSchema: signUpValidationSchema,
    onSubmit: handleAuth,
  });

  const errors: CustomFormikErrors<SignUpInitialValues> = formik.errors;

  return (
    <>
      {errors?.server ? <CustomError message={errors.server} /> : null}
      <form
        onSubmit={formik.handleSubmit}
        noValidate
        className="flex w-full flex-col gap-2"
      >
        <FormFields formFields={signUpFields} formik={formik} />
        <Button type="submit">
          {isLoading ? <Loader loaderSize="loading-md" /> : "SignUp"}
        </Button>
      </form>
    </>
  );
}

export default SignupForm;
