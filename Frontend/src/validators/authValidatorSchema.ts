import * as Yup from "yup";

const email = Yup.string()
  .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Email is not valid")
  .required("Email is required");

const password = Yup.string()
  .min(8, "Password must be at least 8 characters")
  .matches(
    /[0-9!@#$%^&*(),.?":{}|<>]/,
    "Password must contain at least one number or symbol",
  )
  .matches(/[a-zA-Z]/, "Password must contain at least one letter")
  .required("Password is required");

const loginValidationSchema = Yup.object().shape({
  email,
  password,
});

const emailValidationSchema = Yup.object({
  email,
});
const passwordValidationSchema = Yup.object({ password });

const confirmPasswordValidationSchema = Yup.object().shape({
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Please confirm your password"),
});

const detailsValidationSchema = Yup.object().shape({
  username: Yup.string()
    .required("Username is required")
    .min(4, "Username must be at least 4 characters"),

  dateOfBirth: Yup.object().shape({
    year: Yup.string()
      .required("Year is required")
      .matches(/^\d{4}$/, "Year must be a 4-digit number")
      .test(
        "year-range",
        "Year must be greater than 1900",
        (value) => Number(value) >= 1900,
      )
      .test(
        "year-range",
        `Year must be less than or equal to ${new Date().getFullYear()}`,
        (value) => Number(value) <= new Date().getFullYear(),
      ),

    month: Yup.string()
      .required("Month is required")
      .matches(/^\d+$/, "Month must be a number")
      .test("month-range", "Month must be between 1 and 12", (value) => {
        const numValue = Number(value);
        return numValue >= 1 && numValue <= 12;
      }),

    day: Yup.string()
      .required("Day is required")
      .matches(/^\d+$/, "Day must be a number")
      .test("day-range", "Day must be between 1 and 31", (value) => {
        const numValue = Number(value);
        return numValue >= 1 && numValue <= 31;
      }),
  }),

  gender: Yup.string()
    .required("Gender is required")
    .oneOf(["male", "female", "other"], "Invalid gender"),
});

const otpValidationSchema = Yup.object().shape({
  otp: Yup.string()
    .matches(/^\d{6}$/, "OTP must be exactly 6 digits long")
    .required("OTP is required"),
});

export {
  loginValidationSchema,
  emailValidationSchema,
  passwordValidationSchema,
  detailsValidationSchema,
  otpValidationSchema,
  confirmPasswordValidationSchema,
};
