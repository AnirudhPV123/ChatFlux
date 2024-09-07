import InputField from "../InputField";

function EmailForm({label="Email address"}: {label?: string}) {
  console.log("EmailForm",label);
  
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
