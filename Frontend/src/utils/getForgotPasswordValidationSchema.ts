import {
  confirmPasswordValidationSchema,
  emailValidationSchema,
  otpValidationSchema,
  passwordValidationSchema,
} from "@/validators/authValidatorSchema";

const getForgotPasswordValidationSchema = (currentStepIndex: number) => {
  switch (currentStepIndex) {
    case 1:
      return emailValidationSchema;
    case 2:
      return otpValidationSchema;
    case 3:
      return passwordValidationSchema;
    case 4:
      return confirmPasswordValidationSchema;
  }
};

export { getForgotPasswordValidationSchema };
