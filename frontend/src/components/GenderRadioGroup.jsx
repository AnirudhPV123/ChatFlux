import React from "react";
import { useField } from "formik";

function GenderRadioGroup({ ...props }) {
  const [field, meta, helpers] = useField(props);
  const { setValue } = helpers;

  return (
    <>
      <div className="flex items-center gap-2 mt-2">
        <input
          type="radio"
          id="male"
          name={field.name}
          value="male"
          checked={field.value === "male"}
          onChange={() => setValue("male")}
          className="radio radio-primary cursor-pointer"
        />
        <label htmlFor="male" className="label-text">
          Male
        </label>

        <input
          type="radio"
          id="female"
          name={field.name}
          value="female"
          checked={field.value === "female"}
          onChange={() => setValue("female")}
          className="radio radio-primary cursor-pointer"
        />
        <label htmlFor="female" className="label-text">
          Female
        </label>
      </div>
      {meta.error && meta.touched && (
        <div className="text-red-600 text-xs mb-2">{meta.error}</div>
      )}
    </>
  );
}

export default GenderRadioGroup;
