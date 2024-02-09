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
    async function postTraining(session) {
        try {
            await client.connect();

            const availableName = await client.db('resources').collection('trainings').findOne({
                name: req.body.name,
            });

            if (availableName !== null) {
                return res.status(409).send().end();
            }

            await client.db('resources').collection('trainings').insertOne({
                name: req.body.name,
                cod: null,
                desc: req.body.desc,
                workload: req.body.workload,
                enroll_start: req.body.enroll_start,
                enroll_end: req.body.enroll_end,
                min_students: req.body.min_students,
                max_students: req.body.max_students,
                training_start: req.body.training_start,
                training_end: req.body.training_end,
                created_by: session.username,
                all_questions: (req.body.all_questions).split(','),
            });

            const training = await client.db('resources').collection('trainings').findOne({
                name: req.body.name,
            });

            await client.db('resources').collection('trainings').updateOne({
                name: req.body.name,
            }, {
                $set: {
                    cod: training._id.toString().slice(-4),
                }
            });
        }
        catch (err) {
            console.dir(err);
        }
        finally {
            await client.close();
        }
    }

    postTraining(req.session);
    res.status(204).send().end();
});

router.get('/your-trainings', (req, res) => {
    async function getYourTrainings(session) {
        try {
            await client.connect();

            const yourTrainings = await client.db('resources').collection('trainings').find({
                created_by: session.username,
            }).toArray();

            res.status(200).send(yourTrainings).end();
        }
        catch (err) {
            console.dir(err);
        }
        finally {
            await client.close();
        }
    }

    getYourTrainings(req.session);
});

router.put('/update', (req, res) => {
    async function updateTraining() {
        try {
            await client.connect();

            await client.db('resources').collection('trainings').updateOne({
                cod: req.body.cod,
            }, {
                $set: {
                    name: req.body.name,
                    desc: req.body.desc,
                    workload: req.body.workload,
                    enroll_start: req.body.enroll_start,
                    enroll_end: req.body.enroll_end,
                    min_students: req.body.min_students,
                    max_students: req.body.max_students,
                    training_start: req.body.training_start,
                    training_end: req.body.training_end,
                    all_questions: req.body.all_questions,
                }
            });
        }
        catch (err) {
            console.dir(err);
        }
        finally {
            await client.close();

            res.status(204).send().end();
        }
    }

    updateTraining();
});

router.delete('/delete', (req, res) => {
    async function deleteTraining() {
        try {
            await client.connect();

            await client.db('resources').collection('trainings').deleteOne({
                cod: req.body.cod,
            });
        }
        catch (err) {
            console.dir(err);
        }
        finally {
            await client.close();

            res.status(204).send().end();
        }
    }

    deleteTraining();
});

module.exports = router;
