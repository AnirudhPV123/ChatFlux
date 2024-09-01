import AuthForm from "@/components/auth/AuthForm";
import Footer from "@/components/auth/Footer";
import Header from "@/components/auth/Header";
import AuthPageLayout from "@/layout/AuthPageLayout";
import { loginFields } from "@/constants/formFields";
import { loginValidationSchema } from "@/validators/authValidatorSchema";
import React from "react";

type InitialValues = {
  email: string;
  password: string;
};
const initialValues: InitialValues = {
  email: "",
  password: "",
};
 
const LoginPage: React.FC = () => {
  return (
    <AuthPageLayout>
      <Header>Login</Header>
      <AuthForm
        authType="login"
        initialValues={initialValues}
        inputFields={loginFields}
        validationSchema={loginValidationSchema}
      />
      <Footer message="Create an account?" link="SignUp" url="sign-up" />
    </AuthPageLayout>
  );
};

export default LoginPage;
