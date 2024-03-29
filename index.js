const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require("cors");
const ObjectId = require("mongodb").ObjectId;

require('dotenv').config()

const app = express();
const port = process.env.PORT || 5000;

// middleware 
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jyrw6.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;



const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db("carMechanics");
        const servicesCollection = database.collection("services");

        // GET API for find multiple data.
        app.get("/services", async (req,res)=>{
            const cursor =  servicesCollection.find({});
            const services = await cursor.toArray();
            res.send(services);
        })
        // GET API for find single data.
        app.get("/service/:id", async (req,res)=>{
            const id = req.params.id;
            const query = {_id:ObjectId(id)};
            const oneService =  await servicesCollection.findOne(query);
            res.send(oneService); 
        })

        // POST API for create single data
        app.post("/service", async (req,res)=>{
            const service = req.body;
            const singleService = await servicesCollection.insertOne(service);
            res.json(singleService);
        });

        app.put("/update/:id", async (req,res)=>{
            const id = req.params.id;
            const updateService = req.body;
            const filter = {_id:ObjectId(id)};
            const options = {upsert:true};
            const updateDoc = {
                $set:{
                    name : updateService.name,
                    price:updateService.price
                }
            }
            const updatedService = await servicesCollection.updateOne(filter,updateDoc,options);
            res.json(updatedService);

        });

        // delete api
        app.delete("/service/:id", async(req,res)=>{
            const id = req.params.id;
            const query = {_id:ObjectId(id)};
            const deleteService = await servicesCollection.deleteOne(query);
            res.send(deleteService)
        })
    }
    finally {
    // await client.close();
    }
    }

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('genius mechanics server is started!');
})

app.listen(port, () => {
    console.log(`app listening at http://localhost:${port}`);
})