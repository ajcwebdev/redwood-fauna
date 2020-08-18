export const QUERY = gql`
  query POSTS {
    posts {
      title
    }
  }
`
export const Loading = () => <div>Loading posts...</div>
export const Empty = () => <div>No posts yet!</div>
export const Failure = ({ message }) => <div>Error: {message}</div>
export const Success = ({ posts }) => {
  return (
    <ul>
      { posts.map(post => (
        <li>{post.title}</li>
      ))}
    </ul>
  )
}