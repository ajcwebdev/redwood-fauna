import { query as q } from "faunadb"
import { db } from 'src/lib/db'

export const posts = () => {
  return db.query(q.Map(
    q.Paginate(q.Match(q.Index("all_posts"))),
    q.Lambda("postRef", q.Get(q.Var("postRef")))))
}