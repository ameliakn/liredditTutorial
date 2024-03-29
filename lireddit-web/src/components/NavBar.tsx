import { Box, Button, Flex, Heading, Link } from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import NextLink from 'next/link'
import { useLogoutMutation, useMeQuery } from '../generated/graphql'
import { isServer } from '../utils/isServer'
import { useRouter } from 'next/router'

interface NavBarProps {

}

export const NavBar: React.FC<NavBarProps> = ({ }) => {
  const [{ fetching: logoutFetching }, logout] = useLogoutMutation()
  const [{ data, fetching }] = useMeQuery()
  const router = useRouter()

  let body = null

  if (fetching) {

  } else if (!data?.me) {
    body = (
      <>
        < NextLink href="/login" >
          <Link color='white' mr={2}>Login</Link>
        </NextLink >
        <NextLink href="/register">
          <Link color='white' mr={2}>Register</Link>
        </NextLink>
      </>
    )
  } else {
    body = (
      <Flex align='center'>
        <NextLink href="/create-post">
          <Button as={Link} mr={4}>
            create post
          </Button>
        </NextLink>
        <Box mr={2}>{data.me.username}</Box>
        <Button
          onClick={async () => {
            await logout()
            router.reload()
          }}
          variant="link"
          isLoading={logoutFetching}
        >
          Logout
        </Button>
      </Flex>
    )
  }

  return (
    <Flex
      bg='tomato'
      p={4}
      ml={"auto"}
      align='center'
    >
      <Flex
        flex={1}
        m="auto"
        align='center'
        maxW={800}
      >
        <NextLink href='/'>
          <Link>
            <Heading>LiReddit</Heading>
          </Link>
        </NextLink>
        <Box ml={"auto"}>
          {body}
        </Box>
      </Flex>
    </Flex>
  );
}