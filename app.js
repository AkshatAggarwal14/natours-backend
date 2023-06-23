const express = require('express');

// convention to configure express in app.js
const app = express();

// middleware - functions modifying incoming request data!
app.use(express.json());

app.get('/', (req, res) => {
    res.status(200).json({
        message: 'Hello from the server side!',
        app: 'Natours',
    });
});

app.post('/', (req, res) => {
    res.send('You can post to this endpoint...');
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`App running on port ${PORT}...`);
});
