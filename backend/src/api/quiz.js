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
    try {
        await client.connect();

        const alreadyAnswered = await client.db('resources').collection('enrollments').findOne({
            training_cod: req.params.cod,
            username: req.session.username,
            score: { $exists: true },
        });

        if (alreadyAnswered !== null) {
            return res.redirect('/home?error=alreadyAnswered');
        }

        const trainings = client.db('resources').collection('trainings');

        const training = await trainings.findOne({ cod: req.params.cod });

        res.render(`../../../frontend/public/views/quiz.ejs`, { items: training.all_questions, cod: req.params.cod }, (err, html) => {
            if (err) {
                console.log(err);
            }
            else {
                res.send(html);
            }
        });
    }
    catch (err) {
        console.log(err);
    }
    finally {
        await client.close();
    }
});

router.post('/:cod', async (req, res) => {
    try {
        await client.connect();

        const trainings = client.db('resources').collection('trainings');

        const training = await trainings.findOne({ cod: req.params.cod });

        let score = 0;
        let answerIndex = 1;
        let questions = 0;

        for (let i = 0; i < training.all_questions.length; i++) {
            if (training.all_questions[i].startsWith('Pergunta')) {
                if (req.body[`answer-${answerIndex}`] === training.all_questions[i + 1]) {
                    score++;
                    answerIndex++;
                }

                questions++;
            }
        }

        const enrollments = client.db('resources').collection('enrollments');
        const enrollment = await enrollments.findOne({ training_cod: req.params.cod, username: req.session.username });

        if (!enrollment.score) {
            let pass = true;

            if (score / questions < 0.7) {
                pass = false;
            }

            await enrollments.updateOne({ training_cod: req.params.cod, username: req.session.username },
                {
                    $set: {
                        score: score,
                        pass: pass
                    }
                });

            res.render(`../../../frontend/public/views/quiz-result.ejs`, { score: score, pass: pass, questions: questions }, (err, html) => {
                if (err) {
                    console.log(err);
                }
                else {
                    res.send(html);
                }

                res.end();
            });
        }
        else {
            res.render(`../../../frontend/public/views/quiz-result.ejs`, { score: null, pass: null, questions: null }, (err, html) => {
                if (err) {
                    console.log(err);
                }
                else {
                    res.send(html);
                }

                res.end();
            });
        }
    }
    catch (err) {
        console.log(err);
    }
    finally {
        await client.close();
    }
});

module.exports = router;
