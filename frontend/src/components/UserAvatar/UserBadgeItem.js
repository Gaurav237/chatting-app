import { CloseIcon } from '@chakra-ui/icons'
import { Box } from '@chakra-ui/react'
import React from 'react'

const UserBadgeItem = ({user, handleFunction, admin}) => {
  return (
    <Box
        px={2} py={1}
        m={1} mb={2}
        borderRadius="lg"
        variant="solid"
        fontSize={14}
        bg='#38A9B2'
        color="white"
        cursor="pointer"
        onClick={handleFunction}
    >
        {user.name}
        <CloseIcon pl={1} />
    </Box>
  )
}

export default UserBadgeItem
