import {
  CustomFormikErrors,
  SignUpInitialValues,
  UseHandleAuth,
} from "../types";
import { CustomError, Button, Header, Footer, AuthProgress } from "../";
import { FormikProvider } from "@/context/FormikContext";
import { useMultistepForm } from "@/hooks/auth/useMultistepForm";
import useHandleSignup from "@/hooks/auth/useHandleSignup";
import {
  OtpForm,
  EmailForm,
  PasswordForm,
  DetailsForm,
  SocialLoginForm,
} from "./";
import { useFormik } from "formik";
import { getSignupValidationSchema } from "@/utils/getSignupValidationSchema";
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

function SignupForm() {
  // Mange multi-step form state and
  const steps = useMemo(
    () => [<EmailForm />, <PasswordForm />, <DetailsForm />, <OtpForm />],
    [],
  );

  const {
    step,
    next,
    isLastStep,
    currentStepIndex,
    isFirstStep,
    totalSteps,
    isSecondLastStep,
    back,
  } = useMultistepForm(steps);

  // Handle signup logic and loading state
  const { handleAuth, isLoading }: UseHandleAuth<SignUpInitialValues> =
    useHandleSignup({ isLastStep, next });

  const validationSchema = useMemo(
    () => getSignupValidationSchema(currentStepIndex),
    [currentStepIndex],
  );

  // Handle formik logic
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

  return (
    <FormikProvider formik={formik}>
      {isFirstStep && <Header>Sign up</Header>}

      {/* Top progress bar and steps */}
      <AuthProgress
        flowType="signup"
        currentStepIndex={currentStepIndex}
        totalSteps={totalSteps}
        isFirstStep={isFirstStep}
        isLastStep={isLastStep}
        back={back}
      />

      {/* Server error */}
      {errors?.server ? <CustomError message={errors.server} /> : null}

      <form
        onSubmit={formik.handleSubmit}
        noValidate
        className="flex w-full flex-col gap-2"
      >
        {/* Step form */}
        {step}
        <Button isLoading={isLoading}>{isLastStep ? "Verify" : "Next"}</Button>
      </form>

      {isFirstStep && (
        <>
          <div className="divider">or</div>
          <SocialLoginForm />
        </>
      )}

      {isFirstStep && (
        <Footer
          authType="signup"
          message="Already have an account?"
          link="Login in here"
          url="/login"
        />
      )}
    </FormikProvider>
  );
}

export default SignupForm;
