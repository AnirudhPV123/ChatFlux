import MessageContainer from "../components/MessageContainer/MessageContainer";
import SideBar from "../components/SideBar/SideBar";
import useGetOnlineUsers from "../hooks/useGetOnlineUsers";
import useGetRealTimeChat from "../hooks/useGetRealTimeChat";
import useGetRealTimeMessage from "../hooks/useGetRealTimeMessage";

function Home() {
  useGetOnlineUsers();
  useGetRealTimeMessage();
  useGetRealTimeChat()

  return (
    <div className="home-container flex">
      <SideBar />
      <MessageContainer />
    </div>
  );
}

export default Home;
