import { useFormikContext } from "@/context/FormikContext";
import { useMemo } from "react";

// Define the custom hook
function useFormikFormField(fieldName: string) {
  const { errors, touched, values, handleBlur, handleChange } =
    useFormikContext();

  const error = useMemo(
    () => errors[fieldName as keyof typeof errors] as string | undefined,
    [errors, fieldName],
  );

  const isTouched = useMemo(
    () => touched[fieldName as keyof typeof touched] as boolean | undefined,
    [touched, fieldName],
  );

  const value = useMemo(
    () => values[fieldName as keyof typeof values] as string | undefined,
    [values, fieldName],
  );

  return { error, isTouched, value, handleBlur, handleChange };
}

export default useFormikFormField;
