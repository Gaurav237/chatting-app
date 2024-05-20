import React, { useState } from 'react';
import { VStack, StackDivider, FormControl, FormLabel, Input, InputGroup, InputRightElement, Button, useToast } from '@chakra-ui/react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const toast = useToast();
    const navigate = useNavigate();
    
    const handleTogglePassword = () => {
        setShowPassword(!showPassword);
    };

    const submitHandler = async () => {
        setLoading(true);

        if (!email || !password) {
            toast({
                title: 'Please fill all the fields',
                status: 'warning',
                duration: 2000,
                isClosable: true,
                position: 'bottom'
            });
            setLoading(false);
            return;
        }

        try {
            const config = {
                headers: {
                    'Content-type': 'application/json'
                }
            };

            const { data } = await axios.post(
                'api/user/login',
                { email, password },
                config
            );
            
            toast({
                title: 'Login Successful',
                status: 'success',
                duration: 3000,
                isClosable: true,
                position: 'bottom'
            });

            localStorage.setItem('userInfo', JSON.stringify(data));

            setLoading(false);
            navigate('/chat'); // Navigate to the "/chat" route
        } catch (error) {
            toast({
                title: 'Error',
                description: error.response.data.message,
                status: 'error',
                duration: 3000,
                isClosable: true,
                position: 'bottom'
            });
            setLoading(false);
        }
    };

    return (
        <div>
            <VStack
                divider={<StackDivider borderColor='gray.200' />}
                spacing={4}
                align='stretch'
            >
                <FormControl id='email' isRequired>
                    <FormLabel>Email Id</FormLabel>
                    <Input 
                        placeholder='Enter here' 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </FormControl>
                <FormControl id='password' isRequired>
                    <FormLabel>Password</FormLabel>
                    <InputGroup>
                        <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder='Enter here'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <InputRightElement width="4.5rem">
                            <Button h="1.75rem" size="sm" onClick={handleTogglePassword}>
                                {showPassword ? 'Hide' : 'Show'}
                            </Button>
                        </InputRightElement>
                    </InputGroup>
                </FormControl>
                <Button
                    colorScheme='green'
                    width='100%'
                    style={{ marginTop: 15 }}
                    onClick={submitHandler}
                    isLoading={loading}
                >
                    Sign In 
                </Button>
                <Button
                    colorScheme='red'
                    width='100%'
                    onClick={() => {
                        setEmail('guest@example.com');
                        setPassword('12345');
                    }}
                >
                    Get Guest User Credentials
                </Button>
            </VStack>
        </div>
    );
};

export default Login;
