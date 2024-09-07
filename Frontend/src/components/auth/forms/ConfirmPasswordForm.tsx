import PasswordField from "../PasswordField";

function ConfirmPasswordForm() {
  return (
    <>
      <PasswordField
        label="Confirm password"
        passwordType="confirmPassword"
        placeholder="Confirm Password"
      />
    </>
  );
}

export default ConfirmPasswordForm;
