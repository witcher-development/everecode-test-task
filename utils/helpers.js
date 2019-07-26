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
