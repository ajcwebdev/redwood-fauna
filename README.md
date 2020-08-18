# Redwood

## Getting Started
- [Redwoodjs.com](https://redwoodjs.com): home to all things RedwoodJS.
- [Tutorial](https://redwoodjs.com/tutorial/welcome-to-redwood): getting started and complete overview guide.
- [Docs](https://redwoodjs.com/docs/introduction): using the Redwood Router, handling assets and files, list of command-line tools, and more.
- [Redwood Community](https://community.redwoodjs.com): get help, share tips and tricks, and collaborate on everything about RedwoodJS.

### Setup

We use Yarn as our package manager. To get the dependencies installed, just do this in the root directory:

```terminal
yarn install
```

### Fire it up

```terminal
yarn redwood dev
```

Your browser should open automatically to `http://localhost:8910` to see the web app. Lambda functions run on `http://localhost:8911` and are also proxied to `http://localhost:8910/api/functions/*`.

### Updating Redwood

Redwood comes with a helpful command to update itself and its dependencies. Why not try a new and improved version today?

> :point_right: IMPORTANT: Skipping versions when upgrading is not recommended and will likely cause problems. Do read through all [Release Notes](https://github.com/redwoodjs/redwood/releases) between your current version and the latest version. Each minor release will likely require you to implement breaking change fixes and apply manual code modifications.

```terminal
yarn rw upgrade
```

## Development

### Database

By default Redwood uses [Prisma2](https://github.com/prisma/prisma2) to query, migrate and model your database. It works with [a variety of modern databases](https://www.prisma.io/docs/more/supported-databases) including Postgres, MySQL, MariaDB, SQLite, and AWS Aurora. They are continuing to expand this list, but as of the time of this writing they do not support FaunaDB. We will start by removing the `prisma` folder from our `api/src` folder. We also will delete all the code in `db.js` which is instantiating the Prisma client. We will be using the Fauna client in its place.
