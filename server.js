const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const expressValidator = require('express-validator');

const port = process.env.PORT || 8080;

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(expressValidator());

app.listen(port, () => {
    console.log(`App listening on port ${port}!`)
});