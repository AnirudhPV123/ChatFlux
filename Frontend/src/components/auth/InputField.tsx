import { InitialValues } from "./types";
import { FormikProps } from "formik";
import React from "react";

type InputFieldProps = {
  type: string;
  name: keyof InitialValues;
  placeholder: string;
  formik: FormikProps<InitialValues>;
};

const InputField = React.memo(
  ({ type, name, placeholder, formik }: InputFieldProps) => {
    const { errors, touched, values, handleChange, handleBlur } = formik;
    const error = errors[name] as string | undefined;
    const isTouched = touched[name] as boolean | undefined;
    const value = values[name] || "";

    const inputBoxAttributes = {
      placeholder,
      type,
      id: name,
      name,
      onChange: handleChange,
      onBlur: handleBlur,
      value: value,
    };

    return (
      <>
        <input
          className={`input input-bordered w-full ${
            error && isTouched && "border-red-600"
          }`}
          {...inputBoxAttributes}
          autoComplete={name}
        />
        {error && isTouched && (
          <div className="mt-[-6px] text-xs text-red-600">{error}</div>
        )}
      </>
    );
  },
);

export default InputField;
