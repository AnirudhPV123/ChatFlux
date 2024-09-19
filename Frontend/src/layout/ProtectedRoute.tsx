import { useEffect } from "react";
import { useTypedDispatch, useTypedSelector } from "@/hooks/useRedux";
import { useNavigate } from "react-router-dom";
import { getUser } from "@/services/api/auth";
import { setUserSlice } from "@/redux/userSlice";

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
  const dispatch = useTypedDispatch();

  useEffect(() => {
    if (authentication && !isAuthUser) {
      const fetchUser = async () => {
        try {
          const user = await getUser();
          dispatch(setUserSlice(user.data.data));
        } catch (error) {
          navigate("/login");
        }
      };
      fetchUser();
      navigate("/login");
    } else if (!authentication && isAuthUser) {
      navigate("/");
    }
  }, [isAuthUser, navigate, authentication, dispatch]);

  if ((authentication && !isAuthUser) || (!authentication && isAuthUser)) {
    return null;
  }

  return children;
}
