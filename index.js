const express = require('express')
const app = express()
const cors = require('cors');
const bodyParser = require('body-parser');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();
const { MongoClient } = require('mongodb');

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.r7uyw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
// console.log(uri)


async function run() {
    try {
        await client.connect();
        const database = client.db('dot_camera_db');
        const camerasCollection = database.collection('cameras');
        const userOrders = database.collection("userorders");
        const userReviews = database.collection("reviews");
        const usersCollection = database.collection('users');

        // const usersCollection = database.collection('users');

        app.get("/products", async (req, res) => {
            const cursor = camerasCollection.find({})
            const cameras = await cursor.toArray();
            res.send(cameras)

        })
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            console.log(result);
            res.json(result);
        });
        app.get("/usersorders", async (req, res) => {
            const cursor = userOrders.find({})
            const userInfo = await cursor.toArray();
            res.send(userInfo)
        })
        app.get("/userreviews", async (req, res) => {
            const cursor = userReviews.find({})
            const reviews = await cursor.toArray();
            res.send(reviews)
        })
        app.post("/usersorders", async (req, res) => {
            const usersOrdersInfo = req.body;
            // console.log(usersOrdersInfo)
            const result = await userOrders.insertOne(usersOrdersInfo)
            res.json(result)
        })

        // review API
        app.post("/userreviews", async (req, res) => {
            const reviewdata = req.body
            const result = await userReviews.insertOne(reviewdata)
            res.json(result)
        })
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })
        app.post('/products', async (req, res) => {
            const product = req.body;
            // console.log('confirm', service);

            const result = await camerasCollection.insertOne(product);
            // console.log(result);
            res.json(result)
        });

        // make admin api
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);

        })


        // DELETE API
        app.delete('/usersorders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await userOrders.deleteOne(query);
            res.json(result);
        })
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            // console.log(query)
            const result = await camerasCollection.deleteOne(query);
            res.json(result);
        })

    }
    finally {
        // await client.close();
    }

}

run().catch(console.dir);

app.get("/", (req, res) => {
    res.send("Server is running")
})

app.listen(port, () => {
    console.log("server is running on,", port)
})