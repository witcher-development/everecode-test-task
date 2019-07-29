const Logger = require('eventlogger');
const log = new Logger({
	source: 'FilmsApiLogs',
	logPath: './'
});

exports.allSpecifiedGenresInDocumentFilter = (genresStrung) => {
	const genres = genresStrung ? genresStrung.split(',') : '';
	const genresFilter = genres ? genres.map(g => {
		return {
			genres: { $eq: g }
		}
	}) : [];
	return genresFilter.length ? { $and: genresFilter } : {};
};

exports.delay = timeout => new Promise(resolve => setTimeout(resolve, timeout));

exports.globalErrorHandler = async (error) => {
	// await sendEmailToAdmin
	// await etc...
	log.error(error);
	console.log(error);
};

exports.invalidType = (argument, type, isRequired = false, notEmpty = false) => {
	if (!isRequired && typeof argument === 'undefined') {
		return false;
	}
	return typeof argument !== type;
};
