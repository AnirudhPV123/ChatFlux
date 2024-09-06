import { createContext, useContext } from "react";
import {
  LoginInitialValues,
  SignUpInitialValues,
} from "@/components/auth/types";
import { FormikProps } from "formik";

export const FormikContext = createContext<
  FormikProps<SignUpInitialValues | LoginInitialValues> | undefined
>(undefined);

export const useFormikContext = () => {
  const context = useContext(FormikContext);
  if (!context) {
    throw new Error("useFormikContext must be used within a FormikProvider");
  }
  return context;
};

export function FormikProvider<
  T extends LoginInitialValues | SignUpInitialValues,
>({ formik, children }: { formik: FormikProps<T>; children: React.ReactNode }) {
  return (
    <FormikContext.Provider
      value={
        formik as unknown as FormikProps<
          LoginInitialValues | SignUpInitialValues
        >
      }
    >
      {children}
    </FormikContext.Provider>
  );
}
