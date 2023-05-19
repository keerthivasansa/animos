# contribute

## Setup

1. fork the repo and clone the `dev` branch

```bash
git clone https://github.com/{user}/animos -b dev
```

2. setup postgresql

3. create a .env file at the root, put something like this in:

```url
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE
```

(for more information, go to [prisma's explanation](https://www.prisma.io/docs/concepts/database-connectors/postgresql))

4. run:

```bash
npm i
npx prisma db push
npx prisma migrate dev
```
