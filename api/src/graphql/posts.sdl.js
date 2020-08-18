import gql from 'graphql-tag'

export const schema = gql`
  type Post {
    title: String!
  }

  type Query {
    posts: [Post!]!
  }
`