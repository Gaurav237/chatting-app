import React from 'react';
import ScrollableFeed from 'react-scrollable-feed';
import { isLastMessage, isSameSender, isSameSenderMargin, isSameUser } from '../../config/ChatMethods';
import { ChatState } from '../../context/ChatProvider';
import { Avatar, Tooltip } from '@chakra-ui/react';

const ScrollableChat = ({ messages }) => {
  const { user } = ChatState();

  return (
    <ScrollableFeed>
      { messages && messages.map((m, i) => {
          return ( <div key={m._id} style={{ display: 'flex' }}>
              {( isSameSender(messages, m, i, user._id) || isLastMessage(messages, i, user._id) ) && (
              <>
                <Tooltip label={m.sender.name} placement='auto' hasArrow>
                  <Avatar
                    name={m.sender.name}
                    src={m.sender.pic}
                    mt={'7'} mr={1}
                    size={'sm'}
                    cursor={'pointer'}
                  />
                </Tooltip>
              </>
            )}

            <span style={{
                backgroundColor: `${
                  m.sender._id === user._id ? "#BEE3F8" : "#B9F5D0"
                }`,
                marginLeft: isSameSenderMargin(messages, m, i, user._id),
                marginTop: isSameUser(messages, m, i, user._id) ? "3px" : "10px",
                borderRadius: "20px",
                padding: "10px",
                maxWidth: "75%",
              }}
            >
              {m.content}
            </span>

          </div>
          );
      })}
    </ScrollableFeed>
  );
};

export default ScrollableChat;
