const username = {
  name: "username",
  type: "text",
  placeholder: "Username",
};

const email = {
  name: "email",
  type: "email",
  placeholder: "Email",
};

const password = {
  name: "password",
  type: "password",
  placeholder: "Password",
};

const confirmPassword = {
  name: "confirmPassword",
  type: "password",
  placeholder: "Confirm Password",
};

type FormField = {
  name: string;
  type: string;
  placeholder: string;
};

const signUpFields: Array<FormField> = [
  username,
  email,
  password,
  confirmPassword,
];

const loginFields: Array<FormField> = [email, password];

export { signUpFields, loginFields };
