import { useFormikContext } from "@/context/FormikContext";

type UseOtpFormProps = {
  inputsRef: React.MutableRefObject<(HTMLInputElement | null)[]>;
};

function useOtpForm({ inputsRef }: UseOtpFormProps) {
  const { values, setFieldValue } = useFormikContext();

  //   custom function to update formik otp field
  const updateOtpFormikField = ({
    index,
    value,
  }: {
    index: number;
    value: string;
  }) => {
    const otp = values.otp;
    if (otp === null) {
      setFieldValue(`otp`, Number(value));
    }
    if (otp !== null) {
      const otpArray = otp.toString().split("");
      otpArray[index] = value;
      setFieldValue(`otp`, otpArray.join(""));
    }
  };

  // Otp input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, maxLength, nextElementSibling } = e.target;
    // Only allow numeric input
    if (/[^0-9]/.test(value)) {
      e.target.value = value.replace(/[^0-9]/g, "");
      return;
    }

    // formik update
    const index = inputsRef.current.indexOf(e.target as HTMLInputElement);
    updateOtpFormikField({ index, value });

    // Move to the next input field when the current one is filled
    if (value.length === maxLength && nextElementSibling) {
      (nextElementSibling as HTMLInputElement).focus();
    }
  };

  //   input key events (backspace,left,right)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const { key, target } = e;
    const currentIndex = inputsRef.current.indexOf(target as HTMLInputElement);
    const currentInput = inputsRef.current[currentIndex];
    // Handle backspace
    if (key === "Backspace") {
      e.preventDefault(); // Prevent default backspace behavior
      if (currentInput && currentInput.value.length === 0 && currentIndex > 0) {
        const prevInput = inputsRef.current[currentIndex - 1];
        if (prevInput) {
          prevInput.focus();
          prevInput.value = ""; // Clear the value of the previous input if needed
          updateOtpFormikField({ index: currentIndex - 1, value: "" });
        }
      }
      // Clear the current input field if it's not empty (used for last box)
      if (currentInput && currentInput.value.length > 0) {
        currentInput.value = "";

        updateOtpFormikField({ index: currentIndex, value: "" });
      }
    }
    // Handle arrow keys
    if (key === "ArrowLeft" && currentIndex > 0) {
      const prevInput = inputsRef.current[currentIndex - 1];
      if (prevInput) {
        prevInput.focus();
        prevInput.setSelectionRange(
          prevInput.value.length,
          prevInput.value.length,
        );
      }
    }
    if (key === "ArrowRight" && currentIndex < inputsRef.current.length - 1) {
      const nextInput = inputsRef.current[currentIndex + 1];
      if (nextInput) {
        nextInput.focus();
        nextInput.setSelectionRange(
          nextInput.value.length,
          nextInput.value.length,
        );
      }
    }
  };

  return { handleInputChange, handleKeyDown };
}

export default useOtpForm;
