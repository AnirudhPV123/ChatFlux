import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { Formik, Form } from "formik";
import { loginUser } from "../api/user";
import { loginValidationSchema } from "../validationSchema/schema";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setAuthUser } from "../redux/userSlice";
import { Link } from "react-router-dom";
import Input from "../components/Input";

function Login() {
  const [disableBtn, setDisableBtn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (values, { resetForm }) => {
    setDisableBtn(true);
    setLoading(true);

    try {
      const res = await loginUser(values);
      toast.success("User logged in successfully");
      resetForm();
      dispatch(setAuthUser(res.data.data.user));
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
      setDisableBtn(false);
    }
  };

  return (
    <div className="card w-1/3 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 border border-gray-800 text-neutral-content z-10 px-6 py-4 ">
      <h2 className="text-2xl flex gap-2 mx-auto items-center font-semibold mb-4">
        Login
        <Lock />
      </h2>
      <Formik
        initialValues={{
          phoneNumber: "",
          password: "",
        }}
        validationSchema={loginValidationSchema}
        onSubmit={handleSubmit}
      >
        {(formikProps) => (
          <Form className="flex flex-col gap-2">
            <Input type="number" placeholder="PhoneNumber" name="phoneNumber" />
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

            {/* Submit button with loading animation */}
            <button
              className="btn btn-primary mt-4 flex-1"
              type="submit"
              disabled={disableBtn}
            >
              Login
              {loading && (
                <span className="loading loading-bars loading-md"></span>
              )}
            </button>
          </Form>
        )}
      </Formik>
      <Link
        className="font-semibold text-sm underline mt-2 text-center"
        to="/forgot-password"
      >
        Forgot your password?
      </Link>
      <hr className="my-4 border-primary opacity-50 border-1 shadow-2xl" />
      <Link className="text-sm text-center" to="/register">
        Create an account ?{" "}
        <span className="font-semibold underline">SignUp</span>
      </Link>
    </div>
  );
}

export default Login;
