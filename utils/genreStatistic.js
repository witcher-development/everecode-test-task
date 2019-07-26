const uuid = require('uuid');
const { delay } = require('./helpers');

let backgroundProcesses = [];

class bgProcess {
	constructor(genre, model, subscriber) {
		this.id = uuid();

		this.subscribers = [subscriber];
		this.model = model;
		this.genre = genre;
		this.result = this.calculate(this.genre);
	}

	async calculate(genre) {
		this.sendToSubscribers('getting films ');

		let films = await this.model.find({ genres: { $in: genre }});

		await delay(5000);

		this.sendToSubscribers('processing data ');

		let average = films.reduce((accumulator, film) => {
			accumulator += +film.vote_average;
			return accumulator;
		}, 0);

		await delay(5000);

		return Math.round((average / films.length) * 100) / 100;
	};

	get getResult() {
		return (async () => {
			try {

				const output = await this.result;
				backgroundProcesses = backgroundProcesses.filter(p => p.id !== this.id);
				return output;

			} catch (e) {
				console.log(e);
			}
		})()
	}

	addSubscriber(subscriber) {
		this.subscribers.push(subscriber);
	}

	sendToSubscribers(data) {
		this.subscribers.forEach((s, i) => {
			console.log(this.genre, i);
			s.write(data);
		})
	}
}

exports.calculateGenreStatistic = async (genre, model, res) => {
	try{
		if (backgroundProcesses.length) {
			for(let p of backgroundProcesses) {

				if (p.genre === genre) {
					p.addSubscriber(res);
					return await p.getResult;
				}

			}
		}

		const newProcess = new bgProcess(genre, model, res);
		backgroundProcesses.push(newProcess);

		return await newProcess.getResult;
	} catch (e) {
		console.log(e);
	}

};
