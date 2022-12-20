const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;
const app = express();

// Middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.feivtst.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


function verifyJWT(req, res, next){
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({message: 'UnAuthorized Access'})
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send({message: 'UnAuthorized Access'})
        }
        req.decoded = decoded;
        next();
    })
}


async function run() {
    const serviceCollection = client.db('fuDo').collection('services');
    const reviewCollection = client.db('fuDo').collection('reviews');
    try {


        app.post('/jwt', (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' })
            res.send({ token });
        })

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
            // const decoded = req.decoded;
            // if (decoded.email !== req.query.email) {
            //     return res.status(403).send({message: 'forbidden'})
            // }
            let query = {};
            if (req.query.email) {
                query = {
                    email: req.query.email
                }
            }
            const cursor = reviewCollection.find(query).sort({date: -1});
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await reviewCollection.findOne(query);
            res.send(result);
        })

        app.put('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const {title, review} = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true }
            
            const updateDoc = {
                $set: {
                    title: title,
                    review: review
                }
            }

            const result = await reviewCollection.updateOne(filter, updateDoc, options)
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