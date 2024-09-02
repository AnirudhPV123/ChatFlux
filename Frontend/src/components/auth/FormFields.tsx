import { FormikProps } from "formik";
import { InputField } from "./index";

interface FormFieldProps<T> {
  formFields: Array<{ name: string; type: string; placeholder: string }>;
  formik: FormikProps<T>;
}

function FormFields<T>({ formFields, formik }: FormFieldProps<T>) {
  return (
    <>
      {formFields.map(({ name, type, placeholder }) => (
        <InputField
          key={name as string}
          name={name as keyof T}
          type={type}
          placeholder={placeholder}
          formik={formik}
        />
      ))}
    </>
  );
}

export default FormFields;
