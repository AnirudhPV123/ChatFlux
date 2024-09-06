import useFormikFormField from "@/hooks/useFormikFormField";

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
      <label className="label-text mt-2 font-semibold text-gray-300">
        {label}
      </label>
      <input
        className={`input input-bordered w-full ${
          error && isTouched && "border-red-600"
        }`}
        placeholder={placeholder}
        type={type}
        id={stringName}
        name={stringName}
        onChange={handleChange}
        onBlur={handleBlur}
        value={value as string}
      />
      {isErrorNeeded && error && isTouched && (
        <div className="mt-[-4px] text-xs text-red-600">{error}</div>
      )}
    </>
  );
}

export default InputField;
