import React, { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { Formik, Form } from "formik";
import { registerUser, resendOTP, verifyOTP } from "../api/user";
import { registerValidationSchema } from "../validationSchema/schema";
import Input from "../components/Input";
import OTPInput from "../components/OTPInput";
import GenderRadioGroup from "../components/GenderRadioGroup";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setAuthUser } from "../redux/userSlice";

function Register() {
  const [step, setStep] = useState(1);
  const [otpError, setOtpError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Handle form submission
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
        const res = await verifyOTP({
          otp: otpNumber,
          phoneNumber: values.phoneNumber,
        });
        toast.success("User verified Successfully");
        dispatch(setAuthUser(res.data.data.user));
        navigate("/");
      } else {
        await registerUser(values);
        toast.success("User registered Successfully");
        setStep(2);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
      if (step === 2) values.otp = ["", "", "", "", "", ""];
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP resend
  const handleResendOTP = async (phoneNumber) => {
    setLoading(true);
    try {
      await resendOTP(phoneNumber);
      toast.success("New OTP generated Successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card w-4/5 md:w-1/2 absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 border border-gray-700 text-neutral-content z-10 px-6 py-4">
      <h2 className="text-2xl flex gap-2 mx-auto items-center font-semibold mb-4">
        {/* Header with dynamic text*/}
        {step === 1 ? "Register" : "Verify"}
        <Lock />
      </h2>
      <Formik
        initialValues={{
          userName: "",
          phoneNumber: "",
          otp: ["", "", "", "", "", ""],
          password: "",
          confirmPassword: "",
          gender: "",
        }}
        validationSchema={registerValidationSchema}
        onSubmit={handleSubmit}
      >
        {(formikProps) => (
          <Form className="flex flex-col gap-2">
            {/* step 1 - Display necessary fields */}
            {step === 1 && (
              <>
                <Input type="text" placeholder="UserName" name="userName" />
                <Input
                  type="number"
                  placeholder="PhoneNumber"
                  name="phoneNumber"
                />
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    name="password"
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
                <GenderRadioGroup name="gender" />
              </>
            )}

            {/* step 2 - Display OTP validation */}
            {step === 2 && (
              <>
                <h3 className="font-semibold mb-2">Enter OTP :</h3>
                <OTPInput name="otp" style={otpError && "border-red-600"} />
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

            {/* Submit button with dynamic text and loading animation */}
            <button
              className="btn btn-primary mt-4 flex-1"
              type="submit"
              disabled={loading}
            >
              {step === 1 && !loading ? "Register" : !loading && "Verify"}
              {loading && (
                <span className="loading loading-bars loading-md"></span>
              )}
            </button>
          </Form>
        )}
      </Formik>

      <Link className="text-sm mt-2 text-center" to="/login">
        Already have an account?{" "}
        <span className="font-semibold underline">Log in here.</span>
      </Link>
    </div>
  );
}

export default Register;
