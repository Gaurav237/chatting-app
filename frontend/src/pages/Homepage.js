import React, { useEffect } from 'react';
import { Container, Box, Text, Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import SignUp from '../components/authentication/SignUp';
import Login from '../components/authentication/Login';

const Homepage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    if (userInfo) {
      navigate('/chat');
    }
  }, [navigate]);

  return (
    <Container>
      <Box
        display='flex'
        justifyContent='center'
        p='3'
        bg='white'
        m='40px 0 15px 0'
        borderRadius='10px'
      >
        <Text textAlign={'center'} fontSize='4xl' fontFamily='Work sans' fontWeight='bold'>
          ChatBox
        </Text>
      </Box>
      <Box bg='white' w='100%' p='4' borderRadius='10px'>
        <Tabs isFitted variant='soft-rounded' colorScheme='green'>
          <TabList mb='1em'>
            <Tab>Sign-In</Tab>
            <Tab>Sign-Up</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <Login />
            </TabPanel>
            <TabPanel>
              <SignUp />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Container>
  );
}

export default Homepage;
