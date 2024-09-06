import React from "react";
import { LoginForm } from "@/components/auth/forms";
import { Header, Footer } from "@/components/auth";
import AuthPageLayout from "@/layout/AuthPageLayout";

const LoginPage: React.FC = () => {
  return (
    <AuthPageLayout>
      <Header>Login</Header>
      <LoginForm />
      <Footer
        message="Create an account?"
        link="SignUp"
        url="/signup"
        authType="login"
      />
    </AuthPageLayout>
  );
};

export default LoginPage;
