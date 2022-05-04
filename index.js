const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const cores = require('cors')
const app = express()
const jwt = require('jsonwebtoken');
const { json } = require('express');

// middleware 
app.use(cores())
app.use(express.json())
require('dotenv').config()

const port = process.env.PORT || 5000;

//_________________________________verify token_______________________________________
const verifyToken = (req, res, next) => {
    const FullToken = req.headers.token
    if (!FullToken || FullToken === 'null') {
        console.log(5345354435)
        return res.status(401).send({ message: 'Unathorization' })
    }
    const token = FullToken.split(' ')[1]
    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
        req.body = decoded?.email;
        next()
    })

    // const 


}


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.5xr8v.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const run = async () => {
    try {
        await client.connect()
        const ItemCollection = client.db("ItemManage").collection('Item')

        //------------------------------- authorization =--------------------------------------
        app.post('/login', async (req, res) => {
            const email = req.body.email;
            const token = jwt.sign({ email }, process.env.SECRET_KEY, {
                expiresIn: '1d'
            })
            res.send(token)
        })
        //__________________________________ get my item ________________________________
        app.get('/my-items/:id', verifyToken, async (req, res) => {

            const { id } = req.params;
            const page = parseInt(req.query.page);
            const skip = parseInt(req.query.skip);
            const getUserEmail = req.query.email;
            const email = req.body;
            if (email === getUserEmail) {
                const query = { userId: id };
                const count = await ItemCollection.countDocuments(query)


                const cursor = ItemCollection.find(query).skip(skip * page).limit(skip);
                const result = await cursor.toArray()
                res.send({ data: result, count })
            }
            else {
                res.status(403).send({ message: 'forbidden access' })
            }

        })
        //_________________________for get item from database ______________________________
        app.get('/item', async (req, res) => {
            const query = {}
            const page = parseInt(req.query.page);
            const skip = parseInt(req.query.skip);
            const count = await ItemCollection.estimatedDocumentCount();
            
            const cursor = ItemCollection.find({}).skip(skip * page).limit(skip)
            const result = await cursor.toArray()
            res.send({data:result, count})
        })

        //_______________________________ get item one by id _______________________
        app.get('/item/:id', async (req, res) => {
            const id = req.params;
            const query = { _id: ObjectId(id) }
            const cursor = await ItemCollection.findOne(query)
            res.send(cursor)
        })
        // ______________________________for add item ____________________________________
        app.post('/item', async (req, res) => {
            const item = req.body
            const result = await ItemCollection.insertOne(item)
            res.send(result)
        })
        // ____________________________________updata item  ____________________________
        app.put('/item/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const option = { upsert: true }
            const updateItem = {
                $set: req.body
            }
            const result = await ItemCollection.updateOne(filter, updateItem, option)
            res.send(result)

        })
        //_______________________delete item_____________________ 
        app.delete('/item/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await ItemCollection.deleteOne(query)
            res.send(result)
        })

    }
    finally {

    }
}
run().catch(console.dir)

app.get('/', (req, res) => {
    res.send('Server runnig')
})
app.listen(port, () => {
    console.log('runnig server', port)
})