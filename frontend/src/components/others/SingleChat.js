import React, { useEffect, useState } from 'react'
import { ChatState } from '../../context/ChatProvider';
import { Box, FormControl, IconButton, Input, Spinner, Text, useToast } from '@chakra-ui/react';
import { ArrowBackIcon, ChatIcon } from '@chakra-ui/icons';
import { getSender, getSenderObject } from '../../config/ChatMethods';
import ProfileModal from '../miscellaneous/ProfileModal'
import UpdateGroupChatModal from '../miscellaneous/UpdateGroupChatModal';
import axios from 'axios';
import ScrollableChat from './ScrollableChat';
import '../style.css';
import io from 'socket.io-client';

const ENDPOINT = "http://localhost:8000";
var socket;
var selectedChatCompare;

const SingleChat = ({fetchAgain, setFetchAgain}) => {
  const { user, selectedChat, setSelectedChat, notifications, setNotifications } = ChatState();

  const [socketConnected, setSocketConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const toast = useToast();

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit('setup', user);
    socket.on('connected', () => setSocketConnected(true));
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));
  }, []);

  const fetchMessages = async() => {
    if(!selectedChat) return;

    try{
      setLoading(true);

      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`
        }
      };

      const { data } = await axios.get(
        `/api/messages/${selectedChat._id}`,
        config
      );

      setMessages(data);
      setLoading(false);
      socket.emit('join chat', selectedChat._id);
    }catch(err) {
      console.log(err);
      toast({
        title: "Error Occured!",
        description: "Failed to Load the Messages",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMessages();

    selectedChatCompare = selectedChat;
  }, [selectedChat]);

  useEffect(() => {
    socket.on('message received', (newMessageReceived) => {
      if(!selectedChatCompare || selectedChatCompare._id !== newMessageReceived.chat._id){
        // give notification 
        if(!notifications.includes(newMessageReceived)){
          setNotifications([...notifications, newMessageReceived]);
          setFetchAgain(!fetchAgain);
        }
      }else{
        setMessages([...messages, newMessageReceived]);
      }
    });
  })

  const sendMessage = async (event) => {

    if(event.key === 'Enter' && newMessage){
    
      socket.emit('stop typing', selectedChat._id);

      try {
        const config = {
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${user.token}`
          }
        };

        const { data } = await axios.post(
          `/api/messages`, 
          {
            content: newMessage,
            chatId: selectedChat._id
          }, 
          config
        );
        
        setMessages([...messages, data]);
        socket.emit('new message', data);

      }catch(err) {
        toast({
          title: "Error Occured!",
          description: "Failed to send the Message",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "top-right",
        });
      }
      setNewMessage("");
    }
  }

  const typingHandler = (event) => {
    setNewMessage(event.target.value);
    // Typing Indicator Logic

    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }else{
      let lastTypingTime = new Date().getTime();
      var timerLength = 3000;
      
      clearTimeout(typingTimeout); // Clear the previous timeout to prevent multiple timeouts running simultaneously
      
      var typingTimeout = setTimeout(() => {
        var timeNow = new Date().getTime();
        var timeDiff = timeNow - lastTypingTime;
        if (timeDiff >= timerLength && typing) {
          socket.emit('stop typing', selectedChat._id);
          setTyping(false);
        }
      }, timerLength);
    }
  }

  return (
    <>
    { selectedChat &&  
    <>

    <Box
     fontSize={{ base: "28px", md: "30px" }}
     pb={3} px={2}
     w="100%"
     fontFamily="Work sans"
     display="flex"
     justifyContent={{ base: "space-between" }}
     alignItems="center"
    >
      <IconButton
        display={'flex'}
        icon={<ArrowBackIcon />}
        onClick={() => setSelectedChat("")}
      />
      {/* for 1 on 1 chat  */}
      { !selectedChat.isGroupChat && 
        <>
        <Text> {getSender(user, selectedChat.users)} </Text>
        <ProfileModal user={getSenderObject(user, selectedChat.users)}/>
        </>
      }

      {/* for group chat  */}
      { selectedChat.isGroupChat &&
        <>
        {selectedChat.chatName.toUpperCase()}
        <UpdateGroupChatModal fetchMessages={fetchMessages} fetchAgain={fetchAgain} setFetchAgain={setFetchAgain}/>
        </>
      }
    </Box>

    <Box
      display="flex"
      flexDir="column"
      justifyContent="flex-end"
      p={3}
      bg="#E8E8E8"
      w="100%"
      h="100%"
      borderRadius="lg"
      overflowY="hidden"
    >
      {loading ? (
        <Spinner size={'xl'} w={20} h={20} margin={'auto'} color={'teal'} thickness='6px' />
      ): (
        <>
          <div className='messages'>
            <ScrollableChat messages={messages}/>
          </div>
        </>
      )}

      <FormControl onKeyDown={sendMessage} mt={3} isRequired>

        {isTyping && <div>Typing...</div>}

        <Input
          variant="filled"
          bg="white"
          placeholder="Enter a message.."
          value={newMessage}
          onChange={typingHandler}
        />
      </FormControl>
    </Box>
    </>
    }
    
    {/* if no chat is selected then show a message, to select a chat  */}
    { !selectedChat && 
        <Box display="flex" flexDirection='column' alignItems="center" justifyContent="center" h="100%">
          <Text fontSize="3xl" p={4} fontFamily="Work sans">
            Click on a chat to start chatting <ChatIcon ml={3}/>
          </Text>
        </Box> 
    }
    </>
  )
}

export default SingleChat;