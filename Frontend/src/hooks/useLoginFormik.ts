import {
  CustomFormikErrors,
  LoginInitialValues,
} from "@/components/auth/types";
import { loginValidationSchema } from "@/validators/authValidatorSchema";
import { FormikHelpers, useFormik } from "formik";

const initialValues: LoginInitialValues = {
  email: "",
  password: "",
};

const useLoginFormik = (
  handleAuth: (
    values: LoginInitialValues,
    { resetForm, setErrors }: FormikHelpers<LoginInitialValues>,
  ) => Promise<void>,
) => {
  const formik = useFormik<LoginInitialValues>({
    initialValues,
    validationSchema: loginValidationSchema,
    onSubmit: handleAuth,
  });

  const errors: CustomFormikErrors<LoginInitialValues> = formik.errors;
  return { ...formik, errors };
};

export default useLoginFormik;
