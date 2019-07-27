# Evercode tesk task

## Run App

```
npm run start - run app
npm run test - run tests
```

## Endpoints

- Get films
```
/films - GET

params:
- page (Number - from 1 to ...)
- sort (Number - 1, -1)
    Sorting by title
- genres (Array of strings)

{
  _id,
  title,
  poster_path,
  genres: [],
};
```

- Get film
```
/films/:id - GET

{
	title,
	overview,
	popularity,
	vote_average,
	poster_path,
	genres,
	adult,
	release_date,
};
```

- Update database
```
/films/update - GET

Sync with films API. Last 400 top rated.
```

- Get count of films
```
/films/count - GET

params:
- genre (strings)

{
  data: Number;
};
```

- Get average vote of genre
```
/films/statistic - GET

params:
- genre (strings) *

{
  data: Number;
};

https://developer.mozilla.org/en-US/docs/Web/API/Streams_API/Using_readable_streams
```
