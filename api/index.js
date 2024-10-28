
const express = require('express');
const app = express();
const port = 5000;
const cors = require('cors');

// Middleware to connect to the frontend
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send("folo me");
});

// Import MongoDB client and API version
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// Your MongoDB connection URI
const uri = "mongodb+srv://yash042002:HuWTcgEBT0bcUJsR@cluster0.rsf6d.mongodb.net/items?retryWrites=true&w=majority&appName=Cluster0";


if (!uri) {
    throw new Error('MongoDB connection string is not defined in  file');
}

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

// Function to connect to the MongoDB server
async function run() {
    try {
        // Connect the client to the server
        await client.connect();

        const itemCollections = client.db("ItemInventory").collection("items");

        // Insert an item to the database: POST method
        app.post("/upload-item", async (req, res) => {
            const data = req.body;
            const result = await itemCollections.insertOne(data);
            res.send(result);
        });

        //get items
        app.get("/all-items", async(req, res)=>{
            const items=itemCollections.find();
            const result=await items.toArray();
            res.send(result);
        })

        //update an item data
        app.patch("/item/:id", async(req, res)=>{
            const id=req.params.id;
            // console.log(id);
            const  updateItemData=req.body;
            const filter={_id:new ObjectId(id)};
            const options={upsert:true};

            const updateDoc={
                $set:{
                    ...updateItemData
                }
            }

            //update

            const result=await itemCollections.updateOne(filter, updateDoc, options);
            res.send(result);
        })

        //delete item
        app.delete("/item/:id", async(req, res)=>{
            const id=req.params;
            const filter={_id :new ObjectId(id)};
            const result=await itemCollections.deleteOne(filter);
            res.send(result);

        })



        //find by category
        app.get("/all-items/category", async(req, res)=>{
            let query={};
            if(req.query?.category){
                query={category:req.query.category};

            }
            const result=await itemCollections.find(query).toArray();
            res.send(result);
        })


        //sinlge book

    app.get("/item/:id", async(req, res)=>{
        const id=req.params.id;
        const filter={_id:new ObjectId(id)};
        const result=await itemCollections.findOne(filter);
        res.send(result)
    })




        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
    }
}

// Run the connection function and keep it running
run().catch(console.dir);

// Server listening
app.listen(port, () => {
    console.log(`Server is listening at port ${port}`);
});

module.exports=app
