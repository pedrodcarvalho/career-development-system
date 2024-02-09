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

router.get('/:cod', async (req, res) => {
    async function fetchCourse() {
        try {
            await client.connect();

            const courseName = await client.db('resources').collection('trainings').findOne({
                cod: req.params.cod,
            });

            const track = await client.db('resources').collection('tracks').findOne({
                cod: req.params.cod,
            });

            if (courseName === null) {
                return res.status(404).send().end();
            }

            res.render(`../../../frontend/public/views/course.ejs`, { courseName: courseName.name, cod: req.params.cod, introCourses: track.intro_courses, firstCase: track.first_case, advCourses: track.adv_courses, secondCase: track.second_case }, (err, html) => {
                if (err) {
                    console.log(err);
                }
                else {
                    res.send(html);
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

    fetchCourse();
});

router.post('/update', (req, res) => {
    async function updateCourse() {
        try {
            await client.connect();

            const courseToUpdate = await client.db('resources').collection('enrollments').findOne({
                training_cod: req.body.cod,
            });

            if (courseToUpdate === null) {
                return res.status(404).send().end();
            }

            if (req.body.completed === 'on') {
                await client.db('resources').collection('enrollments').updateOne({
                    training_cod: req.body.cod,
                    username: req.session.username,
                }, {
                    $set: {
                        completed: true,
                    }
                });
            }

            res.status(204).send().end();
        }
        catch (err) {
            console.dir(err);
        }
        finally {
            await client.close();
        }
    }

    updateCourse();
});

module.exports = router;
