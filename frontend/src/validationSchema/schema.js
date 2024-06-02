import * as Yup from "yup";

const registerValidationSchema = Yup.object().shape({
  userName: Yup.string().required("FullName is required"),
  phoneNumber: Yup.string()
    .matches(/^\d{10}$/, "Phone Number must be 10 digits")
    .required("Phone Number is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .matches(
      /[!@#$%^&*(),.?":{}|<>]/,
      "Password must contain at least one symbol"
    )
    .matches(/[0-9]/, "Password must contain at least one number")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Confirm password is required"),
  gender: Yup.string().required("Gender is required"),
});

const loginValidationSchema = Yup.object().shape({
  phoneNumber: Yup.string()
    .matches(/^\d{10}$/, "Phone Number must be 10 digits")
    .required("Phone Number is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .matches(
      /[!@#$%^&*(),.?":{}|<>]/,
      "Password must contain at least one symbol"
    )
    .matches(/[0-9]/, "Password must contain at least one number")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .required("Password is required"),
});

const phoneNumberValidationSchema = Yup.object().shape({
  phoneNumber: Yup.string()
    .matches(/^\d{10}$/, "Phone Number must be 10 digits")
    .required("Phone Number is required"),
});

const passwordAndConfirmPasswordValidation = Yup.object().shape({
  newPassword: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .matches(
      /[!@#$%^&*(),.?":{}|<>]/,
      "Password must contain at least one symbol"
    )
    .matches(/[0-9]/, "Password must contain at least one number")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "Passwords must match")
    .required("Confirm password is required"),
});

export {
  registerValidationSchema,
  loginValidationSchema,
  phoneNumberValidationSchema,
  passwordAndConfirmPasswordValidation,
};
