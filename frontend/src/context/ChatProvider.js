import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Create a new context for the chat feature
const ChatContext = createContext();

// Define the ChatProvider component   
const ChatProvider = ({ children }) => {
    // State variable to store user information
    const [user, setUser] = useState();
    const [selectedChat, setSelectedChat] = useState();
    const [chats, setChats] = useState([]);
    const [notifications, setNotifications] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        // Retrieve user information from localStorage
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        // Update the user state with the retrieved information
        setUser(userInfo);

        // If user info is not available, navigate to the homepage
        if (!userInfo) {
            navigate('/');
        }
    }, [navigate]);  // useEffect dependency changed to navigate

    return (
        <ChatContext.Provider
            value={{
                user,
                setUser,
                selectedChat,
                setSelectedChat,
                chats,
                setChats,
                notifications,
                setNotifications
            }}
        >
            {children}
        </ChatContext.Provider>
    )
}

// Define the ChatState hook to access the chat state
export const ChatState = () => {
    return useContext(ChatContext);
}

export default ChatProvider;
