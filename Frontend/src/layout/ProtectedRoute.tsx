import { useEffect } from "react";
import { useTypedSelector } from "@/hooks/useRedux";
import { useNavigate } from "react-router-dom";

type ProtectedRouteProps = {
  children: React.ReactNode;
  authentication: boolean;
};

export default function ProtectedRoute({
  children,
  authentication,
}: ProtectedRouteProps) {
  const { isAuthUser } = useTypedSelector((store) => store.user);
  const navigate = useNavigate();

  useEffect(() => {
    if (authentication && !isAuthUser) {
      navigate("/login");
    } else if (!authentication && isAuthUser) {
      navigate("/");
    }
  }, [isAuthUser, navigate, authentication]);

  if ((authentication && !isAuthUser) || (!authentication && isAuthUser)) {
    return null;
  }

  return children;
}
