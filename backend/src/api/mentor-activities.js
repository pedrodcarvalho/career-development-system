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

router.get('/get-activities', (req, res) => {
    async function isEnrolled() {
        try {
            await client.connect();

            const users = await client.db('accounts').collection('users').find({
                role: 'student',
            }).toArray();

            if (users.length === 0) {
                return res.status(208).send().end();
            }

            const response = {};

            for (let i = 0; i < users.length; i++) {
                const enrollments = await client.db('resources').collection('enrollments').find({
                    username: users[i].username,
                }).toArray();

                response[users[i].username] = enrollments.length > 0 ? [...enrollments].slice(0, 9) : [];
            }

            res.status(200);
            res.send(JSON.stringify(response));
            return res.end();
        }
        catch (err) {
            console.dir(err);
        }
        finally {
            await client.close();
        }
    }

    isEnrolled();
});

module.exports = router;
