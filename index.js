// console.log("Index.js is running");
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MongoClient, ObjectId, ServerApiVersion } from "mongodb";

const app = express();
app.use(cors());
app.use(express.json());
dotenv.config();
// MongoDB Code Starts

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@munchy-magic.7c4quek.mongodb.net/?retryWrites=true&w=majority&appName=munchy-magic`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const recipeColletion = client.db("munchy-magic").collection("all-recipes");

    //PATCH like a recipe
    app.patch("/all-recipes/:id/like", async (req, res) => {
      const recipeId = req.params.id;
      console.log("Attempting to like recipe ID:", recipeId);

      if (!ObjectId.isValid(recipeId)) {
        console.error("Invalid recipe ID format:", recipeId);
        return res.status(400).json({ error: "Invalid recipe ID" });
      }

      try {
        const result = await recipeColletion.updateOne(
          { _id: new ObjectId(recipeId) },
          { $inc: { likeCount: 1 } }
        );
        if (result.modifiedCount > 0) {
          res.json({ message: "Like count updated" });
        } else {
          res.status(404).json({ error: "Recipe not found" });
        }
      } catch (error) {
        console.error("Error while updating likes:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    //GET a single recipe detail
    app.get("recipe-details/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await recipeColletion.findOne(query);
      res.send(result);
    });

    //GET single recipe
    app.get("/all-recipes/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await recipeColletion.findOne(query);
      res.send(result);
    });

    //GET all recipes from the db

    app.get("/all-recipes", async (req, res) => {
      const result = await recipeColletion.find().toArray();
      res.send(result);
    });

    //POST a new recipe to the db

    app.post("/recipes", async (req, res) => {
      const newRecipe = req.body;
      console.log(newRecipe);

      const result = await recipeColletion.insertOne(newRecipe);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

// MongoDB Code Ends

const port = process.env.PORT || 3002;

app.get("/", async (req, res) => {
  res.send("Hello World");
});

app.listen(port, () => {
  console.log(`It's running on port: ${port}`);
});
