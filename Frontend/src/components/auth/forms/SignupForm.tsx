import {
  CustomFormikErrors,
  SignUpInitialValues,
  UseHandleAuth,
} from "../types";
import { useFormik } from "formik";
import { CustomError, Button, Header, Footer } from "../";
import {
  EmailForm,
  PasswordForm,
  OtpForm,
  SocialLoginForm,
  DetailsForm,
} from "./";
import { FormikProvider } from "@/context/FormikContext";
import { useMultistepForm } from "@/hooks/useMultistepForm";
import { AuthProgress } from "../";
import { getSignupValidationSchema } from "@/utils/getSignupValidationSchema";
import useHandleSignup from "@/hooks/useHandleSignup";

type UseMultistepForm = {
  currentStepIndex: number;
  next: () => void;
  back: () => void;
  totalSteps: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  isSecondLastStep: boolean;
  step: React.ReactNode;
};

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
  const {
    step,
    next,
    isLastStep,
    currentStepIndex,
    isFirstStep,
    totalSteps,
    isSecondLastStep,
    back,
  }: UseMultistepForm = useMultistepForm([
    <EmailForm />,
    <PasswordForm />,
    <DetailsForm />,
    <OtpForm />,
  ]);

  const { handleAuth, isLoading }: UseHandleAuth<SignUpInitialValues> =
    useHandleSignup({ next, isLastStep });

  const formik = useFormik<SignUpInitialValues>({
    initialValues,
    validationSchema: getSignupValidationSchema(currentStepIndex),
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
      <AuthProgress
        currentStepIndex={currentStepIndex}
        totalSteps={totalSteps}
        isFirstStep={isFirstStep}
        isLastStep={isLastStep}
        back={back}
      />
      {errors?.server ? <CustomError message={errors.server} /> : null}
      <form
        onSubmit={formik.handleSubmit}
        noValidate
        className="flex w-full flex-col gap-2"
      >
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
