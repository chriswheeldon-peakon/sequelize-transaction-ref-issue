import "dotenv/config";

import { Sequelize, DataTypes } from "sequelize";
import { createNamespace } from "cls-hooked";

const cls = createNamespace("test");
Sequelize.useCLS(cls);

/**
 * Database schema setup
 */

const schema = "dev";
const sequelize = new Sequelize({
  dialect: "postgres",
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  username: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  schema,
});
await sequelize.createSchema(schema);

/**
 * Define two related identities
 */

const Entity = sequelize.define(
  "entity",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
  },
  { tableName: "entity", schema, timestamps: false, paranoid: false }
);

const Relation = sequelize.define(
  "relation",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
  },
  { tableName: "relation", schema, timestamps: false, paranoid: false }
);

Entity.hasOne(Relation);
await sequelize.sync({ force: true });

/**
 * Insert one entity and a relation into the database
 */

const relation = await Relation.create({});
const entity = await Entity.create({ relationId: relation.id });

/**
 * MAIN
 *
 * Periodically execute a transaction inside a cls context
 */

setInterval(async () => {
  await cls.runPromise(async () => {
    await sequelize.transaction(transaction);
  });
}, 1000);

async function transaction(t) {
  /**
   * Store the promise for a given load on the transaction i.e. as we do
   * with our dataloaders. Once loaded store a reference to the model (as
   * we do with the Auth and Session)
   *
   * The promise contains a reference to the model. And that model, since
   * the recent change, when loaded with an include, contains a reference
   * to the transaction. In this way we create a circular reference between
   * the transaction and the model.
   *
   * Once loaded we store a reference to the Entity itself on cls. In this
   * way, even after sequelize removes the transaction from cls, there
   * remains a live reference to the promise, via the transaction, from
   * cls. Consequently, the promise is never destroyed and cls never
   * receives a destroy event from which it can destroy the context state.
   */
  const entityPromise = Entity.findOne({
    where: {
      id: entity.id,
    },
    include: [
      {
        model: Relation,
      },
    ],
  });
  t.entityPromise = entityPromise;
  const result = await entityPromise;
  cls.set("entity", result);
}
