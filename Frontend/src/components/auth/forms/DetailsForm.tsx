import InputField from "../InputField";
import DateOfBirth from "../DateOfBirth";
import Gender from "../Gender";

function DetailsForm() {
  return (
    <>
      <InputField
        label="Username"
        key="username"
        type="username"
        name="username"
        placeholder="username123"
      />
      <DateOfBirth />
      <Gender />
    </>
  );
}

export default DetailsForm;
