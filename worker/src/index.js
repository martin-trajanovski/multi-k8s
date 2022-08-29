const keys = require('./keys');
const redis = require('redis');

const redisClient = redis.createClient({
  url: `redis://${keys.redisHost}:${keys.redisPort}`,
});

// TODO: Check if this is not leading to some issues because await is needed!
redisClient.connect();

const sub = redisClient.duplicate();
sub.connect();

const fib = (index) => {
  if (index < 2) return 1;

  return fib(index - 1) + fib(index - 2);
};

sub.subscribe('channel-insert', (message) => {
  redisClient.hSet('values', message, fib(parseInt(message)));
});
