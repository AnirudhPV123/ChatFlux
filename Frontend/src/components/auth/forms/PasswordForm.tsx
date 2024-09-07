import { memo, useEffect, useMemo, useState } from "react";
import { useFormikContext } from "@/context/FormikContext";
import useFormikFormField from "@/hooks/auth/useFormikFormField";
import PasswordField from "../PasswordField";
import { FormikValues } from "formik";
import PasswordCondition from "../PasswordCondition";

interface PasswordConditions {
  isLetter: boolean;
  isNumberOrSpecialChar: boolean;
  isValidLength: boolean;
}

interface Conditions {
  key: string;
  text: string;
  condition: boolean;
}

function PasswordForm() {
  const { values }: { values: FormikValues } = useFormikContext();
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

  const conditions: Conditions[] = useMemo(
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
      <PasswordField
        label="Create Password"
        passwordType="password"
        placeholder="Password"
      />
      <h3 className="mt-2 text-sm font-semibold text-gray-300">
        Your password must contain at least:
      </h3>
      <div className="flex flex-col gap-2">
        {conditions.map(({ key, text, condition }) => (
          <PasswordCondition
            condition={condition}
            key={key}
            text={text}
            error={error}
            isTouched={isTouched as boolean}
          />
        ))}
      </div>
    </>
  );
}

const MemoizedPasswordForm = memo(PasswordForm);
export default MemoizedPasswordForm;
