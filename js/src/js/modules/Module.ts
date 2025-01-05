import Observer from './Observer';
import { Events } from '../app/Constants';

// Базовый модуль с подпиской на события и коллбэком
export default class Module {
	constructor() {
	}

	subscribe = (events: Events[]) => {
		Observer.subscribe(this, events);
	}
	
	publish = (event: Events, payload: object) => {
		Observer.publish(event, payload);
	}

	onEvent = (event: Events, payload: object) => {
		console.log('Module accepted event', event, payload);
	}
}