import AuthPageLayout from "@/layout/AuthPageLayout";
import {Header,SignupForm,Footer} from "@/components/auth/index";

function SignupPage() {
  return (
    <AuthPageLayout>
      <Header>Login</Header>
      <SignupForm />
      <Footer message="Already have an account?" link="Login" url="login" />
    </AuthPageLayout>
  );
}

export default SignupPage;
