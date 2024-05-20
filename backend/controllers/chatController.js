const asyncHandler = require("express-async-handler");
const Chat = require("../models/chatModel");
const User = require("../models/userModel");

// it creates or fetches 1-on-1 chat 
const accessChat = asyncHandler(async(req, res) => {
    const { userId } = req.body;

    if(!userId) {
        console.log('userId param not sent with request');
        return res.sendStatus(400);
    }
    
    // Check if a chat already exists between the logged-in user and the target user
    var isChat = await Chat.find({
        isGroupChat: false,
        $and: [
            {users: { $elemMatch: { $eq: req.user.id }}},
            {users: { $elemMatch: { $eq: userId }}}
        ]
    })
    .populate('users', '-password')
    .populate('latestMessage')
    // Populate the sender field inside latestMessage separately along with latestMessage
    .populate({
        path: 'latestMessage',
        populate: {
            path: 'sender',
            select: 'name email pic'
        }
    });

    if(isChat.length > 0){
        res.send(isChat[0]);
    }else{
        // create a new chat
        try {
            const createdChat = await Chat.create({
                chatName: 'sender',
                isGroupChat: false,
                users: [req.user._id, userId]
            });

            const fullChat = await Chat.findOne({_id: createdChat._id})
                            .populate('users', '-password');
            res.status(200).send(fullChat);
        }catch(err){
            res.status(400);
            throw new Error(err.message);
        }
     }
});

// fetches all chat of user
const fetchChats = asyncHandler(async(req, res) => {
    try{
        // finding all chats in which logged-in user is part of
        Chat.find({users: { $elemMatch: {$eq: req.user._id }}})
            .populate('users', '-password')
            .populate('groupAdmin', '-password')
            .populate('latestMessage')
            .sort({updatedAt: -1})
            .then(async (results) => {
                results = await User.populate(results, {
                    path: 'latestMessage.sender',
                    select: 'name email pic'
                });

                res.status(200).send(results);
            });
    }catch(err){
        res.status(400);
        throw new Error(err.message);
    }
});

// for creating new group
const createGroupChat = asyncHandler(async(req, res) => {
    // users and groupName of new group
    if(!req.body.users || !req.body.name){ 
        return res.status(400).send({
            message: 'Please fill all the fields'
        });
    }

    var users = JSON.parse(req.body.users);

    if(users.length < 2){
        return res.status(400)
                .send('More than 2 users are required to create a group chat');
    }

    // current logged-in user should also be part of new group created
    users.push(req.user);

    try {
        const groupChat = await Chat.create({
            chatName: req.body.name,
            users: users,
            isGroupChat: true,
            groupAdmin: req.user
        });

        const fullGroupChat = await Chat.findOne({_id: groupChat._id})
                    .populate('users', '-password')
                    .populate('groupAdmin', '-password');
        
        res.status(200).json(fullGroupChat);

    }catch(err) {
        res.status(400);
        throw new Error(err.message);
    }
});


// for renaming existing group
const renameGroup = asyncHandler(async (req, res) => {
    const { chatId, chatName } = req.body;

    const updatedChat = await Chat.findByIdAndUpdate(
        chatId,
        { 
            chatName: chatName 
        },
        { 
            new: true 
        }
    )
    .populate('users', '-password')
    .populate('groupAdmin', '-password');

    if(!updatedChat) {
        res.status(404);
        throw new Error('Chat not found');
    }else{
        res.status(200).json(updatedChat);
    }
});

const addToGroup = asyncHandler(async(req, res) => {
    const { chatId, userId } = req.body;

    const added = await Chat.findByIdAndUpdate(
        chatId,
        {
            $push: { users: userId }
        },
        { 
            new: true 
        }
    )
    .populate('users', '-password')
    .populate('groupAdmin', '-password');

    if(!added) {
        res.status(404);
        throw new Error('Chat not found');
    }else{
        res.status(200).json(added);
    }
});

const removeFromGroup = asyncHandler(async(req, res) => {
    const { chatId, userId } = req.body;

    const removed = await Chat.findByIdAndUpdate(
        chatId,
        {
            $pull: { users: userId }
        },
        { 
            new: true 
        }
    )
    .populate('users', '-password')
    .populate('groupAdmin', '-password');

    if(!removed) {
        res.status(404);
        throw new Error('Chat not found');
    }else{
        res.status(200).json(removed);
    }
});

const updateAdmin = asyncHandler(async (req, res) => {
    const { chatId, newAdminId } = req.body;
  
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      {
        groupAdmin: newAdminId,
      },
      {
        new: true,
      }
    )
    .populate('users', '-password')
    .populate('groupAdmin', '-password');

    if (!updatedChat) {
      res.status(404);
      throw new Error('Chat not found');
    }
  
    res.status(200).json(updatedChat);
});

module.exports = {
    accessChat,
    fetchChats,
    createGroupChat,
    renameGroup,
    addToGroup,
    removeFromGroup,
    updateAdmin
}