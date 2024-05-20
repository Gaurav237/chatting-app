import React from 'react'
import { Button, IconButton, Image, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text, useDisclosure } from '@chakra-ui/react'
import { ViewIcon } from '@chakra-ui/icons'


const ProfileModal = ({user, children}) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
    
  return (
    <div>
    {/* used same Profile Modal Component to show both logged in User Profile and Chat User Profile */}
    {
        children 
        ? <span onClick={onOpen}>{children}</span>
        : <IconButton display={{base: 'flex'}} icon={<ViewIcon />} onClick={onOpen} />
    }

    <Modal isOpen={isOpen} onClose={onClose} size='md' isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            fontSize='40px'
            fontFamily='Work Sans'
            textAlign={'center'}
          >
            {user.name}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody 
            display='flex'
            flexDirection='column'
            alignItems='center'
          >
            <Image
              boxSize={'150px'}
              src={user.pic}
              alt={user.name}
              my={7}
              borderRadius={'50%'}
              boxShadow={'0 0 20px rgba(0, 0, 0, 0.5)'}
            />

            <Text
              fontSize={{base: '20px', md: '23px'}}
              fontFamily={'Work sans'}
              fontWeight={'bold'}
            >
                Email : {user.email}
            </Text>
            
          </ModalBody>

          <ModalFooter>
            <Button colorScheme='blue' mr={3} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

    </div>
  )
}

export default ProfileModal