export const QUERY = gql`
  query POSTS {
    posts {
      data {
        title
      }
    }
  }
`
export const Loading = () => <div>Loading posts...</div>
export const Empty = () => <div>No posts yet!</div>
export const Failure = ({ error }) => <div>Error: {error.message}</div>
export const Success = ({ posts }) => {

  const {data} = posts

  return (
    <ul>
      {data.map(post => (
        <li>{post.title}</li>
      ))}
    </ul>
  )
}

