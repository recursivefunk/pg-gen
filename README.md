# pg-gen

Use ES6 Generators to paginate through large Postgres result sets
You'll need to use Node [4.2.0](https://nodejs.org/en/blog/release/v4.2.0/) and up

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
