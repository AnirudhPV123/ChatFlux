import useGetRealTimeChat from "@/hooks/chat/useGetRealTimeChat";
import SideBar from "../components/SideBar/SideBar";
import MessageContainer from "@/components/MessageContainer/MessageConatiner";
import useGetRealTimeMessage from "@/hooks/message/useGetRealTimeMessage";
import useGetOnlineUsers from "@/hooks/chat/useGetOnlineUsers";

function HomePage() {
  useGetOnlineUsers();
  useGetRealTimeMessage();
  useGetRealTimeChat();
  return (
    <div className="home-container flex overflow-y-clip">
      <SideBar />
      <MessageContainer />
    </div>
  );
}

export default HomePage;
