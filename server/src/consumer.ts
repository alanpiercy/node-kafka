import * as ip from 'ip'
import { Consumer, Kafka, logLevel } from 'kafkajs'

const host = process.env.HOST_IP || ip.address()

const kafka = new Kafka({
  logLevel: logLevel.INFO,
  brokers: [`${host}:9092`],
  clientId: 'example-consumer',
})

const signalTraps: NodeJS.Signals[] = ['SIGTERM', 'SIGINT', 'SIGUSR2']

class Api {
  client: Consumer;
  topic: string;
  constructor(topic: string) {
    this.topic = topic;
    this.client = kafka.consumer({ groupId: 'test-group' })

    this.setErrorTypes();
    this.setSignalTraps();
    this.run().catch(e => console.error(`[example/consumer] ${e.message}`, e))
  }
  async run() {
    await this.client.connect()
    await this.client.subscribe({ topic: this.topic, fromBeginning: true })
    await this.client.run({
      // eachBatch: async ({ batch }) => {
      //   console.log(batch)
      // },
      eachMessage: async ({ topic, partition, message }) => {
        const prefix = `${topic}[${partition} | ${message.offset}] / ${message.timestamp}`
        console.log(`cons: - ${prefix} ${message.key}#${message.value}`)
      },
    })
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