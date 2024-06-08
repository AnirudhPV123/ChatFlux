import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { Formik, Form } from "formik";
import {
  forgotPassword,
  resetPasswordVerifyOTP,
  resetPasswordNewPassword,
  resendOTP,
} from "../api/user";
import {
  phoneNumberValidationSchema,
  passwordAndConfirmPasswordValidation,
} from "../validationSchema/schema";
import OTPInput from "../components/OTPInput";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Input from "../components/Input";

function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [otpError, setOtpError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (values, { resetForm }) => {
    setLoading(true);
    try {
      if (step === 2) {
        const otpNumber = parseInt(values.otp.join(""), 10);
        if (otpNumber.toString().length !== 6) {
          setOtpError(true);
          setLoading(false);
          return;
        }
        await resetPasswordVerifyOTP({
          otp: otpNumber,
          phoneNumber: values.phoneNumber,
        });
        toast.success("User verified successfully");
        setStep(3);
      } else if (step === 3) {
        await resetPasswordNewPassword(values);
        toast.success("Password updated successfully");
        resetForm();
        navigate("/");
      } else {
        await forgotPassword({ phoneNumber: values.phoneNumber });
        toast.success("OTP generated successfully");
        setStep(2);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
      if (step === 2) {
        values.otp = ["", "", "", "", "", ""];
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async (phoneNumber) => {
    setLoading(true);
    try {
      await resendOTP(phoneNumber);
      toast.success("New OTP generated successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  const getValidationSchema = () => {
    switch (step) {
      case 1:
        return phoneNumberValidationSchema;
      case 3:
        return passwordAndConfirmPasswordValidation;
      default:
        return null;
    }
  };

  return (
    <div className="card w-4/5 md:w-1/2 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 border border-gray-800 text-neutral-content z-10 px-6 py-4">
      <h2 className="text-2xl flex gap-2 mx-auto items-center font-semibold mb-4">
        {/* Header with dynamic text*/}
        {step === 1
          ? "Forgot Password"
          : step === 2
          ? "Verify"
          : "Reset Password"}
        <Lock />
      </h2>
      <Formik
        initialValues={{
          phoneNumber: "",
          otp: ["", "", "", "", "", ""],
          newPassword: "",
          confirmPassword: "",
        }}
        validationSchema={getValidationSchema()}
        onSubmit={handleSubmit}
      >
        {(formikProps) => (
          <Form className="flex flex-col gap-2">
            {/* step 1 - Display phoneNumber filed */}
            {step === 1 && (
              <Input
                type="number"
                placeholder="Phone Number"
                name="phoneNumber"
              />
            )}

            {/* step 2 - Display OTP validation */}
            {step === 2 && (
              <>
                <h3 className="font-semibold mb-2">Enter OTP:</h3>
                <OTPInput name="otp" style={otpError ? "border-red-600" : ""} />
                {otpError && (
                  <div className="text-red-600 text-xs mt-2 mb-2">
                    OTP is required
                  </div>
                )}
                <div className="flex justify-between mt-2">
                  <button
                    type="button"
                    className="font-semibold"
                    onClick={() =>
                      handleResendOTP(formikProps.values.phoneNumber)
                    }
                    disabled={loading}
                  >
                    Get a new code
                  </button>
                  <h5 className="text-sm">
                    We sent a 6-digit code to +91
                    {formikProps.values.phoneNumber}
                  </h5>
                </div>
              </>
            )}

            {/* step 3 - Display newPassword */}
            {step === 3 && (
              <>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="New Password"
                    name="newPassword"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3"
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                    name="confirmPassword"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-3"
                  >
                    {showConfirmPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </>
            )}

            {/* Submit button with dynamic text and loading animation */}
            <button
              className="btn btn-primary mt-4 flex-1"
              type="submit"
              disabled={loading}
            >
              {!loading && step === 1
                ? "Next"
                : !loading && step === 2
                ? "Verify"
                : "Reset"}
              {loading && (
                <span className="loading loading-bars loading-md"></span>
              )}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
}

export default ForgotPassword;
