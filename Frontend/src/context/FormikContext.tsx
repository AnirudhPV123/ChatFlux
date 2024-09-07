import { createContext, useContext, ReactNode } from "react";
import { FormikProps } from "formik";
import {
  LoginInitialValues,
  SignUpInitialValues,
} from "@/components/auth/types";

// Define a generic type for Formik context
export type FormikContextType<T> = FormikProps<T> | undefined;

// Create context with a generic type
export const FormikContext =
  createContext<FormikContextType<LoginInitialValues | SignUpInitialValues>>(
    undefined,
  );

// Custom hook to use Formik context
export const useFormikContext = <T,>() => {
  const context = useContext(FormikContext) as FormikContextType<T>;
  if (!context) {
    throw new Error("useFormikContext must be used within a FormikProvider");
  }
  return context;
};

// Provider component
export function FormikProvider<T>({
  formik,
  children,
}: {
  formik: FormikProps<T>;
  children: ReactNode;
}) {
  return (
    <FormikContext.Provider
      value={
        formik as unknown as FormikContextType<
          LoginInitialValues | SignUpInitialValues
        >
      }
    >
      {children}
    </FormikContext.Provider>
  );
}
