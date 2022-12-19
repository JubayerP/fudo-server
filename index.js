const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;
const app = express();

// Middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.feivtst.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    const serviceCollection = client.db('fuDo').collection('services');
    const reviewCollection = client.db('fuDo').collection('reviews');
    try {
        app.get('/services', async(req, res) => {
            const cursor = serviceCollection.find({});
            const services = await cursor.limit(3).toArray();
            res.send(services)
       })
        app.get('/allServices', async(req, res) => {
            const cursor = serviceCollection.find({});
            const services = await cursor.toArray();
            res.send(services)
        })

        app.post('/allServices', async (req, res) => {
            const service = req.body;
            const result = await serviceCollection.insertOne(service);
            res.send(result);
        })
        
        app.get('/services/:id', async(req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await serviceCollection.findOne(query);
            res.send(service);
        })

        // Reviews
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.send(result);
        })

        app.get('/reviews', async (req, res) => {
            let query = {};
            if (req.query.email) {
                query = {
                    email: req.query.email
                }
            }
            const cursor = reviewCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })

        app.delete('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await reviewCollection.deleteOne(query);
            res.send(result)
        })
    }
    finally {
        
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Fudo Server is Running')
})

app.listen(port, () => {
    console.log(`Server is Running on port ${port}`);
})