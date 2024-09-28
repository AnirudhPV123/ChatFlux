import InputField from "../InputField";

function EmailForm({ label = "Email address" }: { label?: string }) {
  return (
    <InputField
      label={label}
      key="email"
      type="email"
      name="email"
      placeholder="name@domain.com"
    />
  );
}

export default EmailForm;
