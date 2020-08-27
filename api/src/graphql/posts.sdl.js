import gql from 'graphql-tag'

export const schema = gql`
  type PostPage {
    data: [Post]
  }

  type Post {
    title: String
  }

  type Query {
    posts: PostPage
  }
`