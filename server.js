import express from 'express';
import bodyParser from 'body-parser';
import path, { join, dirname } from 'path';
import { Low, JSONFile } from 'lowdb'
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcrypt';
import SECRET from '../../secret.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function authorization(req, res, next) {
    const token = req.cookies.access_token;

    if (!token) {
        console.log('Unauthorized attempt');
        return res.sendStatus(403);
    }
    try {
        const data = jwt.verify(token, SECRET);
        req.userId = data.id;
        return next();
    } catch {
        console.log('Unauthorized attempt');
        return res.sendStatus(403);
    }
}

app.use(express.static(path.join(__dirname, '..', '..', 'build')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
// app.use(authorization);  // Nope, this would apply the authorization function to EVERYTHING, including login, which makes no sense

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function getDb() {
    const file = join(__dirname, 'db.json');
    const adapter = new JSONFile(file);
    return new Low(adapter);
}

async function getUserObject(req) {
    const db = getDb();
    await db.read();
    
    const { username } = jwt.verify(req.cookies.access_token, SECRET);
    const users = db?.data?.users;

    const userObject = (users || []).find(user => user.username === username);

    return {
        ...userObject,
        modify: func => {
            (func || (() => {}))(userObject);
            db.write();
        },
    };
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// app.get('/', (req, res) => {
//     if (process.env.NODE_ENV === 'production') {
//         res.sendFile(path.join(__dirname, '..', '..', 'build', 'index.html'));
//     } 
//     else {
//         res.sendFile(path.join(__dirname, '..', '..', 'build', 'index.html'));
//     }    
// });
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

app.get('/carddata', (req, res) => {
    console.log('Sending:', path.join(__dirname, '..', '..', 'data', 'lessmtg.json'));
    res.sendFile(path.join(__dirname, '..', '..', 'data', 'lessmtg.json'));
});

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

app.get('/createuser', async (req, res) => {
    const username = 'malsomnus';
    const password = '#passWORD1';
    
    bcrypt.hash(password, 10, async function(err, hash) {
        const db = getDb();
        await db.read();
        db.data ||= { users: [] };
        const { users } = db.data;
        users.push({ 
            username: username, 
            password: hash,
            cards: [],
        });
        await db.write(); 

        res.status(200).send('Good job');
    });
});

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    console.log('Attempted login:', username);
    const db = getDb();
    await db.read();
    const users = db?.data?.users;

    function failedLogin() {
        console.log('Failed login by:', username);
        res.status(401).send({ rtnCode: 1 }); 
    }

    const idx = (users || []).findIndex(user => user.username === username);

    if (idx !== -1) {
        bcrypt.compare(password, users[idx].password, async function(err, result) {
            if (result === true) {
                const token = jwt.sign({ username: username }, SECRET);
                users[idx].jwt = token;
                await db.write();

                // res.cookie('access_token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' })
                res.cookie('access_token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' })
                    .status(200)
                    .json({ message: 'Great success!' });

                console.log('Successful login by:', username);
            }
            else {
                failedLogin();
            }
        });
    }
    else {
        failedLogin();
    }
});

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

app.get('/logout', authorization, (req, res) => {
    return res.clearCookie('access_token').status(200).json({ message: 'Logged out!' });
});

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

app.get('/getcards', authorization, async (req, res) => {
    const userObject = await getUserObject(req);
    res.status(200).send(userObject.cards);
});

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

app.post('/addcard', authorization, async (req, res) => {
    const userObject = await getUserObject(req);

    if (userObject.cards.find(card => card.name === req.body.name)) {
        res.status(208).send(userObject.cards);
    }
    else {
        userObject.modify(userObject => {
            userObject.cards.push({
                name: req.body.name,
                amount: 0,
            });
        });
        res.status(200).send(userObject.cards);
    }
});

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

app.post('/addcardtoinventory', authorization, async (req, res) => {
    const userObject = await getUserObject(req);
    const cardIndex = userObject.cards.findIndex(card => card.name === req.body.name);
    const cardObject = userObject.cards.find(card => card.name === req.body.name);

    if (cardObject === -1) {
        res.status(208).send(userObject.cards);
    }
    else {
        userObject.modify(userObject => {
            userObject.cards[cardIndex].amount = 1;
        });
        res.status(200).send(userObject.cards);
    }
});

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

app.get('/ping', (req, res) => {
    return res.send('pong')
});

const port = 3000;
console.log('Listening on port', port);
app.listen(port);