type ValidateDateOfBirthProps = {
  name: string;
  value: string;
};

const validateDateOfBirth = ({
  name,
  value,
}: ValidateDateOfBirthProps): boolean => {
  if (name === "day") {
    return !isNaN(Number(value)) && Number(value) <= 31;
  }
  if (name === "year") {
    const currentYear = new Date().getFullYear();
    return !isNaN(Number(value)) && Number(value) <= currentYear;
  }
  return true;
};

export { validateDateOfBirth };
