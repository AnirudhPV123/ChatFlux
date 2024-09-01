import React from "react";

type PageLayoutProps = {
  children: React.ReactNode;
};

function PageLayout({ children }: PageLayoutProps) {
  return <div className="h-screen w-screen bg-[#1D232A]">{children}</div>;
}

export default PageLayout;
