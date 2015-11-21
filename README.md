# pg-gen

Paginate through a large result set using a generator.

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
``` atMost([numItems=int]) ```
Each generator execution will return no more than the specified number of items. It may return less upon reaching the end of the result set. A return of 0 means there is no more data.

``` lazyQuery([query=string], [params=object]) ```
