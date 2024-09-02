import { Footer, Header, LoginForm } from "@/components/auth/index";
import AuthPageLayout from "@/layout/AuthPageLayout";
import React from "react";

const LoginPage: React.FC = () => {
  return (
    <AuthPageLayout>
      <Header>Login</Header>
      <LoginForm />
      <Footer message="Create an account?" link="SignUp" url="sign-up" />
    </AuthPageLayout>
  );
};

export default LoginPage;
