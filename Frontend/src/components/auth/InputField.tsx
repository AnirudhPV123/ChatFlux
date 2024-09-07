import useFormikFormField from "@/hooks/auth/useFormikFormField";
import { memo } from "react";

type InputFieldProps<T> = {
  type: string;
  name: keyof T;
  placeholder: string;
  isErrorNeeded?: boolean;
  label: string;
};

function InputField<T>({
  type,
  name,
  placeholder,
  label,
  isErrorNeeded = true,
}: InputFieldProps<T>) {
  const stringName = String(name);
  const { error, isTouched, value, handleChange, handleBlur } =
    useFormikFormField(stringName);

  return (
    <>
      {/* Label */}
      <label
        htmlFor={stringName}
        className="label-text mt-2 font-semibold text-gray-300"
      >
        {label}
      </label>

      {/* Input field */}
      <input
        className={`input input-bordered w-full ${
          error && isTouched ? "border-red-600" : ""
        }`}
        placeholder={placeholder}
        type={type}
        id={stringName}
        name={stringName}
        onChange={handleChange}
        onBlur={handleBlur}
        value={value as string}
      />

      {/* Error message */}
      {isErrorNeeded && error && isTouched && (
        <div className="mt-[-4px] text-xs text-red-600">{error}</div>
      )}
    </>
  );
}

const MemoizedInputField = memo(InputField) as typeof InputField;
export default MemoizedInputField;
