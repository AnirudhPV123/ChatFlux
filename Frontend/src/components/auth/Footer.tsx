import React from "react";
import { Link } from "react-router-dom";

type FooterProps = {
  message: string;
  link: string;
  url: string;
};

const Footer: React.FC<FooterProps> = ({ message, link, url }) => {
  return (
    <>
      <Link
        className="mt-2 text-center text-sm font-semibold underline"
        to="/forgot-password"
      >
        Forgot your password?
      </Link>
      <hr className="border-1 my-4 border-primary opacity-50 shadow-2xl" />
      <Link className="text-center text-sm" to={url}>
        {message}
        <span className="font-semibold underline">{link}</span>
      </Link>
    </>
  );
};

export default Footer;
