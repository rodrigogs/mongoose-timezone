const _ = require('lodash');
const mongoose = require('mongoose');
const moment = require('moment-timezone');

function findPaths(schema, options) {
  const SchemaDate = mongoose.Schema.Types.Date;
  return Object.keys(schema.paths).filter((path) => {
    if (options.paths.length) return options.paths.indexOf(path) !== -1;
    return schema.paths[path] instanceof SchemaDate;
  });
}

/**
 *
 * @param {Object} schema
 * @param {Object} options Options object
 * @param {String[]} options.paths Schema paths
 */
module.exports = function timeZone(schema, options = {}) {
  options = _.defaults(options, {
    paths: [],
  });

  const paths = findPaths(schema, options);
  const offset = moment().utcOffset() * 60 * 1000;

  function fixOffset(doc, add) {
    _.each(paths, (path) => {
      const date = _.get(doc, path);
      if (!date) return;
      const modifier = add ? 1 : -1;
      const fixedOffset = date.valueOf() + (modifier * offset);
      _.set(doc, path, new Date(fixedOffset));
    });
  }

  function addOffset(next) {
    if (!this) return next();
    fixOffset(this, true);
    next();
  }

  function subtractOffset(docs, next) {
    if (docs && !_.isArray(docs)) docs = [docs.constructor.name === 'model' ? docs : this];
    _.each(docs, (result) => {
      fixOffset(result, false);
    });
    next();
  }

  schema.pre('save', addOffset);
  schema.pre('update', addOffset);
  schema.pre('findOneAndUpdate', addOffset);

  schema.post('save', subtractOffset);
  schema.post('find', subtractOffset);
  schema.post('findOne', subtractOffset);
  schema.post('findOneAndUpdate', subtractOffset);
  schema.post('insertMany', subtractOffset);
};
