require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");

const uri = process.env.MONGO_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log(
      "âœ… Pinged your deployment. You successfully connected to MongoDB!"
    );
  } catch (err) {
    console.error("âŒ Connection error:", err);
  } finally {
    await client.close();
  }
}
run();

