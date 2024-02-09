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
    async function createJob() {
        try {
            await client.connect();

            const jobExists = await client.db('resources').collection('jobs').findOne({
                name: req.body.name,
            });

            if (jobExists !== null) {
                return res.status(204).send().end();
            }

            await client.db('resources').collection('jobs').insertOne({
                name: req.body.name,
                company: req.body.company,
                desc: req.body.desc,
                requirements: req.body.requirements,
                wage: req.body.wage,
                associated_trainings: (req.body.associated_trainings).split(','),
                subscribed_users: req.body.subscribed_users !== '' ? (req.body.subscribed_users).split(',') : [],
                created_by: req.session.username,
            });

            res.status(204).send().end();
        }
        catch (err) {
            console.dir(err);
        }
        finally {
            await client.close();
        }
    }

    createJob();
});

router.get('/', (req, res) => {
    async function fetchJobs() {
        try {
            await client.connect();

            const jobs = await client.db('resources').collection('jobs').find().toArray();

            res.send(JSON.stringify(jobs)).end();
        }
        catch (err) {
            console.dir(err);
        }
        finally {
            await client.close();
        }
    }

    fetchJobs();
});

router.get('/available-jobs', (req, res) => {
    async function fetchJobs() {
        try {
            await client.connect();

            const completedTrainings = await client.db('resources').collection('enrollments').find({
                username: req.session.username,
                completed: true,
            }).toArray();

            const completedTrainingsCods = completedTrainings.map(training => training.training_cod);

            const jobs = await client.db('resources').collection('jobs').find().toArray();

            const availableJobs = jobs.filter(job => {
                if (job.associated_trainings.includes([...completedTrainingsCods])) {
                    return true;
                }

                return job.associated_trainings.some(training => completedTrainingsCods.includes(training));
            });

            res.send(JSON.stringify(availableJobs)).end();
        }
        catch (err) {
            console.dir(err);
        }
        finally {
            await client.close();
        }
    }

    fetchJobs();
});

router.get('/company-jobs', (req, res) => {
    async function fetchJobs() {
        try {
            await client.connect();

            const jobs = await client.db('resources').collection('jobs').find({
                created_by: req.session.username,
            }).toArray();

            if (jobs.length === 0) {
                return res.send(JSON.stringify(jobs)).end();
            }

            res.send(JSON.stringify(jobs)).end();
        }
        catch (err) {
            console.dir(err);
        }
        finally {
            await client.close();
        }
    }

    fetchJobs();
});

router.get('/update-list/:name', (req, res) => {
    async function updateJob() {
        try {
            await client.connect();

            const jobToUpdate = await client.db('resources').collection('jobs').findOne({
                name: req.params.name,
            });

            if (jobToUpdate === null) {
                return res.status(404).send().end();
            }

            if (jobToUpdate.subscribed_users.includes(req.session.username)) {
                return res.status(204).send().end();
            }

            await client.db('resources').collection('jobs').updateOne({
                name: req.params.name,
            }, {
                $set: {
                    subscribed_users: (jobToUpdate.subscribed_users).concat(req.session.username),
                }
            });

            res.status(204).send().end();
        }
        catch (err) {
            console.dir(err);
        }
        finally {
            await client.close();
        }
    }

    updateJob();
});

router.post('/update-delete', (req, res) => {
    async function updateAndDeleteJob() {
        try {
            await client.connect();

            if (req.body.action === 'Atualizar') {
                const jobToUpdate = await client.db('resources').collection('jobs').findOne({
                    name: req.body.old_name,
                });

                if (jobToUpdate === null) {
                    return res.status(404).send().end();
                }

                await client.db('resources').collection('jobs').updateOne({
                    name: req.body.old_name,
                }, {
                    $set: {
                        name: req.body.name,
                        company: req.body.company,
                        desc: req.body.desc,
                        requirements: req.body.requirements,
                        wage: req.body.wage,
                        associated_trainings: (req.body.associated_trainings).split(','),
                        subscribed_users: req.body.subscribed_users !== '' ? (req.body.subscribed_users).split(',') : [],
                    }
                });

                res.status(204).send().end();
            }
            else if (req.body.action === 'Deletar') {
                await client.db('resources').collection('jobs').deleteOne({
                    name: req.body.old_name,
                });

                res.status(204).send().end();
            }
        }
        catch (err) {
            console.dir(err);
        }
        finally {
            await client.close();
        }
    }

    updateAndDeleteJob();
});

module.exports = router;
