const mongoose = require('mongoose');
const dotenv = require('dotenv');
// Need this config before app file, so loaded env vars can be accessed in app.js also
dotenv.config({ path: './config.env' });

const app = require('./app');

const DB = process.env.DATABASE.replace(
    '<PASSWORD>',
    process.env.DATABASE_PASSWORD
);

// environment can be dev or prod! diff database or diff loggers
// console.log(app.get('env')); // set by express
// console.log(process.env); // set by node
// can set by ```NODE_ENV=development nodemon server.js```
const PORT = process.env.PORT || 3000;

mongoose.connect(DB).then(() => {
    console.log('Database connection successful!');
    app.listen(PORT, () => {
        console.log(`App running on port ${PORT}...`);
    });
});
