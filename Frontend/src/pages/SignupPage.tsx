import AuthPageLayout from "@/layout/AuthPageLayout";
import { SignupForm } from "@/components/auth/forms";

function SignupPage() {
  return (
    <AuthPageLayout>
      <SignupForm />
    </AuthPageLayout>
  );
}

export default SignupPage;
