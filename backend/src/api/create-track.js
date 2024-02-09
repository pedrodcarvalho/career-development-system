const express = require('express');
const router = express.Router();

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `${process.env.MONGODB_URI}`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

router.post('/', (req, res) => {
    async function createTrack() {
        try {
            await client.connect();

            const track = await client.db('resources').collection('tracks').insertOne({
                cod: req.body.cod,
                intro_courses: req.body.intro_courses.split(','),
                first_case: req.body.first_case,
                adv_courses: req.body.adv_courses.split(','),
                second_case: req.body.second_case,
            });
        }
        catch (err) {
            console.dir(err);
        }
        finally {
            await client.close();
        }
    }

    createTrack();
});

module.exports = router;
