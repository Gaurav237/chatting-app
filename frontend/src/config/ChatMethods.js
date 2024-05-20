
// show the chat name as user which is not logged in for 1-on-1 chat
export const getSender = (loggedUser, users) => {
    return (users[0]._id === loggedUser._id) ? users[1].name : users[0].name;
} 

// returns the user object as user which is not logged in for 1-on-1 chat
export const getSenderObject = (loggedUser, users) => {
    return (users[0]._id === loggedUser._id) ? users[1] : users[0];
} 

// if the continuous message is sent by same user or not (for opposite side user)
export const isSameSender = (messages, m, i, userId) => {
    return (
        (i < messages.length - 1) && 
        (messages[i + 1].sender._id !== m.sender._id || messages[i + 1].sender._id === undefined) &&
        (messages[i].sender._id !== userId)
    )
}

export const isLastMessage = (messages, i, userId) => {
    return (
        (i === messages.length - 1) && 
        (messages[messages.length - 1].sender._id) && 
        (messages[messages.length - 1].sender._id !== userId)
    );
}


export const isSameSenderMargin = (messages, m, i, userId) => {  
    if (
      i < messages.length - 1 &&
      messages[i + 1].sender._id === m.sender._id &&
      messages[i].sender._id !== userId 
    ){
        return "33px";
    }else if (
      (i < messages.length - 1 &&
        messages[i + 1].sender._id !== m.sender._id &&
        messages[i].sender._id !== userId) ||
      (i === messages.length - 1 && messages[i].sender._id !== userId)
    ){
        return "0";
    }else{ 
        return "auto";
    }
}

export const isSameUser = (messages, m, i) => {
    return i > 0 && messages[i - 1].sender._id === m.sender._id;
}