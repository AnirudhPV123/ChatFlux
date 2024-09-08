import React from "react";
import { LoginForm } from "@/components/auth/forms";
import AuthPageLayout from "@/layout/AuthPageLayout";

const LoginPage: React.FC = () => {
  return (
    <AuthPageLayout>
      <LoginForm />
    </AuthPageLayout>
  );
};

export default LoginPage;
