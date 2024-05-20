import React, { useState } from 'react';
import { Box, Button, Menu, MenuButton, MenuItem, MenuList, Text, Tooltip, Avatar, MenuDivider, useDisclosure, Input, useToast, Spinner, Badge } from '@chakra-ui/react';
import { Drawer, DrawerBody, DrawerHeader, DrawerOverlay, DrawerContent, DrawerCloseButton } from '@chakra-ui/react';
import { BellIcon, ChevronDownIcon } from '@chakra-ui/icons';
import axios from 'axios';
import ChatLoading from '../others/ChatLoading';
import UserListItem from '../UserAvatar/UserListItem';
import ProfileModal from './ProfileModal';
import { useNavigate } from 'react-router-dom';
import { ChatState } from '../../context/ChatProvider';

const SideDrawer = () => {
  const [search, setSearch] = useState('');
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const { user, setSelectedChat, chats, setChats, notifications, setNotifications } = ChatState();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const navigate = useNavigate();

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    navigate("/");
  };

  const handleSearch = async () => {
    if (!search) {
      toast({
        title: 'Please Enter Something in search',
        status: 'warning',
        duration: 5000,
        isClosable: true,
        position: 'top-right'
      });
      return;
    }

    try {
      setLoading(true);

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      }
      const { data } = await axios.get(`/api/user?search=${search}`, config);

      setLoading(false);
      setSearchResult(data);
    } catch (err) {
      toast({
        title: 'Error Occurred',
        description: 'Failed to load the Search Results',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right'
      });
    }
  }

  const accessChat = async (userId) => {
    try {
      setLoadingChat(true);

      const config = {
        headers: {
          'Content-type': 'application/json',
          Authorization: `Bearer ${user.token}`
        }
      };

      const { data } = await axios.post('/api/chat', { userId }, config);

      if (!chats.find((c) => c._id === data._id)) {
        setChats([...chats, data]);
      }

      setSelectedChat(data);
      onClose();
    } catch (err) {
      toast({
        title: 'Error fetching the chat',
        description: err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right'
      });
    }
    setLoadingChat(false);
  }

  const getSenderId = (users) => {
    const loggedUser = user;
    return (users[0]._id === loggedUser._id) ? users[1] : users[0];
  }

  return (
    <>
      <Box
        display='flex'
        justifyContent='space-between'
        alignItems='center'
        bg='white'
        w='100%'
        p='8px 10px 8px 10px'
        borderWidth='6px'
      >
        <Tooltip
          label='Search users to chat'
          hasArrow
        >
          <Button onClick={onOpen}>
            <i className="fas fa-search" />
            <Text display={{ base: 'none', md: 'flex' }} px={4}>
              Search User
            </Text>
          </Button>
        </Tooltip>

        <Text fontSize='3xl' fontFamily='Work sans'>
          ChatBox
        </Text>

        <div>
          <Menu>
            <MenuButton pr='8' >
              <Box position="relative" display="inline-block">
                <BellIcon boxSize="7" />

                {notifications.length > 0 && (
                  <Badge
                    position="absolute"
                    top="-10px"
                    right="-12px"
                    fontSize="18px"
                    minWidth="24px"
                    height="24px"
                    borderRadius="50%"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    bg="red"
                    color="white"
                  >
                    {notifications.length}
                  </Badge>
                )}
              </Box>
            </MenuButton>
            <MenuList>
              {notifications.length === 0 ? (
                <MenuItem>No New Messages</MenuItem>
              ) : (
                notifications.map((notif) => {
                  return (
                    <MenuItem
                      key={notif._id}
                      onClick={() => {
                        setSelectedChat(notif.chat);
                        setNotifications(notifications.filter((n) => n !== notif));
                      }}
                    >
                      {notif.chat.isGroupChat
                        ? `New Message in ${notif.chat.chatName}`
                        : `New Message from User (id: ${getSenderId(notif.chat.users)})`
                      }
                    </MenuItem>
                  );
                })
              )}
            </MenuList>
          </Menu>

          <Menu>
            <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
              <Avatar
                size='sm'
                name={user.name}
                src={user.pic}
              />
              <Text>
              </Text>
            </MenuButton>
            <MenuList>
              <ProfileModal user={user}>
                <MenuItem>My Profile</MenuItem>
              </ProfileModal>
              <MenuDivider />
              <MenuItem onClick={logoutHandler}>Logout</MenuItem>
            </MenuList>
          </Menu>
        </div>
      </Box>

      <Drawer placement='left' isOpen={isOpen} onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>All Users</DrawerHeader>

          <DrawerBody>
            <Box
              display={'flex'}
              pb={2}
              mb={5}
            >
              <Input
                placeholder='Search by name or email'
                mr={2}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button onClick={handleSearch}>
                <i className="fas fa-search" />
              </Button>
            </Box>

            {
              loading
                ? <ChatLoading />
                : (
                  searchResult?.map(user => {
                    return <UserListItem
                      key={user._id}
                      user={user}
                      handleFunction={() => accessChat(user._id)}
                    />
                  })
                )
            }

            {loadingChat && <Spinner size='lg' color='red.500' thickness='4px' />}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  )
}

export default SideDrawer;
