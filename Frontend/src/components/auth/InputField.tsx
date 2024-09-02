import { FormikProps } from "formik";

type InputFieldProps<T> = {
  type: string;
  name: keyof T;
  placeholder: string;
  formik: FormikProps<T>;
};

function InputField<T>({
  type,
  name,
  placeholder,
  formik,
}: InputFieldProps<T>) {
  const { errors, touched, values, handleChange, handleBlur } = formik;
  const error = errors[name] as string | undefined;
  const isTouched = touched[name] as boolean | undefined;
  const value = values[name] || "";

  const stringName = String(name);

  const inputBoxAttributes: React.InputHTMLAttributes<HTMLInputElement> = {
    placeholder,
    type,
    id: stringName,
    name: stringName,
    onChange: handleChange,
    onBlur: handleBlur,
    value: value as string,
  };

  return (
    <>
      <input
        className={`input input-bordered w-full ${
          error && isTouched ? "border-red-600" : null
        }`}
        {...inputBoxAttributes}
        autoComplete={stringName}
      />
      {error && isTouched ? (
        <div className="mt-[-6px] text-xs text-red-600">{error}</div>
      ) : null}
    </>
  );
}

export default InputField;
