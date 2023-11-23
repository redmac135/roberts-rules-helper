import { EventEmitter } from 'events';

EventEmitter.defaultMaxListeners = 150;
export const chatEmitter = new EventEmitter();
