import * as ip from 'ip'
import { Kafka, CompressionTypes, logLevel, Producer } from 'kafkajs'

const host = process.env.HOST_IP || ip.address()

const kafka = new Kafka({
  brokers: [`${host}:9092`],
  clientId: 'example-producer',
})

const signalTraps: NodeJS.Signals[] = ['SIGTERM', 'SIGINT', 'SIGUSR2']

const getRandomNumber = () => Math.round(Math.random() * 1000)
const createMessage = (num: number) => ({
  key: `key-${num}`,
  value: `value-${num}-${new Date().toISOString()}`,
})

class Api {
  client: Producer;
  topic: string;
  constructor(topic: string) {
    this.topic = topic;
    this.client = kafka.producer()
    this.setErrorTypes();
    this.setSignalTraps();

    this.run().catch(e => console.error(`[example/producer] ${e.message}`, e))

  }
  sendMessage = () => {
    return this.client
      .send({
        topic: this.topic,
        compression: CompressionTypes.GZIP,
        messages: Array(1)//getRandomNumber())
          .fill(1)
          .map(_ => createMessage(getRandomNumber())),
      })
      .then(msg => console.log(`prod: ${JSON.stringify(msg, null, 2)}`))
      .catch(e => console.error(`[example/producer] ${e.message}`, e))
  }

  async run() {
    await this.client.connect()
    setInterval(this.sendMessage, 3000)
  }

  setErrorTypes() {
    process.on('unhandledRejection', async e => {
      try {
        console.log(`process.on unhandledRejection`)
        console.error(e)
        await this.client.disconnect()
        process.exit(0)
      } catch (_) {
        process.exit(1)
      }
    })
    process.on('uncaughtException', async e => {
      try {
        console.log(`process.on uncaughtException`)
        console.error(e)
        await this.client.disconnect()
        process.exit(0)
      } catch (_) {
        process.exit(1)
      }
    })
  }
  setSignalTraps() {
    signalTraps.map(type => {
      process.once(type, async () => {
        try {
          await this.client.disconnect()
        } finally {
          process.kill(process.pid, type)
        }
      })
    })
  }
}
export default Api;