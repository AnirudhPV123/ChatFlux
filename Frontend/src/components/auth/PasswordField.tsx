import useFormikFormField from "@/hooks/useFormikFormField";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

function PasswordField() {
  const [isPasswordShow, setIsPasswordShow] = useState(false);
  const { error, isTouched, value, handleChange, handleBlur } =
    useFormikFormField("password");
  return (
    <>
      <label className="label-text mt-2 font-semibold text-gray-300">
        Password
      </label>
      <div className="relative">
        <input
          type={isPasswordShow ? "text" : "password"}
          name="password"
          placeholder="Password"
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`input input-bordered w-full ${
            error && isTouched && "border-red-600"
          }`}
        />
        <button
          type="button"
          className="btn absolute right-2 border-none bg-transparent hover:bg-transparent"
          onClick={() => setIsPasswordShow((prev) => !prev)}
        >
          {isPasswordShow ? <Eye /> : <EyeOff />}
        </button>
      </div>
    </>
  );
}

export default PasswordField;
