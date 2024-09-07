import {
  CustomFormikErrors,
  SignUpInitialValues,
} from "@/components/auth/types";
import { getSignupValidationSchema } from "@/utils/getSignupValidationSchema";
import { FormikHelpers, useFormik } from "formik";
import { useMemo } from "react";

// Initial values
const initialValues: SignUpInitialValues = {
  username: "",
  email: "",
  password: "",
  otp: null,
  dateOfBirth: {
    year: "",
    month: "",
    day: "",
  },
  gender: "",
};

type UseSignupFormikProps = {
  handleAuth: (
    values: SignUpInitialValues,
    { resetForm, setErrors }: FormikHelpers<SignUpInitialValues>,
  ) => Promise<void>;
  next: () => void;
  isLastStep: boolean;
  isSecondLastStep: boolean;
  currentStepIndex: number;
};

const useSignupFormik = ({
  handleAuth,
  next,
  isLastStep,
  isSecondLastStep,
  currentStepIndex,
}: UseSignupFormikProps) => {
  // Memoize validation schema based on current step
  const validationSchema = useMemo(
    () => getSignupValidationSchema(currentStepIndex),
    [currentStepIndex],
  );

  // formik instance
  const formik = useFormik<SignUpInitialValues>({
    initialValues,
    validationSchema,
    onSubmit: (values, { setTouched, ...rest }) => {
      if (isLastStep || isSecondLastStep) {
        handleAuth(values, { setTouched, ...rest });
      } else {
        next();
      }
      setTouched({});
    },
  });

  const errors: CustomFormikErrors<SignUpInitialValues> = formik.errors;
  return { ...formik, errors };
};

export default useSignupFormik;
