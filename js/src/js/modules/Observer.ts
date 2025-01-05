import { Events } from '../app/Constants';
import Module from './Module';

interface Subscriber {
	name: string;
	onEvent(eventName: string, payload: object): void;
	events: Events[]
}

// Медиатор - управляет взаимодействием между модулями на основе событий
class Observer {
	subscribers: Subscriber[] = [];

	constructor() { }

	subscribe = (instance: Module, events:Events[] = [Events.all]): void => {
		const subscriber: Subscriber = {
			name: instance.constructor.name,
			onEvent: instance.onEvent,
			events,
		};

		this.subscribers.push(subscriber);

		// console.log('this.subscribers', this.subscribers);
	}

	publish = (event: Events, payload: object) => {
		// console.log('event', event);
		
		this.subscribers.forEach((subscriber: Subscriber) => {
			if (!this.filterEvent(subscriber, event)) { return; }
			subscriber.onEvent(event, payload);
		});

		/*switch (event) {
		    case 'value1':
		
		        break;
		
		    case 'value2':
		
		        break;
		
		    default:
		}*/
	}

	filterEvent = (subscriber: Subscriber, event: Events): boolean => {
		const result = subscriber.events.find((e: string) => { return e === event; });
		// console.log('result', result);
		// console.log('s', subscriber, event);
		
		return Boolean(result);
	}
}

export default new Observer();