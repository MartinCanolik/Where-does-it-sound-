const { response } = require("express");
const { Event, Artist, Genre } = require("../db");
const { filterAllEvents } = require("../helpers/filterAllEvents");

const createEvent = async (req, res = response) => {
	const {
		name,
		description,
		date,
		start,
		end,
		price,
		quotas,
		artistName,
		genres,
		image,
		city,
		address,
	} = req.body;

	try {
		let eventExis = await Event.findOne({
			where: { name, state: true },
		});

		if (eventExis) {
			return res.status(400).json({
				ok: false,
				msg: "El evento ya existe con ese nombre",
			});
		}

		const artist = await Artist.findOne({
			where: { nickname: artistName },
		});

		const genresDb = await Genre.findAll({
			where: { name: genres.map((g) => g) },
		});

		if (genresDb === null || genresDb.length === 0) {
			return res.status(400).json({
				ok: false,
				msg: "El genero no existe",
			});
		}

		if (!artist) {
			return res.status(404).json({
				ok: false,
				msg: "No se encontro artista con ese nombre",
			});
		}

		const event = await Event.create({
			name,
			description,
			date,
			start,
			end,
			price,
			quotas,
			image,
			address,
			city,
		});
		await event.addArtist(artist);
		await event.addGenres(genresDb);
		res.status(201).json({
			ok: true,
			msg: "Evento creado",
			event,
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			ok: false,
			msg: "Por favor hable con el administrador",
		});
	}
};

const getEvents = async (req, res = response) => {
	const filter = req.query.filter || "";
	// const options = req.query.options || '';
	try {
		const events = await filterAllEvents(filter);

		if (events.length === 0) {
			return res.status(404).json({
				ok: false,
				msg: "No se encontraron eventos",
				events,
			});
		}

		return res.status(200).json({
			ok: true,
			msg: "Eventos encontrados",
			events,
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			ok: false,
			msg: "Por favor hable con el administrador",
		});
	}
};

const deleteEvent = async (req, res = response) => {
	const { id } = req.params;
	try {
		const event = await Event.findByPk(id);

		if (!event || !event.state) {
			return res.status(404).json({
				ok: false,
				msg: "No se encontro evento con ese Id",
			});
		}

		await event.update({ state: false });

		res.status(200).json({
			ok: true,
			msg: "Evento eliminado",
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			ok: false,
			msg: "Por favor hable con el administrador",
		});
	}
};

const getEvent = async (req, res = response) => {
	const { id } = req.params;
	try {
		const event = await Event.findByPk(id);

		if (!event || !event.state) {
			return res.status(404).json({
				ok: false,
				msg: "No se encontro evento con ese Id",
			});
		}

		res.status(200).json({
			ok: true,
			msg: "Evento encontrado",
			event,
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			ok: false,
			msg: "Por favor hable con el administrador",
		});
	}
};

const updateEvent = async (req, res = response) => {
	const { id } = req.params;
	try {
		const event = await Event.findByPk(id);

		if (!event || !event.state) {
			return res.status(404).json({
				ok: false,
				msg: "No se encontro evento con ese Id",
			});
		}

		await event.update(req.body);

		res.status(200).json({
			ok: true,
			msg: "Evento actualizado",
			event,
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			ok: false,
			msg: "Por favor hable con el administrador",
		});
	}
};

const changeStateEvent = async (req, res = response) => {
	const { id } = req.params;
	try {
		const event = await Event.findByPk(id);

		if (!event) {
			return res.status(404).json({
				ok: false,
				msg: "No se encontro evento con ese Id",
			});
		}

		await event.update({ state: true });

		res.status(200).json({
			ok: true,
			msg: "Estado del evento actualizado",
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			ok: false,
			msg: "Por favor hable con el administrador",
		});
	}
};

module.exports = {
	createEvent,
	getEvents,
	deleteEvent,
	updateEvent,
	getEvent,
	changeStateEvent,
};
