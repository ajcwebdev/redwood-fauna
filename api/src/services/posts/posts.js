import { request } from 'src/lib/db'
import { gql } from 'graphql-request'

export const posts = async () => {
  const query = gql`{
    posts {
      data {
        title
      }
    }
  }`

  const data = await request(query, 'https://graphql.fauna.com/graphql')

  return data['posts']
}