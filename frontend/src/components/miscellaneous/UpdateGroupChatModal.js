import { ViewIcon } from '@chakra-ui/icons';
import { Box, Button, FormControl, IconButton, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Spinner, useDisclosure, useToast } from '@chakra-ui/react'
import React, { useState } from 'react'
import { ChatState } from '../../context/ChatProvider';
import UserBadgeItem from '../UserAvatar/UserBadgeItem';
import axios from 'axios';
import UserListItem from '../UserAvatar/UserListItem';

const UpdateGroupChatModal = ({ fetchMessages , fetchAgain, setFetchAgain }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { user, selectedChat, setSelectedChat } = ChatState();
    const [groupChatName, setGroupChatName] = useState();
    const [search, setSearch] = useState("");
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const [renameloading, setRenameLoading] = useState(false);
    const toast = useToast();

    
    const handleAddUser = async (userToAdd) => {
        if (selectedChat.users.find((u) => u._id === userToAdd._id)) {
          toast({
            title: "User Already in group!",
            status: "error",
            duration: 5000,
            isClosable: true,
            position: "bottom",
          });
          return;
        }
    
        if (selectedChat.groupAdmin._id !== user._id) {
          toast({
            title: "Only admins can add someone!",
            status: "error",
            duration: 5000,
            isClosable: true,
            position: "bottom",
          });
          return;
        }
    
        try {
          setLoading(true);
          const config = {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          };
          const { data } = await axios.put(
            `/api/chat/add_to_group`,
            {
              chatId: selectedChat._id,
              userId: userToAdd._id,
            },
            config
          );
    
          setSelectedChat(data);
          setFetchAgain(!fetchAgain);
        } catch (error) {
          toast({
            title: "Error Occured!",
            description: error.response.data.message,
            status: "error",
            duration: 5000,
            isClosable: true,
            position: "bottom",
          });
        }
        setLoading(false);
        setGroupChatName("");
    };

    const handleRemove = async (userToRemove) => {
      if (selectedChat.groupAdmin._id !== user._id && userToRemove._id !== user._id) {
        toast({
          title: "Only admins can remove someone!",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
        return;
      }

      try {
        setLoading(true);

        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        };

        const updatedChat = await axios.put(
          `/api/chat/remove_from_group`,
          {
            chatId: selectedChat._id,
            userId: userToRemove._id,
          },
          config
        );

        (userToRemove._id === user._id) ? setSelectedChat() : setSelectedChat(updatedChat.data);
        setFetchAgain(!fetchAgain);

        // If the removed user is the admin, assign a new admin
        if (selectedChat.groupAdmin._id === userToRemove._id) {
          const newAdmin = updatedChat.data.users[0]; // Assign the first user in the updated users array as the new admin

          const updatedChatWithNewAdmin = await axios.put(
            `/api/chat/updateAdmin`,
            {
              chatId: selectedChat._id,
              newAdminId: newAdmin._id,
            },
            config
          );

          setSelectedChat(updatedChatWithNewAdmin.data);
          setFetchAgain(!fetchAgain);

          toast({
            title: "New Admin Assigned",
            description: `${newAdmin.name} has been assigned as the new admin of the group chat.`,
            status: "success",
            duration: 5000,
            isClosable: true,
            position: "bottom",
          });
        }
        fetchMessages();
      } catch(err) {
        toast({
          title: "Error Occurred",
          description: err.response.data.message,
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
      setLoading(false);
      setGroupChatName("");
    }

    const handleRename = async() => {
        if(!groupChatName) return;

        try{
            setRenameLoading(true);

            const config = {
                headers: {
                  Authorization: `Bearer ${user.token}`,
                },
            };

            const { data } = await axios.put(
                `/api/chat/rename`,
                {
                  chatId: selectedChat._id,
                  chatName: groupChatName,
                },
                config
            );

            setSelectedChat(data);
            setFetchAgain(!fetchAgain);
        }catch(err) {
            toast({
                title: "Error Occured!",
                description: err.response.data.message,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
              });
        }
        setRenameLoading(false);
        setGroupChatName("");
    }

    // exactly same as GroupChatModal search list function
    const handleSearch = async (query) => {
        if(!query){ return; }

        try {
            setLoading(true);            
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            };

            const { data } = await axios.get(`/api/user?search=${query}`, config);
            console.log(data);
            setSearchResult(data);
        }catch(err) {
            toast({
                title: 'Error Occured',
                description: 'Failed to load the search results',
                status: 'error',
                duration: 5000,
                isClosable: true,
                position: 'bottom-left'
            });
        }
        setLoading(false);
    }

  return (
    <>
    <IconButton onClick={onOpen} display={'flex'} icon={<ViewIcon/>}/>

    <Modal isOpen={isOpen} onClose={onClose} isCentered>
    <ModalOverlay />
    <ModalContent>
        <ModalHeader display={'flex'} justifyContent={'center'} fontFamily={'Work sans'} fontSize={'35px'}>
            {selectedChat.chatName}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
            <Box display={'flex'} flexWrap={'wrap'} w={'100%'} pb={3}>
                {selectedChat.users.map((u) => {
                    return <UserBadgeItem
                        key={u._id}
                        user={u}
                        handleFunction={() => handleRemove(u)}
                        admin={user} 
                    />
                })}
            </Box>
            <FormControl display={'flex'}>
                <Input
                  placeholder='Chat Name'
                  mb={3}
                  value={groupChatName}
                  onChange={(e) => setGroupChatName(e.target.value)}
                />
                <Button
                  variant={'solid'}
                  colorScheme='blue'
                  ml={2}
                  isLoading={renameloading}
                  onClick={handleRename}
                >
                    Update
                </Button>
            </FormControl>
            <FormControl>
                <Input
                  placeholder='Add User to group'
                  mb={3}
                  onChange={(e) => handleSearch(e.target.value)}
                />
            </FormControl>
            { loading 
            ? <Spinner />
            : searchResult?.map(u => {
                return <UserListItem
                  key={u._id}
                  user={u}
                  handleFunction={() => handleAddUser(u)}
                />
            })
            }
        </ModalBody>

        <ModalFooter>
        <Button onClick={() => handleRemove(user)} colorScheme='red'>
            Leave Group
        </Button>
        </ModalFooter>
    </ModalContent>
    </Modal>
    </>
  )
}

export default UpdateGroupChatModal
