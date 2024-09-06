import {
  detailsValidationSchema,
  emailValidationSchema,
  otpValidationSchema,
  passwordValidationSchema,
} from "@/validators/authValidatorSchema";

const getSignupValidationSchema = (currentStepIndex: number) => {
  switch (currentStepIndex) {
    case 1:
      return emailValidationSchema;
    case 2:
      return passwordValidationSchema;
    case 3:
      return detailsValidationSchema;
    case 4:
      return otpValidationSchema;
  }
};

export { getSignupValidationSchema };
