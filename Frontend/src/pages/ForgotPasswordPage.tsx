import React from "react";
import AuthPageLayout from "@/layout/AuthPageLayout";
import { ForgotPasswordForm } from "@/components/auth/forms";

const ForgotPasswordPage: React.FC = () => {
  return (
    <AuthPageLayout>
      <ForgotPasswordForm />
    </AuthPageLayout>
  );
};

export default ForgotPasswordPage;
