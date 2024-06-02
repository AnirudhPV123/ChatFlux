import React, { useEffect, useRef } from "react";
import { useFormikContext } from "formik";

const OTPInput = ({ style = "", ...props }) => {
  const { values, setFieldValue } = useFormikContext();
  const { name } = props;

  console.log(values)

  const inputRefs = useRef([]);

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index, e) => {
    const newValue = e.target.value.substring(e.target.value.length - 1);
    if (!isNaN(newValue)) {
      const newOtp = [...(values[name] || [])]; // Ensure value is an array
      newOtp[index] = newValue;
      setFieldValue(name, newOtp);
      handleFocus(index, newOtp);
    }
  };

  const handleFocus = (index, newOtp) => {
    const nextIndex = index + 1;
    if (newOtp[index] && nextIndex < inputRefs.current.length) {
      inputRefs.current[nextIndex].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    const value = values[name];
    if (e.key === "Backspace" && !value[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    } else if (
      e.key.match(/^\d$/) &&
      value[index] &&
      index < value.length - 1
    ) {
      inputRefs.current[index + 1].focus();
    }
  };

  return (
    <>
      <div className="grid grid-cols-6 gap-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <input
            key={index}
            type="text"
            ref={(input) => (inputRefs.current[index] = input)}
            value={
              values[name] && values[name][index] ? values[name][index] : ""
            }
            onChange={(e) => handleChange(index, e)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            {...props}
            className={`w-full h-12 text-2xl text-center border rounded-md px-2 py-2 focus:outline-none focus:border-blue-500 ${
              !values[name][index] && style
            }`}
          />
        ))}
      </div>
    </>
  );
};

export default OTPInput;
