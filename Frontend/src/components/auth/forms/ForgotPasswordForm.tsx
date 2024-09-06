// import React from "react";
// import { useMultistepForm } from "@/hooks/useMultistepForm";
// import {
//   emailValidationSchema,
//   otpValidationSchema,
//   passwordValidationSchema,
// } from "@/validators/authValidatorSchema";
// import { useFormik } from "formik";
// import { PasswordForm, OtpForm, EmailForm } from "./";
// import { AuthProgress, Button, Header } from "../";
// import { FormikProvider } from "@/context/FormikContext";

// type UseMultistepForm = {
//   currentStepIndex: number;
//   next: () => void;
//   back: () => void;
//   totalSteps: number;
//   isFirstStep: boolean;
//   isLastStep: boolean;
//   isSecondLastStep: boolean;
//   step: React.ReactNode;
// };

// function ForgotPasswordForm() {
//   const { step, next, isLastStep, currentStepIndex, isFirstStep, totalSteps } =
//     useMultistepForm([<EmailForm />, <OtpForm />, <PasswordForm />]);

//   const formik = useFormik({
//     initialValues: {
//       email: "",
//       otp: null,
//       password: "",
//     },
//     validationSchema:
//       currentStepIndex === 1
//         ? emailValidationSchema
//         : currentStepIndex === 2
//           ? otpValidationSchema
//           : passwordValidationSchema,
//     onSubmit: (value) => {
//       console.log("email submitted :", value);
//       next();
//     },
//   });
//   return (
//     <>
//       <FormikProvider formik={formik}>
//         <Header>Forgot Password</Header>
//         {/* <AuthProgress
//           currentStepIndex={currentStepIndex}
//           totalSteps={totalSteps}
//           isLastStep={isLastStep}
//           isFirstStep={isFirstStep}
//           back={next}
//         /> */}
//         <form
//           onSubmit={formik.handleSubmit}
//           noValidate
//           className="flex w-full flex-col gap-2"
//         >
//           {step}
//           <Button type="submit">
//             {/* {isLoading ? (
//             <Loader loaderSize="loading-md" />
//           ) : isLastStep ? (
//             "Verify"
//           ) : (
//             "Next"
//           )} */}
//             Next
//           </Button>
//         </form>
//       </FormikProvider>
//     </>
//   );
// }

// export default ForgotPasswordForm;

import React from 'react'

function ForgotPasswordForm() {
  return (
    <div>ForgotPasswordForm</div>
  )
}

export default ForgotPasswordForm