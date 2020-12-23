# Introduction

### RedwoodJS

[RedwoodJS](https://redwoodjs.com/) is an opinionated, full-stack, serverless web application framework for building and deploying JAMstack applications. It was created by Tom-Preston Werner and combines a variety of technologies and techniques that have been influencing the industry over the last 5-10 years. This includes:
* React frontend
* Statically delivered files served from a CDN
* GraphQL to connect your frontend and backend
* AWS Lambdas for serverless deployment
* Deployable with a single git push command

>*My dream of a future is for something I call a universal deployment machine, which means I write my code. It's all text, I just write text. Then I commit to GitHub. Then it's picked up and it's deployed into reality. That's it, that's the whole thing.*
>
>***Tom Preston Warner***
>***[RedwoodJS Shoptalk (May 11, 2020)](https://shoptalkshow.com/412/)***

### FaunaDB

[FaunaDB](https://dashboard.fauna.com/accounts/register?utm_source=DevTo&utm_medium=referral&utm_campaign=WritewithFauna_RedwoodJS_ACampolo) is a serverless global database designed for low latency and developer productivity. It has proven to be particularly appealing to Jamstack developers for its global scalability, native GraphQL API, and FQL query language.

>*Being a serverless distributed database, the JAMstack world is a natural fit for our system, but long before we were chasing JAMstack developers, we were using the stack ourselves.*
>
>***Matt Attaway***
>***[Lessons Learned Livin' La Vida JAMstack (January 24, 2020)](https://fauna.com/blog/lessons-learned-livin-la-vida-jamstack)***

In this post, we will walk through how to create an application with RedwoodJS and FaunaDB.

# Redwood Monorepo

### Create Redwood App

To start we'll create a new Redwood app from scratch with the Redwood CLI. If you don't have yarn installed enter the following command:

```
brew install yarn
```

Now we'll use `yarn create redwood-app` to generate the basic structure of our app.

```
yarn create redwood-app ./redwood-fauna
```

I've called my project `redwood-fauna` but feel free to select whatever name you want for your application. We'll now `cd` into our new project and use `yarn rw dev` to start our development server.

```
cd redwood-fauna
yarn rw dev
```

Our project's frontend is running on `localhost:8910` and our backend is running on `localhost:8911` ready to receive GraphQL queries.

![01-redwood-starter-page](https://dev-to-uploads.s3.amazonaws.com/i/1r9g4fam6m776cegi050.jpg)

### Redwood Directory Structure

One of Redwood's guiding philosophies is that there is power in standards, so it makes decisions for you about which technologies to use, how to organize your code into files, and how to name things.

It can be a little overwhelming to look at everything that's already been generated for us. The first thing to pay attention to is that Redwood apps are separated into two directories:
* `api` for backend
* `web` for frontend

```
├── api
│   ├── prisma
│   │   ├── schema.prisma
│   │   └── seeds.js
│   └── src
│       ├── functions
│       │   └── graphql.js
│       ├── graphql
│       ├── lib
│       │   └── db.js
│       └── services
└── web
    ├── public
    │   ├── favicon.png
    │   ├── README.md
    │   └── robots.txt
    └── src
        ├── components
        ├── layouts
        ├── pages
            ├── FatalErrorPage
            │   └── FatalErrorPage.js
            └── NotFoundPage
                └── NotFoundPage.js
        ├── index.css
        ├── index.html
        ├── index.js
        └── Routes.js
```

Each side has their own path in the codebase. These are managed by Yarn [workspaces](https://classic.yarnpkg.com/en/docs/workspaces/). We will be talking to the Fauna client directly so we can delete the `prisma` directory along with the files inside it and we can delete all the code in `db.js`.

### Pages

With our application now set up we can start creating pages. We'll use the `generate page` command to create a home page and a folder to hold that page. Instead of `generate` we can use `g` to save some typing.

```
yarn rw g page home /
```

![02-generated-HomePage](https://dev-to-uploads.s3.amazonaws.com/i/thsmbc0k01fy2kkqifez.jpg)

If we go to our `web/src/pages` directory we'll see a `HomePage` directory containing this `HomePage.js` file:

```javascript
// web/src/pages/HomePage/HomePage.js

import { Link } from '@redwoodjs/router'

const HomePage = () => {
  return (
    <>
      <h1>HomePage</h1>
      <p>Find me in "./web/src/pages/HomePage/HomePage.js"</p>
      <p>
        My default route is named "home", link to me with `
        <Link to="home">routes.home()</Link>`
      </p>
    </>
  )
}

export default HomePage
```

Let's clean up our component. We'll only have a single route for now so we can delete the `Link` import and `routes.home()`, and we'll delete everything except a single `<h1>` tag.

```javascript
// web/src/pages/HomePage/HomePage.js

const HomePage = () => {
  return (
    <>
      <h1>RedwoodJS+Fauna</h1>
    </>
  )
}

export default HomePage
```

![03-new-HomePage](https://dev-to-uploads.s3.amazonaws.com/i/xonoxk1scqkms8wazyvo.jpg)

### Cells

Cells provide a simpler and more declarative approach to data fetching. They contain the GraphQL query, loading, empty, error, and success states, each one rendering itself automatically depending on what state your cell is in.

Create a folder in `web/src/components` called `PostsCell` and inside that folder create a file called `PostsCell.js` with the following code:

```javascript
// web/src/components/PostsCell/PostsCell.js

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
```

We’re exporting a GraphQL query that will fetch the posts in the database. We use object destructuring to access the data object and then we map over that response data to display a list of our posts. To render our list of posts we need to import `PostsCell` in our `HomePage.js` file and return the component.

```javascript
// web/src/pages/HomePage/HomePage.js

import PostsCell from 'src/components/PostsCell'

const HomePage = () => {
  return (
    <>
      <h1>RedwoodJS+Fauna</h1>
      <PostsCell />
    </>
  )
}

export default HomePage
```

![04-PostsCell-no-posts](https://dev-to-uploads.s3.amazonaws.com/i/5rrw7dxffhp3qsu37d7k.jpg)

### Schema Definition Language

In our `graphql` directory we'll create a file called `posts.sdl.js` containing our GraphQL schema. In this file we'll export a schema object containing our GraphQL schema definition language. It is defining a `Post` type which has a `title` that is the type of `String`.

Fauna automatically creates a `PostPage` type for pagination which has a data type that'll contain an array with every `Post`. When we create our database you will need to import this schema so Fauna knows how to respond to our GraphQL queries.

```javascript
// api/src/graphql/posts.sdl.js

import gql from 'graphql-tag'

export const schema = gql`
  type Post {
    title: String
  }

  type PostPage {
    data: [Post]
  }

  type Query {
    posts: PostPage
  }
`
```

### DB

When we generated our project, `db` defaulted to an instance of `PrismaClient`. Since Prisma does not support Fauna at this time we will be using the `graphql-request` library to query Fauna's GraphQL API. First make sure to add the library to your project.

```
yarn add graphql-request graphql
```

To access our FaunaDB database through the GraphQL endpoint we’ll need to set a request header containing our database key. We’ll see how to create our database key later in this tutorial.

```javascript
// api/src/lib/db.js

import { GraphQLClient } from 'graphql-request'

export const request = async (query = {}) => {
  const endpoint = 'https://graphql.fauna.com/graphql'

  const graphQLClient = new GraphQLClient(endpoint, {
    headers: {
      authorization: 'Bearer <FAUNADB_KEY>'
    },
  })
  try {
    return await graphQLClient.request(query)
  } catch (error) {
    console.log(error)
    return error
  }
}
```

### Services

In our services directory we'll create a posts directory with a file called `posts.js`. Services are where Redwood centralizes all business logic. These can be used by your GraphQL API or any other place in your backend code. The posts function is querying the Fauna GraphQL endpoint and returning our posts data so it can be consumed by our `PostsCell`.

```javascript
// api/src/services/posts/posts.js

import { request } from 'src/lib/db'
import { gql } from 'graphql-request'

export const posts = async () => {
  const query = gql`
  {
    posts {
      data {
        title
      }
    }
  }
  `

  const data = await request(query, 'https://graphql.fauna.com/graphql')

  return data['posts']
}
```

### GraphQL Serverless Function

Files in `api/src/functions` are serverless functions. Most of `@redwoodjs/api` is for setting up the GraphQL API Redwood Apps come with by default. It happens in essentially four steps:
1. Everything (i.e. sdl and `services`) is imported
2. The `services` are wrapped into resolvers
3. The sdl and resolvers are merged/stitched into a `schema`
4. The `ApolloServer` is instantiated with said merged/stitched `schema` and `context`

```javascript
// api/src/functions/graphql.js

import {
  createGraphQLHandler,
  makeMergedSchema,
  makeServices,
} from '@redwoodjs/api'

import schemas from 'src/graphql/**/*.{js,ts}'
import services from 'src/services/**/*.{js,ts}'

import { db } from 'src/lib/db'

export const handler = createGraphQLHandler({
  schema: makeMergedSchema({
    schemas,
    services: makeServices({ services }),
  }),
  db,
})
```

Let's take one more look at our entire directory structure before moving on to the Fauna Shell.

```
├── api
│   └── src
│       ├── functions
│       │   └── graphql.js
│       ├── graphql
│       │   └── posts.sdl.js
│       ├── lib
│       │   └── db.js
│       └── services
│           └── posts
│               └── posts.js
└── web
    ├── public
    │   ├── favicon.png
    │   ├── README.md
    │   └── robots.txt
    └── src
        ├── components
        │   └── PostsCell
        │       └── PostsCell.js
        ├── layouts
        ├── pages
            ├── FatalErrorPage
            ├── HomePage
            │   └── HomePage.js
            └── NotFoundPage
        ├── index.css
        ├── index.html
        ├── index.js
        └── Routes.js
```

# Fauna Database

### Create FaunaDB account

You'll need a [FaunaDB](https://dashboard.fauna.com/accounts/register?utm_source=DevTo&utm_medium=referral&utm_campaign=WritewithFauna_RedwoodJS_ACampolo) account to follow along but it's free for creating simple low traffic databases. You can use your email to create an account or you can use your Github or Netlify account. FaunaDB Shell does not currently support GitHub or Netlify logins so using those will add a couple extra steps when we want to authenticate with the fauna-shell.

First we will install the fauna-shell which will let us easily work with our database from the terminal. You can also go to your dashboard and use Fauna's Web Shell.

```
npm install -g fauna-shell
```

Now we'll login to our Fauna account so we can access a database with the shell.

```
fauna cloud-login
```

You'll be asked to verify your email and password. If you signed up for FaunaDB using your GitHub or Netlify credentials, follow [these steps](https://docs.fauna.com/fauna/current/start/cloud-github), then skip the Create New Database section and continue this tutorial at the beginning of the Collections section.

### Create New Database

To create your database enter the `fauna create-database` command and give your database a name.

```
fauna create-database my_db
```

To start the fauna shell with our new database we'll enter the `fauna shell` command followed by the name of the database.

```
fauna shell my_db
```

### Import Schema

Save the following code into a file called sdl.gql and import it to your database:

```gql
type Post {
  title: String
}
type Query {
  posts: [Post]
}
```

![Alt Text](https://dev-to-uploads.s3.amazonaws.com/i/dljgy4s4wgu8zdxnt03x.jpg)

### Collections

To test out our database we'll create a collection with the name Post. A database’s schema is defined by its collections, which are similar to tables in other databases. After entering the command fauna shell will respond with the newly created `Collection`.

```javascript
CreateCollection({ name: "Post" })
```

```javascript
{
  ref: Collection("Post"),
  ts: 1597718505570000,
  history_days: 30,
  name: 'Post'
}
```

### Create

The `Create` function adds a new document to a collection. Let's create our first blog post:

```javascript
Create(
  Collection("Post"),
  {
    data: {
      title: "Deno is a secure runtime for JavaScript and TypeScript"
    }
  }
)
```

```javascript
{
  ref: Ref(Collection("Post"), "274160525025214989"),
  ts: 1597718701303000,
  data: {
    title: "Deno is a secure runtime for JavaScript and TypeScript"
  }
}
```

### Map

We can create multiple blog posts with the `Map` function. We are calling `Map` with an array of posts and a `Lambda` that takes `post_title` as its only parameter. `post_title` is then used inside the `Lambda` to provide the title field for each new post.

```javascript
Map(
  [
    "Vue.js is an open-source model–view–viewmodel JavaScript framework for building user interfaces and single-page applications",
    "NextJS is a React framework for building production grade applications that scale"
  ],
  Lambda("post_title",
    Create(
      Collection("Post"),
      {
        data: {
          title: Var("post_title")
        }
      }
    )
  )
)
```

```javascript
[
  {
    ref: Ref(Collection("Post"), "274160642247624200"),
    ts: 1597718813080000,
    data: {
      title:
        "Vue.js is an open-source model–view–viewmodel JavaScript framework for building user interfaces and single-page applications"
    }
  },
  {
    ref: Ref(Collection("Post"), "274160642247623176"),
    ts: 1597718813080000,
    data: {
      title:
        "NextJS is a React framework for building production grade applications that scale"
    }
  }
]
```

### Get

The `Get` function retrieves a single document identified by ref. We can query for a specific post by using its ID.

```javascript
Get(
  Ref(
    Collection("Post"), "274160642247623176"
  )
)
```

```javascript
{
  ref: Ref(Collection("Post"), "274160642247623176"),
  ts: 1597718813080000,
  data: {
    title:
      "NextJS is a React framework for building production grade applications that scale"
  }
}
```

### Indexes

Now we'll create an index for retrieving all the posts in our collection.

```javascript
CreateIndex({
  name: "posts",
  source: Collection("Post")
})
```

```javascript
{
  ref: Index("posts"),
  ts: 1597719006320000,
  active: true,
  serialized: true,
  name: "posts",
  source: Collection("Post"),
  partitions: 8
}
```

### Match

`Index` returns a reference to an index which `Match` accepts and uses to construct a set. `Paginate` takes the output from `Match` and returns a `Page` of results fetched from Fauna. Here we are returning an array of references.

```javascript
Paginate(
  Match(
    Index("posts")
  )
)
```

```javascript
{
  data: [
    Ref(Collection("Post"), "274160525025214989"),
    Ref(Collection("Post"), "274160642247623176"),
    Ref(Collection("Post"), "274160642247624200")
  ]
}
```

### Lambda

We can get an array of references to our posts, but what if we wanted an array of the actual data contained in the reference? We can `Map` over the array just like we would in any other programming language.

```javascript
Map(
  Paginate(
    Match(
      Index("posts")
    )
  ),
  Lambda(
    'postRef', Get(Var('postRef'))
  )
)
```

```javascript
{
  data: [
    {
      ref: Ref(Collection("Post"), "274160525025214989"),
      ts: 1597718701303000,
      data: {
        title: "Deno is a secure runtime for JavaScript and TypeScript"
      }
    },
    {
      ref: Ref(Collection("Post"), "274160642247623176"),
      ts: 1597718813080000,
      data: {
        title:
          "NextJS is a React framework for building production grade applications that scale"
      }
    },
    {
      ref: Ref(Collection("Post"), "274160642247624200"),
      ts: 1597718813080000,
      data: {
        title:
          "Vue.js is an open-source model–view–viewmodel JavaScript framework for building user interfaces and single-page applications"
      }
    }
  ]
}
```

So at this point we have our Redwood app set up with just a single:
* **Page** - `HomePage.js`
* **Cell** - `PostsCell.js`
* **Function** - `graphql.js`
* **SDL** - `posts.sdl.js`
* **Lib** - `db.js`
* **Service** - `posts.js`

We used FQL functions in the Fauna Shell to create a database and seed it with data. FQL functions included:
* **CreateCollection** - Create a collection
* **Create** - Create a document in a collection
* **Map** - Applies a function to all array items
* **Lambda** - Executes an anonymous function
* **Get** - Retrieves the document for the specified reference
* **CreateIndex** - Create an index
* **Match** - Returns the set of items that match search terms
* **Paginate** - Takes a Set or Ref, and returns a page of results

If we return to the home page we'll see our `PostsCell` is fetching the list of posts from our database.

![Alt Text](https://dev-to-uploads.s3.amazonaws.com/i/5acgksshp3pm7pjelvjo.jpg)

And we can also go to our GraphiQL playground on `localhost:8911/graphql`.

![Alt Text](https://dev-to-uploads.s3.amazonaws.com/i/mgzvfzsi2trni7hmpevh.jpg)

RedwoodJS is querying the [FaunaDB](https://dashboard.fauna.com/accounts/register?utm_source=DevTo&utm_medium=referral&utm_campaign=WritewithFauna_RedwoodJS_ACampolo) GraphQL API with our posts service on the backend and fetching that data with our PostsCell on the frontend. If we wanted to extend this further we could add mutations to our schema definition language and implement full CRUD capabilities through our GraphQL client.

If you want to learn more about RedwoodJS you can check out the [documentation](https://redwoodjs.com/docs/introduction) or visit the RedwoodJS [community forum](https://community.redwoodjs.com/). We would love to see what you’re building and we’re happy to answer any questions you have!
