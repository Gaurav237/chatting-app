import { Box } from "@chakra-ui/react";
import { ChatState } from "../context/ChatProvider";
import SideDrawer from "../components/miscellaneous/SideDrawer";
import MyChats from "../components/miscellaneous/MyChats";
import ChatWindow from "../components/miscellaneous/ChatWindow";
import { useState } from "react";

const Chatpage = () => {
  const { user } = ChatState();
  // created this state, so when we leave group we delete it chats as well
  const [fetchAgain, setFetchAgain] = useState();

    return (
        <div style={{width: '100%'}}>
          { user && <SideDrawer/> }
          <Box
            display='flex'
            justifyContent='space-between'
            w='100%'
            h='91.5vh'
            p='10px'
          >
            {/* this fetchAgain state is passed as props  */}
            { user && <MyChats fetchAgain={fetchAgain} /> }
            { user && <ChatWindow fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} /> }
          </Box>
        </div>
    )
}

export default Chatpage;
