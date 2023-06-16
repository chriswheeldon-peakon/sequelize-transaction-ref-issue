This is intended as a minimal reproducible example for https://github.com/sequelize/sequelize/issues/15749

## Instructions

Firstly, copy `.env.example` to `.env` and set the variables to configure the postgres instance and database to connect to in `index.js`.

Secondly, install dependencies with `npm i`.

Then, `npm run start` to reproduce the bug.

An exception should be printed that shows the malformed select query **n.b.** that the table alias is prefixed with the schema, in this case "dev".

```
Executing (default): SELECT "id", "prop", "createdAt", "updatedAt"
  FROM "dev"."entity" AS "Entity" WHERE "dev"."Entity"."prop" = 'hello, world' LIMIT 1;

...

DatabaseError [SequelizeDatabaseError]: invalid reference to FROM-clause entry for table "Entity"
```
