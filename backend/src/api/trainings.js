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

router.get('/', (req, res) => {
    async function fetchTrainings() {
        try {
            await client.connect();
            const trainings = await client.db('resources').collection('trainings').find().toArray();

            res.send(JSON.stringify(trainings)).end();
        }
        catch (err) {
            console.dir(err);
        }
        finally {
            await client.close();
        }
    }

    fetchTrainings();
});

router.post('/enroll', (req, res) => {
    async function enrollTraining(session) {
        try {
            await client.connect();

            const trainingToEnroll = await client.db('resources').collection('trainings').findOne({
                cod: req.body.cod,
            });

            if (trainingToEnroll === null) {
                return res.status(404).send().end();
            }

            const user = await client.db('accounts').collection('users').findOne({
                username: session.username,
            });

            if (user === null) {
                return res.status(404).send().end();
            }

            const enrollment = await client.db('resources').collection('enrollments').findOne({
                training_cod: req.body.cod,
                user_id: user._id.toString(),
            });

            if (enrollment !== null) {
                return res.status(409).send().end();
            }

            await client.db('resources').collection('enrollments').insertOne({
                training_cod: req.body.cod,
                user_id: user._id.toString(),
                username: session.username,
            });
        }
        catch (err) {
            console.dir(err);
        }
        finally {
            await client.close();
        }
    }

    enrollTraining(req.session);
    res.status(204).send().end();
});

router.delete('/unenroll', (req, res) => {
    async function unenrollTraining(session) {
        try {
            await client.connect();

            const trainingToUnenroll = await client.db('resources').collection('trainings').findOne({
                cod: req.body.cod,
            });

            if (trainingToUnenroll === null) {
                return res.status(404).send().end();
            }

            const user = await client.db('accounts').collection('users').findOne({
                username: session.username,
            });

            if (user === null) {
                return res.status(404).send().end();
            }

            const enrollment = await client.db('resources').collection('enrollments').findOne({
                training_cod: req.body.cod,
                user_id: user._id.toString(),
            });

            if (enrollment === null) {
                return res.status(409).send().end();
            }

            await client.db('resources').collection('enrollments').deleteOne({
                training_cod: req.body.cod,
                user_id: user._id.toString(),
            });
        }
        catch (err) {
            console.dir(err);
        }
        finally {
            await client.close();
        }
    }

    unenrollTraining(req.session);
    res.status(204).send().end();
});

router.post('/is-enrolled', (req, res) => {
    async function isEnrolled(session) {
        try {
            await client.connect();

            const trainingToCheck = await client.db('resources').collection('trainings').findOne({
                cod: req.body.cod,
            });

            if (trainingToCheck === null) {
                return res.status(208).send().end();
            }

            const user = await client.db('accounts').collection('users').findOne({
                username: session.username,
            });

            if (user === null) {
                return res.status(208).send().end();
            }

            const enrollment = await client.db('resources').collection('enrollments').findOne({
                training_cod: req.body.cod,
                user_id: user._id.toString(),
                username: session.username,
            });

            if (enrollment === null) {
                return res.status(208).send(JSON.stringify(enrollment)).end();
            }

            res.status(200);
            res.send(JSON.stringify(enrollment));
            return res.end();
        }
        catch (err) {
            console.dir(err);
        }
        finally {
            await client.close();
        }
    }

    isEnrolled(req.session);
});

router.post('/date-range', (req, res) => {
    async function getEndDate() {
        try {
            await client.connect();

            const today = new Date();

            const enrollmentEnd = await client.db('resources').collection('trainings').findOne({
                cod: req.body.cod,
            });

            const todaysDay = today.getDate();
            const todaysMonth = today.getMonth() + 1;

            const enrollmentEndDay = Number(enrollmentEnd.enroll_end.split('-')[2]);
            const enrollmentEndMonth = Number(enrollmentEnd.enroll_end.split('-')[1]);

            const enrollmentStartDay = Number(enrollmentEnd.enroll_start.split('-')[2]);
            const enrollmentStartMonth = Number(enrollmentEnd.enroll_start.split('-')[1]);

            if ((todaysMonth >= enrollmentEndMonth && todaysDay > enrollmentEndDay) || (todaysMonth > enrollmentEndMonth && todaysDay >= enrollmentEndDay)) {
                return res.send(JSON.stringify({ message: 'Inscrições Encerradas' })).end();
            }
            else if ((todaysMonth <= enrollmentStartMonth && todaysDay < enrollmentStartDay) || (todaysMonth < enrollmentStartMonth && todaysDay <= enrollmentStartDay)) {
                return res.send(JSON.stringify({ message: 'Inscrições não começaram' })).end();
            }

            return res.send(JSON.stringify({ message: null })).end();
        }
        catch (err) {
            console.dir(err);
        }
        finally {
            await client.close();
        }
    }

    getEndDate();
});

router.post('/is-reproved', (req, res) => {
    async function isReproved(session) {
        try {
            await client.connect();

            const trainingToCheck = await client.db('resources').collection('trainings').findOne({
                cod: req.body.cod,
            });

            if (trainingToCheck === null) {
                return res.status(208).send().end();
            }

            const user = await client.db('accounts').collection('users').findOne({
                username: session.username,
            });

            if (user === null) {
                return res.status(208).send().end();
            }

            const enrollment = await client.db('resources').collection('enrollments').findOne({
                training_cod: req.body.cod,
                user_id: user._id.toString(),
                username: session.username,
            });

            if (enrollment === null) {
                return res.status(208).send().end();
            }

            if (enrollment.pass === false) {
                return res.status(200).send().end();
            }

            return res.status(208).send().end();
        }
        catch (err) {
            console.dir(err);
        }
        finally {
            await client.close();
        }
    }

    isReproved(req.session);
});

module.exports = router;
