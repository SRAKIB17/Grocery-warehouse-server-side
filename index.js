const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const cores = require('cors')
const app = express()

// middleware 
app.use(cores())
app.use(express.json())
require('dotenv').config()

const port = process.env.PORT || 5000;
 


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.5xr8v.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const run = async () => {
    try {
        await client.connect()
        const ItemCollection = client.db("ItemManage").collection('Item')
        //_________________________for get item database ______________________________
        app.get('/item', async(req,res)=>{
            const query = {}
            const page = parseInt(req.query.page) - 1;
            const skip = parseInt(req.query.skip);
            const cursor = ItemCollection.find({}).skip(skip*page).limit(skip)
            const result = await cursor.toArray()
            res.send(result)
        })
        //_______________________________ get item one by id _______________________
        app.get('/item/:id', async(req,res)=>{
            const id = req.params;
            const query = {_id: ObjectId(id)}
            const cursor = await ItemCollection.findOne(query)
            res.send(cursor)
        })
        // ______________________________for add item ____________________________________
        app.post('/item', async(req,res)=>{
            const item = req.body
            const result = await ItemCollection.insertOne(item)
            res.send(result)
        })
        // ____________________________________updata item  ____________________________
        app.put('/item/:id', async(req, res)=>{
            const id = req.params.id;
            const filter = {_id: ObjectId(id)}
            const option = {upsert: true} 
            const updateItem = {
                $set: req.body
            } 
            const result = await ItemCollection.updateOne(filter, updateItem, option)
            res.send(result)

        })
        //_______________________delete item_____________________ 
        app.delete('/item/:id', async(req, res)=>{
            const id = req.params.id
            const query = {_id: ObjectId(id)}
            const result = await ItemCollection.deleteOne(query)
            res.send(result)
        })
    }
    finally{
        
    }
}
run().catch(console.dir)

app.get('/', (req, res) => {
    res.send('Server runnig')
})
app.listen(port, () => {
    console.log('runnig server', port)
})