
'use strict';

const path  = require( 'path' );
const P     = require( 'bluebird' );
const test  = require( 'tape' );
const pg    = require( 'pg' );
const async = require( 'async' );
const PgGen = require( '../index' );
const env   = path.resolve( __dirname, 'test.env' );

require( 'dotenv' ).config( { path: env } );

const setup = () => {
  const resolver  = P.pending();
  const conString = process.env.DATABASE_URL;
  const client    = new pg.Client( conString );
  client.connect( ( err ) => {
    if ( err ) {
      resolver.reject( `error fetching client from pool ${err}` );
    } else {
      resolver.resolve( client );
    }
  });
  return resolver.promise;
};

test('it works', ( t ) => {
  setup()
    .then( ( client ) => {
      const numItems  = 10;
      const table     = process.env.TEST_TABLE;
      const pgGen     = PgGen( { pg: client } );
      const query     = `select * from ${table}`;
      let   hasItems  = true;
      const gen       = pgGen
        .atMost( numItems )
        .lazyQuery( query );

      async.whilst(
        () => hasItems,
        ( callback ) => {
          gen().then( ( result ) => {
            t.ok( result, 'Result set exists' );
            t.notOk( isNaN( result.length ), 'Result set has a valid length' );
            if ( result && result.length === 0 ) {
              hasItems = false;
            } else {
              t.true(
                () => result.length <= numItems,
                'Num results is as expected'
              );
              t.comment( `Fetched ${result.length} items` );
            }
            setTimeout( callback, 50 );
          });
        },
        ( err ) => {
          t.notOk( err );
          t.end();
        }
      );
    }).catch( ( err ) => console.error( err ) );
});

test('we\'re done', ( t ) => {
  t.end();
  process.exit();
});
