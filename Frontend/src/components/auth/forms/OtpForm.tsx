import { useEffect, useRef, useState } from "react";
import useOtpForm from "@/hooks/auth/useOtpForm";
import useFormikFormField from "@/hooks/auth/useFormikFormField";

function OtpForm() {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const [inputHeight, setInputHeight] = useState<number | null>(null); // State to store height
  const { handleInputChange, handleKeyDown } = useOtpForm({ inputsRef });

  const { error, isTouched } = useFormikFormField("otp");

  useEffect(() => {
    if (inputsRef.current[0]) {
      setInputHeight(inputsRef.current[0].clientWidth);
    }
  }, []);

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
            style={{ height: `${inputHeight}px` }}
            className="rounded-lg border border-gray-700 bg-gray-800 text-center text-xl text-white caret-transparent outline-none focus:border-purple-500"
          />
        ))}
        <h2 className="col-span-6 text-right text-sm text-gray-400 cursor-pointer hover:text-white">
          Resend Otp
        </h2>
      </div>
    </>
  );
}

export default OtpForm;
