const express = require('express');
const router = express.Router();

const path = require('path');

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `${process.env.MONGODB_URI}`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function renderHome(req, res) {
    try {
        await client.connect();

        const user = await client.db('accounts').collection('users').findOne({
            username: req.session.username,
        });

        const userName = user.name;

        let pageType = '';

        switch (user.role) {
            case 'student':
                pageType = 'student';
                break;
            case 'mentor':
                pageType = 'mentor';
                break;
            case 'company':
                pageType = 'company';
                break;
            case 'admin':
                pageType = 'admin';
        }

        res.render(`../../../frontend/public/views/home-${pageType}.ejs`, { name: userName }, (err, html) => {
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

router.post('/signin', (req, res) => {
    if (req.body.username === '' || req.body.password === '') {
        return res.sendFile(path.join(__dirname, '../../../frontend/public/pages/log-in-error.html'));
    }

    const emailRegex = /\S+@\S+\.\S+/;

    if (!emailRegex.test(req.body.username)) {
        return res.sendFile(path.join(__dirname, '../../../frontend/public/pages/log-in-error.html'));
    }

    if (req.body.password.length < 8) {
        return res.sendFile(path.join(__dirname, '../../../frontend/public/pages/log-in-error.html'));
    }

    async function createAccount() {
        try {
            await client.connect();

            req.session.username = req.body.username;
            req.session.password = req.body.password;
            req.session.name = req.body.name;
            req.session.role = req.body.role;

            const user = await client.db('accounts').collection('users').findOne({
                username: req.session.username,
            });

            if (user === null) {
                await client.db('accounts').collection('users').insertOne({
                    username: req.session.username,
                    password: req.session.password,
                    name: req.session.name,
                    role: req.session.role,
                });

                await renderHome(req, res);
            }
            else if (user.username === req.session.username && user.password === req.session.password && user.role === req.session.role && user.name === req.session.name) {
                await renderHome(req, res);
            }
            else {
                res.sendFile(path.join(__dirname, '../../../frontend/public/pages/log-in-error.html'));
            }
        }
        catch (err) {
            console.dir(err);
        }
        finally {
            await client.close();
        }
    }

    createAccount();
});

router.post('/login', (req, res) => {
    async function enterAccount() {
        try {
            await client.connect();

            req.session.username = req.body.username;
            req.session.password = req.body.password;
            req.session.name = req.body.name;
            req.session.role = req.body.role;

            const user = await client.db('accounts').collection('users').findOne({
                username: req.session.username,
                password: req.session.password,
            });

            if (user !== null) {
                await renderHome(req, res);
            }
            else {
                res.sendFile(path.join(__dirname, '../../../frontend/public/pages/log-in-error.html'));
            }
        }
        catch (err) {
            console.dir(err);
        }
        finally {
            await client.close();
        }
    }

    enterAccount();
});

router.get('/', (req, res) => {
    if (req.session.username === undefined || req.session.password === undefined) {
        res.sendFile(path.join(__dirname, '../../../frontend/public/index.html'));
    }
    else {
        renderHome(req, res);
    }
});

module.exports = router;
