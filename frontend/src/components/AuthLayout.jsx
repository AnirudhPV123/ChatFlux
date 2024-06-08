import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getUser, refreshToken } from "../api/user";
import { setAuthUser, setResetUserState } from "../redux/userSlice";
import { setResetMessagesState } from "../redux/messageSlice";
import { setResetChatsState } from "../redux/chatSlice";

const useAuth = (authentication) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const authStatus = useSelector((state) => state.user.authStatus);
  const [loading, setLoading] = useState(true);
  const [tokenError, setTokenError] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await getUser();
        dispatch(setAuthUser(res.data.data.user));
        setTokenError(false);
      } catch (error) {
        try {
          await refreshToken();
          setTokenError(false);
        } catch (error) {
          dispatch(setResetUserState());
          dispatch(setResetMessagesState())
          dispatch(setResetChatsState())
          setTokenError(true);
        }
      } finally {
        setLoading(false);
      }
    };

    if (authStatus) {
      checkAuth();
    } else {
      setTokenError(true);
      setLoading(false);
    }
  }, [dispatch, authStatus]);

  useEffect(() => {
    if (!loading) {
      if (authentication && tokenError) {
        navigate("/login");
      } else if (!authentication && !tokenError) {
        navigate("/");
      }
    }
  }, [loading, authStatus, navigate, authentication, tokenError]);

  return loading;
};

const Protected = ({ children, authentication = true }) => {
  const loading = useAuth(authentication);

  if (loading) {
    return (
      <div className="flex justify-center h-[100vh] z-10">
        <span className="loading loading-bars loading-lg"></span>
      </div>
    );
  }

  return <>{children}</>;
};

export default Protected;
