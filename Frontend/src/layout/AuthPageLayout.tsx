import React from "react";

interface AuthPageLayoutProps {
  children: React.ReactNode;
}

const AuthPageLayout: React.FC<AuthPageLayoutProps> = React.memo(
  ({ children }) => {
    return (
      <div className="card absolute left-1/2 top-1/2 z-10 w-4/5 -translate-x-1/2 -translate-y-1/2 border border-transparent px-6 py-4 text-neutral-content md:w-1/3">
        {children}
      </div>
    );
  },
);

export default AuthPageLayout;
