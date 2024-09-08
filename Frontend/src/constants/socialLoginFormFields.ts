import google from "@/assets/icons/google_icon.ico";
import github from "@/assets/icons/github_icon.png";

export const socialLoginFormFields = [
  {
    key: "google",
    value: "Sign up with Google",
    image: google,
    callbackLink: "http://localhost:6060/api/v1/users/google/callback",
  },
  {
    key: "Github",
    value: "Sign up with Github",
    image: github,
    callbackLink: "http://localhost:6060/api/v1/users/github/callback",
  },
];
