import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI);

try {
  await client.connect();
  const meals = client.db("nextlevelfood").collection("meals");

  await meals.createIndex({ slug: 1 }, { unique: true });
  console.log("Índice criado.");
} finally {
  await client.close();
}
