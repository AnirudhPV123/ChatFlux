import EmailForm from "./EmailForm";
import OtpForm from "./OtpForm";
import { PasswordForm } from ".";
import { useMultistepForm } from "@/hooks/useMultistepForm";
import useHandleForgotPassword from "@/hooks/useHandleForgotPassword";
import {
  CustomFormikErrors,
  ForgotPasswordInitialValues,
  UseHandleAuth,
} from "../types";
import { FormikProvider } from "@/context/FormikContext";
import { useFormik } from "formik";
import Header from "../Header";
import AuthProgress from "../AuthProgress";
import CustomError from "../CustomError";
import { Button, Footer } from "..";
import ConfirmPasswordForm from "./ConfirmPasswordForm";
import { getForgotPasswordValidationSchema } from "@/utils/getForgotPasswordValidationSchema";

const initialValues = {
  email: "",
  otp: null,
  password: "",
  confirmPassword: "",
};

function ForgotPasswordForm() {
  const {
    step,
    next,
    currentStepIndex,
    totalSteps,
    back,
    isFirstStep,
    isLastStep,
  } = useMultistepForm([
    <EmailForm label="Enter your email address" />,
    <OtpForm />,
    <PasswordForm />,
    <ConfirmPasswordForm />,
  ]);

  const { handleAuth, isLoading }: UseHandleAuth<ForgotPasswordInitialValues> =
    useHandleForgotPassword({
      currentStepIndex,
      next,
    });

  const formik = useFormik({
    initialValues,
    validationSchema: getForgotPasswordValidationSchema(currentStepIndex),
    onSubmit: (values, { setTouched, ...rest }) => {
      if (currentStepIndex !== 3) {
        handleAuth(values, { setTouched, ...rest });
      } else {
        next();
      }
      setTouched({});
    },
  });

  const errors: CustomFormikErrors<ForgotPasswordInitialValues> = formik.errors;

  return (
    <FormikProvider formik={formik}>
      {currentStepIndex === 1 && <Header>Forgot Password</Header>}

      {/* Top progress bar and steps */}
      <AuthProgress
        flowType="forgotPassword"
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
        <Button isLoading={isLoading}>
          {currentStepIndex === 1
            ? "Next"
            : currentStepIndex === 2
              ? "Verify"
              : currentStepIndex === 3
                ? "Next"
                : "Submit"}
        </Button>
      </form>

      {currentStepIndex === 1 && (
        <Footer
          authType="login"
          message="Go back to login?"
          link="Login in here"
          url="/login"
        />
      )}
    </FormikProvider>
  );
}

export default ForgotPasswordForm;
