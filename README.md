# pg-gen

Use ES6 Generators to paginate through large Postgres result sets
You'll need to use Node [4.2.0](https://nodejs.org/en/blog/release/v4.2.0/) and up

## Explaination
pg-gen uses a [postgresql cursor](http://www.postgresql.org/docs/9.2/static/plpgsql-cursors.html) for queries so that an entire result set is not returned and so memory is conserved. You utilize a generator to fetch the next `n` rows until there are no more results.

## Why not stream the result set?
Streams are great assuming you are ready to receive said results. Otherwise, you'd have to manually manage flow using pause/resume. And this will still eventually max out the internal buffer. Generators actually pause function execution. There is no buffer, there is only ever the data you request. If streams *push* data, generators allow you to *pull* data. I advise you to use whichever is best for solving your particular problem.

## Install

```
npm install pg-gen --save
```

## Usage

```javascript
  const PgGen   = require( 'pg-gen' );
  const pg      = require( 'pg' );
  const conn    = process.env.DATABASE_URL;
  const client  = new pg.Client( conn );
  
  // assume the necessary pg client connection stuff here ....

  const pgGen = PgGen( { pg: client } );
  const query = `select * from table_with_so_much_data`;
  const gen   = pgGen.atMost( 10 ).lazyQuery( query );

  gen().then( ( result ) => {

    console.log(result); // an array with at most, 10 items

    gen().then( ( result ) => {
      console.log(result); // an array with the NEXT 10 items
    });

    // Do this until result has a length of 0

  });
```

## API
```javascript
  atMost([numItems=int]) 
```
Each generator execution will return no more than the specified number of items. It may return less upon reaching the end of the result set. A return of 0 means there is no more data.

```javascript 
  lazyQuery([query=string], [params=object]) 
```

## Tests
You'll need to have a (running) database and a table with data in order to run the tests. Create your test environment like so
```
$ echo "DATABASE_URL=postgres://user:$ecret@localhost/test_db" >> test/test.env
$ echo "TEST_TABLE=test_table" >> test/test.env
```

Then
```
$ npm test
```
