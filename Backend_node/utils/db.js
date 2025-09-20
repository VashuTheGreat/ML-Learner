const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = "mongodb+srv://vashuthegreat7832:Vansh1234@cluster0.x3hen.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
// const uri="mongodb://vashuthegreat7832:Vansh1234@cluster0-shard-00-00.x3hen.mongodb.net:27017,cluster0-shard-00-01.x3hen.mongodb.net:27017,cluster0-shard-00-02.x3hen.mongodb.net:27017/myDatabase?ssl=true&replicaSet=atlas-zpotlr-shard-0&authSource=admin&retryWrites=true&w=majority"

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function MongoDBConnect(callback) {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("✅ Pinged your deployment. You successfully connected to MongoDB!");
    if (callback) callback(client);
  } finally {
    await client.close();
  }
}

module.exports=MongoDBConnect;
