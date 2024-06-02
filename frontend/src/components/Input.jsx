import React, { useId } from "react";
import { useField } from "formik";

function Input({ ...props }) {
  const [field, meta] = useField(props);
  const id = useId();

  return (
    <>
      <input
        className={`input input-bordered w-full ${
          meta.error && meta.touched && "border-red-600"
        } ${props.name === "password" && "mb-2"} ${
          props.name === "confirmPassword" && "mb-2"
        } `}
        id={id}
        {...field}
        {...props}
      />
      {meta.error && meta.touched && (
        <div className="text-red-600 text-xs mb-2">{meta.error}</div>
      )}{" "}
    </>
  );
}

export default Input;
