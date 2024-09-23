import { ReactNode, useCallback, useEffect, useState } from "react";
import { useTypedDispatch, useTypedSelector } from "@/hooks/useRedux";
import { useNavigate } from "react-router-dom";
import { getUser } from "@/services/api/auth";
import { setUserSlice } from "@/redux/userSlice";
import { Loader } from "@/components";

type ProtectedRouteProps = {
  children: ReactNode;
  authentication: boolean;
};

export default function ProtectedRoute({
  children,
  authentication,
}: ProtectedRouteProps) {
  const { isAuthUser } = useTypedSelector((store) => store.user);
  const navigate = useNavigate();
  const dispatch = useTypedDispatch();
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const user = await getUser();
      dispatch(setUserSlice(user.data.data));
    } catch (error) {
      navigate("/login");
    } finally {
      setLoading(false);
    }
  }, [dispatch, navigate]);

  useEffect(() => {
    if (authentication && !isAuthUser) {
      fetchUser();
    } else if (!authentication && isAuthUser) {
      navigate("/");
    } else {
      setLoading(false);
    }
  }, [isAuthUser, navigate, authentication, fetchUser]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader loaderSize="w-10 h-10" />
      </div>
    );
  }

  return children;
}
