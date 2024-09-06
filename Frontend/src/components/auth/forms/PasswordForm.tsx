import { useEffect, useMemo, useState } from "react";
import { useFormikContext } from "@/context/FormikContext";
import useFormikFormField from "@/hooks/useFormikFormField";
import PasswordField from "../PasswordField";

interface PasswordConditions {
  isLetter: boolean;
  isNumberOrSpecialChar: boolean;
  isValidLength: boolean;
}

function PasswordForm() {
  const { values } = useFormikContext();
  const passwordValue = values.password || "";

  const [passwordConditions, setPasswordConditions] =
    useState<PasswordConditions>({
      isLetter: false,
      isNumberOrSpecialChar: false,
      isValidLength: false,
    });

  useEffect(() => {
    setPasswordConditions({
      isLetter: /[a-zA-Z]/.test(passwordValue),
      isNumberOrSpecialChar: /[0-9!@#$%^&*(),.?":{}|<>]/.test(passwordValue),
      isValidLength: passwordValue.length >= 8,
    });
  }, [passwordValue]);

  const conditions = useMemo(
    () => [
      {
        key: "isLetter",
        text: "1 small and capital letter",
        condition: passwordConditions.isLetter,
      },
      {
        key: "isNumberOrSpecialChar",
        text: "1 number or special character",
        condition: passwordConditions.isNumberOrSpecialChar,
      },
      {
        key: "isValidLength",
        text: "8 characters in total",
        condition: passwordConditions.isValidLength,
      },
    ],
    [passwordConditions],
  );

  const { error, isTouched } = useFormikFormField("password");

  return (
    <>
      <PasswordField />
      <h3 className="mt-2 text-sm font-semibold text-gray-300">
        Your password must contain at least:
      </h3>
      <div className="flex flex-col gap-2">
        {conditions.map(({ key, text, condition }) => (
          <label key={key} className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={condition}
              className={`checkbox-primary checkbox size-4`}
              disabled
            />
            <span
              className={`label-text text-xs ${error && isTouched && !condition && "text-error"}`}
            >
              {text}
            </span>
          </label>
        ))}
      </div>
    </>
  );
}

export default PasswordForm;
