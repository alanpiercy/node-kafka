# Node-Kafka
A baseline server app with a Kafka consumer and producer

Pulls together pieces from Running Kafka in Development (ref below)

Tech: Kafka, NodeJS, Typescript

## Dev setup

Run this line in each console before starting anything.

```sh
export HOST_IP=$(ifconfig | grep -E "([0-9]{1,3}\.){3}[0-9]{1,3}" | grep -v 127.0.0.1 | awk '{ print $2 }' | cut -f2 -d: | head -n1)
```

### Kafka Network

Set up Kafka environment, so producers and consumers can communicate

- docker-compose.yml
    - sourced from [Runnning Kafka in Development](https://kafka.js.org/docs/running-kafka-in-development)

```sh
cd network
docker-compose up
docker-compose down
```

### App

Single app with consumer and producer, talking to each other.

- Code modified from original example
- Converted to Typescript


```sh
cd server
npx tsc
node dist/server.ts
```

## References

* [kafkajs](https://kafka.js.org/)
* [Running Kafka in Development](https://kafka.js.org/docs/running-kafka-in-development)
* [Docker and Kafka](https://success.docker.com/article/getting-started-with-kafka)