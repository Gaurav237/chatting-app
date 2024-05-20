import { Box, Button, FormControl, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Spinner, useDisclosure, useToast } from '@chakra-ui/react'
import React, { useState } from 'react'
import { ChatState } from '../../context/ChatProvider';
import axios from 'axios';
import  UserListItem from '../UserAvatar/UserListItem';
import UserBadgeItem from '../UserAvatar/UserBadgeItem';

const GroupChatModal = ({children}) => {
    const [groupChatName, setGroupChatName] = useState('');
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);

    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast();
    const {user, chats, setChats} = ChatState();

    // method: to search users
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

    // method: to add new user to selected users for group list
    const handleGroup = (userToAdd) => {
        if(selectedUsers.includes(userToAdd)){
            toast({
                title: "User already added",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "top-right",
            });
            return;
        }
        setSelectedUsers([...selectedUsers, userToAdd]);
    }

    const handleDelete = (userToDelete) => {
        setSelectedUsers(selectedUsers.filter((user) => userToDelete._id !== user._id));
    }

    const handleSubmitForm = async() => {
        if(!groupChatName || !selectedUsers){
            toast({
                title: "Please fill all the feilds",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "bottom",
              });
            return;
        }

        try {
            const config = {
                headers: {
                  Authorization: `Bearer ${user.token}`,
                },
            };

            const { data } = await axios.post(
                `/api/chat/group`,
                {
                  name: groupChatName,
                  users: JSON.stringify(selectedUsers.map((u) => u._id)),
                },
                config
            );

            setChats([...chats, data]);
            onClose();

            toast({
                title: "New Group Chat Created!",
                status: "success",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
        }catch(err) {
            toast({
                title: "Failed to Create the Group Chat!",
                description: err.response.data,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
        }
    }

  return (
    <>
      <span onClick={onOpen}> {children} </span>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            fontSize='35px'
            fontFamily='Work sans'
            display='flex'
            justifyContent='center'
          >
            Create Group Chat
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody
            display='felx'
            flexDirection='column'
            alignItems='center'
          >
            <FormControl>
                <Input 
                  placeholder='Chat Name' 
                  mb='3'
                  value={groupChatName}
                  onChange={(e) => setGroupChatName(e.target.value)}    
                />
            </FormControl>
            <FormControl>
                <Input 
                  placeholder='Add Users' 
                  mb={3}
                  onChange={(e) => handleSearch(e.target.value)}    
                />
            </FormControl>

            {/* selected users */}
            <Box
            display='flex'
            flexWrap='wrap'
            w='100%'
            >
            {selectedUsers?.map((u) => {
                console.log(u);
                return (
                    <UserBadgeItem
                    key={u._id}
                    user={u}
                    handleFunction={() => handleDelete(u)}
                    admin={user} 
                    />
                );
            })}
            </Box>

            {/* render searched users */}
            { loading && <Spinner size='lg' color='red.500' thickness='4px' /> }
            { !loading && searchResult?.slice(0, 4).map(u => {
                return <UserListItem
                    key={u._id}
                    user={u}
                    handleFunction={() => handleGroup(u)}
                />
            })}
          </ModalBody>

          <ModalFooter>
            <Button colorScheme='green' mr={3} onClick={handleSubmitForm}>
              Create Chat
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default GroupChatModal
