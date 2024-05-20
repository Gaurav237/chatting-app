import React, { useState } from 'react';
import { VStack, StackDivider, FormControl, FormLabel, Input, InputGroup, InputRightElement, Button, useToast } from '@chakra-ui/react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SignUp = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [pic, setPic] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const toast = useToast();
    const navigate = useNavigate();

    const handleTogglePassword = () => {
        setShowPassword(!showPassword);
    };

    const postImage = (picture) => {
        setLoading(true);

        if (!picture) {
            toast({
                title: 'Please Select an Image',
                status: 'warning',
                duration: 5000,
                isClosable: true,
                position: 'bottom'
            });
            setLoading(false);
            return;
        }

        if (picture.type === 'image/jpeg' || picture.type === 'image/png') {
            const data = new FormData();
            data.append('file', picture);
            data.append('upload_preset', 'chat-box');
            data.append('cloud_name', 'gaurav237');
            
            fetch('https://api.cloudinary.com/v1_1/gaurav237/image/upload', {
                method: 'post',
                body: data
            })
            .then(res => res.json())
            .then(data => {
                setPic(data.url.toString());
                setLoading(false);
            })
            .catch(err => {
                console.log(err);
                setLoading(false);
            });
        } else {
            toast({
                title: 'Please Select an Image File Only',
                status: 'warning',
                duration: 5000,
                isClosable: true,
                position: 'bottom'
            });
            setLoading(false);
            return;
        }
    };

    const submitHandler = async () => {
        setLoading(true);

        if (!name || !email || !password || !confirmPassword) {
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

        if (password !== confirmPassword) {
            toast({
                title: 'Passwords do not match',
                status: 'warning',
                duration: 3000,
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
                'api/user',
                { name, email, password, pic },
                config
            );

            toast({
                title: 'Registration Successful',
                status: 'success',
                duration: 3000,
                isClosable: true,
                position: 'bottom'
            });

            localStorage.setItem('userInfo', JSON.stringify(data));

            setLoading(false);
            navigate('/chat');
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
                spacing={5}
                align='stretch'
            >
                <FormControl id='name' isRequired>
                    <FormLabel>Full Name</FormLabel>
                    <Input 
                        placeholder='Enter here'
                        onChange={(e) => setName(e.target.value)} 
                    />
                </FormControl>
                <FormControl id='email' isRequired>
                    <FormLabel>Email Id</FormLabel>
                    <Input 
                        placeholder='Enter here' 
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </FormControl>
                <FormControl id='password' isRequired>
                    <FormLabel>Password</FormLabel>
                    <InputGroup>
                        <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder='Enter here'
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <InputRightElement width="4.5rem">
                            <Button h="1.75rem" size="sm" onClick={handleTogglePassword}>
                                {showPassword ? 'Hide' : 'Show'}
                            </Button>
                        </InputRightElement>
                    </InputGroup>
                </FormControl>
                <FormControl id='confirm-password' isRequired>
                    <FormLabel>Confirm Password</FormLabel>
                    <InputGroup>
                        <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder='Enter here'
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <InputRightElement width="4.5rem">
                            <Button h="1.75rem" size="sm" onClick={handleTogglePassword}>
                                {showPassword ? 'Hide' : 'Show'}
                            </Button>
                        </InputRightElement>
                    </InputGroup>
                </FormControl>
                <FormControl id='profile-pic'>
                    <FormLabel>Upload your Picture</FormLabel>
                    <Input
                        type='file'
                        p={1.5}
                        accept='image/*'
                        onChange={(e) => postImage(e.target.files[0])}
                    />
                </FormControl>
                <Button
                    colorScheme='green'
                    width='100%'
                    style={{ marginTop: 15 }}
                    onClick={submitHandler}
                    isLoading={loading}
                >
                    Sign Up
                </Button>
            </VStack>
        </div>
    );
};

export default SignUp;
