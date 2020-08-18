import faunadb from "faunadb"

export const db = new faunadb.Client({ secret: process.env.FAUNADB_SECRET });