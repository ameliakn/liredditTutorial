import { Box, Button, Flex, Heading, Link, Stack, Text } from '@chakra-ui/react';
import { withUrqlClient } from 'next-urql';
import NextLink from 'next/link';
import { useState } from 'react';
import { EditDeletePostButtons } from '../components/EditDeletePostButtons';
import { Layout } from '../components/Layout';
import { UpDootSection } from '../components/UpDootSection';
import { useMeQuery, usePostsQuery } from '../generated/graphql';
import { createUrqlClient } from '../utils/createUrqlClient';


const Index = () => {
  const [variables, setVariables] = useState({
    limit: 15,
    cursor: null as null | string
  })
  const [{ data, error, fetching }] = usePostsQuery({
    variables,
  });


  if (!fetching && !data) {
    return <div>
      <div>query failed</div>
      <div>{error?.message}</div>
      </div>
  }

  return (
    <Layout>
      {!data && fetching
        ? (<div>loading...</div>)
        : (
          <Stack spacing={8}>
            {data!.posts.posts.map((p) =>
              !p ? null :
                (<Flex key={p.id} p={5} shadow='md' borderWidth='1px'>
                  <UpDootSection post={p} />
                  <Box flex={1}>
                    <NextLink href={{
                      pathname: '/post/[id]',
                      query: { id: p.id }
                    }}>
                      <Link>
                        <Heading fontSize='xl'>{p.title}</Heading>
                      </Link>
                    </NextLink>
                    <Text>posted by {p.creator.username}</Text>
                    <Flex align='center'>
                      <Text flex={1} mt={4}>
                        {p.textSnippet}
                      </Text>
                      <Box ml="auto">
                        <EditDeletePostButtons id={p.id} creatorId={p.creator.id} />
                      </Box>
                    </Flex>
                  </Box>
                </Flex>
                )
            )}
          </Stack>
        )}
      {data && data.posts.hasMore ? (
        <Flex>
          <Button onClick={() => {
            setVariables({
              limit: variables.limit,
              cursor: data.posts.posts[data.posts.posts.length - 1].createdAt
            })
          }} isLoading={fetching} m="auto" my={4}>
            Load More
          </Button>
        </Flex>
      ) : null}
    </Layout>
  )
}

export default withUrqlClient(createUrqlClient, { ssr: true })(Index)
