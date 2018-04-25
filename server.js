const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const expressValidator = require('express-validator');
const moment = require('moment');
const firebase = require('firebase');
const fetch = require('node-fetch');

const port = process.env.PORT || 8080;

const apiKey = process.env.FIREBASE_API_KEY || "AIzaSyAtcsQKYqEoFQE35gsrLf7C7I8bczJaufI";
const authDomain = process.env.FIREBASE_AUTH_DOMAIN || "carpoolapptest.firebaseapp.com";
const databaseURL = process.env.FIREBASE_DB_URL || "https://carpoolapptest.firebaseio.com";
const projectId = process.env.FIREBASE_PROJECT_ID || "carpoolapptest";
const storageBucket = process.env.FIREBASE_STORAGE_BUCKET || "carpoolapptest.appspot.com";
const messagingSenderId = process.env.FIREBASE_MESSAGING_SENDER_ID || "143803579783";
const notificationApiKey = process.env.FIREBASE_NOTIFCATION_KEY || "key=AAAAIXtcfYc:APA91bFbjaRrJHEYUbrHxZDPZS7Jb7eJY5NkgIr2a2p5DqFJ0jTqdnEinQyGXfm4fWpts7papuWU1bXbHt44SrkBzUUF8mbzuVUiqQa3w8PFtcdSbDRVjodMad9YauD8EfWcv3V5mPqy";

const config = {
    apiKey,
    authDomain,
    databaseURL,
    projectId,
    storageBucket,
    messagingSenderId
};

firebase.initializeApp(config);

const app = express();
app.enable('trust proxy');
app.use(function (req, res, next) {
    if (req.secure) {
        next();
    } else {
        if (process.env.NODE_ENV === 'dev') {
            next();
        } else {
            res.redirect('https://' + req.headers.host + req.url);
        }
    }
});
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(expressValidator());

const SessionRef = process.env.NODE_ENV === 'dev'
    ? firebase.database().ref(`web/carpool/devsessions/5`)
    : firebase.database().ref(`web/carpool/sessions/5`);

const defaultModel = {
    users: [
        {id: '1', email: 'mathieu.ancelin@serli.com', name: 'Mathieu', score: 0.0},
        {id: '2', email: 'mickael.boudaud@serli.com', name: 'Mickael', score: 0.0},
        {id: '3', email: 'fedy.salah@serli.com', name: 'Fedy', score: 0.0},
        {id: '4', email: 'guillaume.soldera@serli.com', name: 'Guillaume', score: 0.0}
    ],

    archive: {
        '20180420': [
            {role: 'pooler', was: 0.0},
            {role: 'driver', was: 0.0},
            {role: 'pooler', was: 0.0},
            {role: 'pooler', was: 0.0},
        ],
        '20180419': [
            {role: 'pooler', was: 0.0},
            {role: 'pooler', was: 0.0},
            {role: 'driver', was: 0.0},
            {role: 'pooler', was: 0.0},
        ]
    },

    devices: [],
};

let currentUsers = [];
let currentArchive = {};
let currentTime = {};
let currentLocation = {};
let currentTokens = [];

const UsersRef = SessionRef.child('users');
const ArchiveRef = SessionRef.child('archive');
const LocationRef = SessionRef.child('location');

LocationRef.on('value', snapshot => {
    let value = snapshot.val();
    if (value === null) {
        LocationRef.set({location: 'SERLI', time: '07:53:00', changed: 0});
    } else {
        currentTime = value.time;
        currentLocation = value.location;
    }
}, error => console.error(error));

UsersRef.on('value', snapshot => {
    let value = snapshot.val();
    if (value === null) {
        UsersRef.set({...defaultModel.users});
    } else {
        currentUsers = value;
    }
}, error => console.error(error));

ArchiveRef.on('value', snapshot => {
    let value = snapshot.val();
    if (value === null) {
        ArchiveRef.set({...defaultModel.archive});
    } else {
        currentArchive = value;
    }
}, error => console.error(error));

