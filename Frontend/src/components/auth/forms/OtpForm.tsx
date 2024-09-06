import React, { useRef } from "react";
import useOtpForm from "@/hooks/useOtpForm";
import useFormikFormField from "@/hooks/useFormikFormField";

function OtpForm() {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const { handleInputChange, handleKeyDown } = useOtpForm({ inputsRef });

  const { error, isTouched } = useFormikFormField("otp");

  return (
    <>
      {error && isTouched && (
        <div className="mt-[-5px] text-center text-xs text-red-600">
          {error}
        </div>
      )}

      <div className="grid grid-cols-6 gap-2">
        {[...Array(6)].map((_, index) => (
          <input
            key={index}
            type="text"
            maxLength={1}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            ref={(el) => (inputsRef.current[index] = el)}
            style={{ height: inputsRef.current[0]?.clientWidth }}
            className="rounded-lg border border-gray-700 bg-gray-800 text-center text-xl text-white caret-transparent outline-none focus:border-purple-500"
          />
        ))}
      </div>
    </>
  );
}

export default OtpForm;
