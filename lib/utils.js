
'use strict';

exports.extend = ( Base, proto ) => {
  let tmpl = {};
  Object.keys( proto )
    .forEach( ( prop ) => {
      tmpl[ prop ] = { value: proto[ prop ] };
    });
  return Object.create( Base.prototype, tmpl );
};
