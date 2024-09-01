import * as Yup from "yup";

const email = Yup.string()
  .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Email is not valid")
  .required("Email is required");

const password = Yup.string()
  .min(8, "Password must be at least 8 characters")
  .matches(
    /[!@#$%^&*(),.?":{}|<>]/,
    "Password must contain at least one symbol",
  )
  .matches(/[0-9]/, "Password must contain at least one number")
  .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
  .matches(/[a-z]/, "Password must contain at least one lowercase letter")
  .required("Password is required");

const confirmPassword = Yup.string()
  .oneOf([Yup.ref("password")], "Passwords must match")
  .required("Confirm password is required");

const signUpValidationSchema = Yup.object().shape({
  username: Yup.string().required("UserName is required"),
  email,
  password,
  confirmPassword,
});

const loginValidationSchema = Yup.object().shape({
  email,
  password,
});

export { signUpValidationSchema, loginValidationSchema };
