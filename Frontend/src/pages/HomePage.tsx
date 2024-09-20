import useGetRealTimeChat from "@/hooks/chat/useGetRealTimeChat";
import SideBar from "../components/SideBar/SideBar";
import MessageContainer from "@/components/MessageContainer/MessageConatiner";

function HomePage() {
  useGetRealTimeChat();
  return (
    <div className="home-container flex overflow-y-clip">
      <SideBar />
      <MessageContainer />
    </div>
  );
}

export default HomePage;
