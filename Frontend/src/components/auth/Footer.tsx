import React from "react";
import { Link } from "react-router-dom";

type FooterProps = {
  message: string;
  link: string;
  url: string;
  authType: "login" | "signup";
};

const Footer: React.FC<FooterProps> = ({ message, link, url, authType }) => {
  return (
    <>
      {authType === "login" && (
        <Link
          className="mt-2 text-center text-sm font-semibold underline"
          to="/forgot-password"
        >
          Forgot your password?
        </Link>
      )}

      <div className="divider" />

      <Link className="text-center text-sm" to={url}>
        {message}&nbsp;
        <span className="font-semibold text-white underline">{link}</span>
      </Link>
    </>
  );
};

export default Footer;
