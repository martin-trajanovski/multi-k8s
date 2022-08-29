const keys = require('./keys');

// Express server setup
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(bodyParser.json());

// Postgres client setup
const { Pool } = require('pg');

const pgClient = new Pool({
  user: keys.pgUser,
  host: keys.pgHost,
  database: keys.pgDatabase,
  password: keys.pgPassword,
  port: keys.pgPort,
});

pgClient.on('error', () => console.log('Lost PG connection'));

pgClient.on('connect', (client) => {
  client
    .query('CREATE TABLE IF NOT EXISTS values (number INT)')
    .catch((err) => console.error(err));
});

// Redis client setup
const redis = require('redis');

const redisClient = redis.createClient({
  url: `redis://${keys.redisHost}:${keys.redisPort}`,
});

// TODO: Check if this is not leading to some issues(race conditions) because await is needed!
redisClient.connect();

redisClient.on('error', (err) => console.log('Redis Client Error', err));

redisClient.on('connect', async function () {
  console.log('Redis connected!');
});

const redisPublisher = redisClient.duplicate();

redisPublisher.connect();

// Express route handlers
app.get('/', (req, res) => {
  res.send('Hi');
});

app.get('/values/all', async (req, res) => {
  const values = await pgClient.query('SELECT * FROM values');

  res.send(values.rows);
});

app.get('/values/current', async (req, res) => {
  const values = await redisClient.hGetAll('values');

  res.send(values);
});

app.post('/values', async (req, res) => {
  const index = req.body.index;

  if (index > 40) {
    return res.status(422).send('Index too high');
  }

  redisClient.hSet('values', index, 'Nothing yet!');

  redisPublisher.publish('channel-insert', index);

  await pgClient.query('INSERT INTO values(number) VALUES($1)', [index]);

  res.send({ working: true });
});

app.listen(5000, (err) => {
  console.log('Server is listening on port 5000');
});