function isLastSnapshot(date) {
    const today = moment(moment().format('YYYYMMDD'), 'YYYYMMDD');
    if (date.isAfter(today)) {
        return true;
    }
    let index = date;
    while (index.format('YYYYMMDD') !== today.format('YYYYMMDD')) {
        if (typeof currentArchive[index] !== 'unefined') {
            return false;
        }
        index = index.add(1, 'days');
    }
    return true;
}

function computeFromBeginning() {
    const users = {...currentUsers};
    const log = {...currentArchive};
    for (let key in users) {
        users[key].score = 0.0;
    }
    for (let key in log) {
        const value = log[key];
        for (let userId in value) {
            if (userId !== 'was') {
                const userAction = value[userId];
                value.was = normalize(users[userId].score);
                if (userAction.role === 'driver') {
                    users[userId].score = normalize(users[userId].score + 1);
                } else if (userAction.role === 'pooler') {
                    users[userId].score = normalize(users[userId].score - decrement());
                }
            }
        }
    }
    ArchiveRef.set(log, () => {
        UsersRef.set(users, () => {
        });
    });
}

function normalize(what) {
    return parseFloat(what.toFixed(3));
}

function decrement() {
    let value = Object.keys(currentUsers).length - 1;
    if (value <= 0) {
        value = 1;
    }
    return (1 / value);
}

function notifyOthers(me, title, body, action) {
    Promise.all(
        currentTokens.filter(token => token !== me)
            .map(token => {
                console.log('sending notif', token);
                return fetch('https://fcm.googleapis.com/fcm/send',
                    {
                        method: 'POST',
                        headers: {
                            "Authorization": notificationApiKey,
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            notification: {
                                title,
                                body,
                                click_action : action,
                                icon:'/images/icons/android-icon-36x36.png'
                            },
                            to: token
                        })
                    })
                    .catch(error => console.log(error));
            })
    ).catch(error => console.log(error));
}

app.post('/registerToken', function (req, res) {
    const requestBody = req.body;
    const token = requestBody.token;
    if (currentTokens.indexOf(token) < 0) {
        console.log('new token', token);
        currentTokens.push(token);
    }
    res.json({});
});

app.get('/locationTime', function (req, res) {
    res.json({
        location: currentLocation,
        time: currentTime
    });
});

app.get('/users', function (req, res) {
    res.json(currentUsers);
});

app.get('/archive', function (req, res) {
    res.json(currentArchive);
});

app.post('/changeLocation', function (req, res) {
    const requestBody = req.body;
    const location = requestBody.location;
    LocationRef.set({location, time: currentTime, changed: 0});
    notifyOthers('', 'Location changed', 'The location has changed to ' + location , 'https://carpool.cleverapps.io');
    res.json({
        location,
        time: currentTime
    });
});

app.post('/changeTime', function (req, res) {
    const requestBody = req.body;
    const time = requestBody.time;
    LocationRef.set({location: currentLocation, time, changed: 0});
    notifyOthers('', 'Time changed', 'The Time has changed to '+ time, 'https://carpool.cleverapps.io');
    res.json({
        time,
        location: currentLocation
    });
});

app.post('/saveUser', function (req, res) {
    const requestBody = req.body;
    const currentDay = requestBody.currentDay;
    const DayArchivedRef = ArchiveRef.child(currentDay);
    const day = {};
    const newUsers = {...currentUsers};
    for (let key in newUsers) {
        const user = newUsers[key];
        const role = requestBody.userStates[user.id - 1];
        const archived = currentArchive[currentDay] || {[user.id]: {}};
        const userScore = typeof currentArchive[currentDay] !== 'undefined' ?
            (archived[user.id - 1].was || 0.0) :
            (user.score || 0.0);
        day[user.id - 1] = {was: userScore, role};
        if (role === 'driver') {
            user.score = normalize(userScore + 1);
        } else if (role === 'pooler') {
            user.score = normalize(userScore - decrement());
        }
    }
    DayArchivedRef.set(day);
    UsersRef.set(newUsers);
    if (!isLastSnapshot(moment(currentDay, 'YYYYMMDD'))) {
        computeFromBeginning();
    }
    res.json(currentArchive);
});

app.listen(port, () => {
    console.log(`App listening on port ${port}!`)
});