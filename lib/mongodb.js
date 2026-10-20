import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

// Reutiliza o cliente entre pedidos (evita abrir uma ligação nova a cada request)
let clientPromise;

if (!global._mongoClientPromise) {
  global._mongoClientPromise = new MongoClient(uri).connect();
}
clientPromise = global._mongoClientPromise;

export default clientPromise;
