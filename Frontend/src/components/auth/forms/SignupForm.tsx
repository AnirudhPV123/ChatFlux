import { SignUpInitialValues, UseHandleAuth } from "../types";
import { CustomError, Button, Header, Footer } from "../";
import { FormikProvider } from "@/context/FormikContext";
import { useMultistepForm } from "@/hooks/useMultistepForm";
import { AuthProgress } from "../";
import useHandleSignup from "@/hooks/useHandleSignup";
import {
  OtpForm,
  EmailForm,
  PasswordForm,
  DetailsForm,
  SocialLoginForm,
} from "./";
import useSignupFormik from "@/hooks/useSignupFormik";

function SignupForm() {
  // Mange multi-step form state and logic
  const {
    step,
    next,
    isLastStep,
    currentStepIndex,
    isFirstStep,
    totalSteps,
    isSecondLastStep,
    back,
  } = useMultistepForm([
    <EmailForm />,
    <PasswordForm />,
    <DetailsForm />,
    <OtpForm />,
  ]);

  // Handle signup logic and loading state
  const { handleAuth, isLoading }: UseHandleAuth<SignUpInitialValues> =
    useHandleSignup({ isLastStep, next });

  // Handle formik logic
  const { handleSubmit, errors, ...formik } = useSignupFormik({
    currentStepIndex,
    handleAuth,
    isLastStep,
    isSecondLastStep,
    next,
  });

  return (
    <FormikProvider formik={{ handleSubmit, errors, ...formik }}>
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
        onSubmit={handleSubmit}
        noValidate
        className="flex w-full flex-col gap-2"
      >
        {/* Step form */}
        {step}
        <Button isLoading={isLoading}>{isLastStep ? "Verify" : "Next"}</Button>
      </form>

      {isFirstStep && <SocialLoginForm />}

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
