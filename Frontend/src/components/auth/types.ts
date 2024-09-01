import { ObjectSchema } from "yup";

type LoginValidationSchemaTypes = ObjectSchema<{
  email: string;
  password: string;
}>;

type SignUpValidationSchemaTypes = ObjectSchema<{
  email: string;
  password: string;
  username: string;
  confirmPassword: string;
}>;

export type LoginFormProps = {
  authType: "login";
  initialValues: {
    email: string;
    password: string;
  };
  validationSchema: LoginValidationSchemaTypes;
  inputFields: Array<{ name: string; type: string; placeholder: string }>;
};

export type SignUpFormProps = {
  authType: "signup" ;
  initialValues: {
    email: string;
    password: string;
    username: string;
    confirmPassword: string;
  };
  validationSchema: SignUpValidationSchemaTypes;
  inputFields: Array<{ name: string; type: string; placeholder: string }>;
};

export type AuthFormProps = SignUpFormProps | LoginFormProps;

export type InitialValues = {
  email: string;
  password: string;
};
