import useGetRealTimeChat from "@/hooks/chat/useGetRealTimeChat";
import SideBar from "../components/SideBar/SideBar";
import MessageContainer from "@/components/MessageContainer/MessageConatiner";
import useGetRealTimeMessage from "@/hooks/message/useGetRealTimeMessage";
import useGetOnlineUsers from "@/hooks/chat/useGetOnlineUsers";
import useGetRealTimeCall from "@/hooks/chat/useGetRealTImeCall";
import useGetAllChats from "@/hooks/chat/useGetAllChats";
import useGetAllCalls from "@/hooks/chat/useGetAllCalls";
import { CallProvider } from "@/context/CallContext";

function HomePage() {
  useGetOnlineUsers();
  useGetRealTimeMessage();
  useGetRealTimeChat();
  useGetRealTimeCall();
  useGetAllChats();
  useGetAllCalls();

  return (
    <div className="home-container flex overflow-y-clip">
      <SideBar />
      <CallProvider>
        <MessageContainer />
      </CallProvider>
    </div>
  );
}

export default HomePage;
