import React, { useRef } from "react";

function OTPInput() {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, maxLength, nextElementSibling } = e.target;

    // Only allow numeric input
    if (/[^0-9]/.test(value)) {
      e.target.value = value.replace(/[^0-9]/g, "");
    }

    // Move to the next input field when the current one is filled
    if (value.length === maxLength && nextElementSibling) {
      (nextElementSibling as HTMLInputElement).focus();
    }
  };

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
        }
      }
      // Clear the current input field if it's not empty (used for last box)
      if (currentInput && currentInput.value.length > 0) {
        currentInput.value = "";
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

  return (
    <div className="flex gap-2">
      {[...Array(6)].map((_, index) => (
        <input
          key={index}
          type="text"
          maxLength={1}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          ref={(el) => (inputsRef.current[index] = el)}
          className="h-12 w-12 rounded-lg border border-gray-700 bg-gray-800 text-center text-xl text-white caret-transparent outline-none focus:border-purple-500"
        />
      ))}
    </div>
  );
}

export default OTPInput;
