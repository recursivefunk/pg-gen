
'use strict';

const events        = require( 'events' );
const P             = require( 'bluebird' );
const Cursor        = require( 'pg-cursor' );
const utils         = require( './lib/utils' );
const EventEmitter  = events.EventEmitter;

module.exports = ( spec ) => {
  const _pgClient = spec.pg;
  let   _atMost   = 5;
  const _proto    = {

    atMost( numResults ) {
      _atMost = numResults;
      return this;
    },

    lazyQuery( queryText, params ) {

      const cursor = _pgClient.query(
        new Cursor( queryText, params )
      );

      function* fetcher() {
        yield _performRead( cursor, _atMost );
        while ( true ) {
          yield _performRead( cursor, _atMost );
        }
      }

      return () => {
        const next = fetcher().next();
        if ( !next.done ) {
          return next.value;
        } else {
          const resolver = P.pending();
          process.nextTick( resolver.resolve() );
          return resolver.promise;
        }
      };
    }
  };

  function _performRead( cursor, num ) {
    const resolver = P.pending();
    cursor.read( num, ( err, rows ) => {
      if ( err ) {
        resolver.reject( err );
      } else {
        resolver.resolve( rows );
      }
    });
    return resolver.promise;
  }

  return utils.extend( EventEmitter, _proto );
};
