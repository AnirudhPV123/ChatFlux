import InputField from "../InputField";

function EmailForm() {
  return (
    <InputField
      label="Email address"
      key="email"
      type="email"
      name="email"
      placeholder="name@domain.com"
    />
  );
}

export default EmailForm;
