import useFormikFormField from "@/hooks/useFormikFormField";
import { Eye, EyeOff } from "lucide-react";
import { memo, useCallback, useState } from "react";

function PasswordField({
  label="Password" ,
  passwordType = "password",
  placeholder = "Password",
}: {
  label?: string;
  passwordType?: string;
  placeholder?: string;
}) {

  console.log("PasswordField",label);
  
  const [isPasswordShow, setIsPasswordShow] = useState(false);
  const { error, isTouched, value, handleChange, handleBlur } =
    useFormikFormField(passwordType);

  const togglePasswordVisibility = useCallback(() => {
    setIsPasswordShow((prev) => !prev);
  }, []);

  return (
    <>
      {/* Label */}
      <label className="label-text mt-2 font-semibold text-gray-300">
        {label}
      </label>

      <div className="relative">
        {/* Input field */}
        <input
          type={isPasswordShow ? "text" : "password"}
          name={passwordType}
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`input input-bordered w-full ${
            error && isTouched && "border-red-600"
          }`}
        />

        {/* Toggle password visibility button */}
        <button
          type="button"
          className="btn absolute right-2 border-none bg-transparent hover:bg-transparent"
          onClick={togglePasswordVisibility}
          aria-label={isPasswordShow ? "Hide password" : "Show password"}
        >
          {isPasswordShow ? <Eye /> : <EyeOff />}
        </button>

        {/* Error message */}
        {error && isTouched && (
          <div className="mt-1 text-xs text-red-600">{error}</div>
        )}
      </div>
    </>
  );
}

const MemoizedInputField = memo(PasswordField);
export default MemoizedInputField;
