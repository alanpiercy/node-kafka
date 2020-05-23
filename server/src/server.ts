/**
 * Node kafka
 * A node that runs on a network
 */

const debug = console.log;

import Consumer from './consumer';
import Producer from './producer';

const TOPIC = 'topic-test'
const consumer = new Consumer(TOPIC);
const producer = new Producer(TOPIC);

//run both a producer and consumer
consumer.run();
producer.run();