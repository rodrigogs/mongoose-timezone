const mongoose = require('mongoose');
const moment = require('moment-timezone');
const get = require('lodash.get');
const set = require('lodash.set');

const findPaths = (schema, options) => {
  const SchemaDate = mongoose.Schema.Types.Date;
  return Object.keys(schema.paths).filter((path) => {
    if (options.paths.length) return options.paths.indexOf(path) !== -1;
    return schema.paths[path] instanceof SchemaDate;
  });
};

/**
 *
 * @param {Object} schema
 * @param {Object} options Options object
 * @param {String[]} options.paths Schema paths
 */
module.exports = function timeZone(schema, options = {}) {
  options = Object.assign(options, {
    paths: [],
  });

  const paths = findPaths(schema, options);
  const offset = moment().utcOffset() * 60 * 1000;

  function fixOffset(doc, add) {
    paths.forEach((path) => {
      const date = get(doc, path);
      if (date) {
        const modifier = add ? 1 : -1;
        const fixedOffset = date.valueOf() + (modifier * offset);
        set(doc, path, new Date(fixedOffset));
      }
    });
  }

  function addOffset(next) {
    if (!this) return next();
    fixOffset(this, true);
    next();
  }

  function subtractOffset(docs, next) {
    const documents = [];

    if (!docs) return next();

    if (!Array.isArray(docs)) {
      documents.push((docs.constructor.name === 'model') ? docs : this);
    } else {
      documents.push(...docs);
    }
    documents.forEach(result => fixOffset(result, false));
    next();
  }

  schema.pre('save', addOffset);
  schema.pre('findOneAndUpdate', addOffset);

  schema.post('save', subtractOffset);
  schema.post('find', subtractOffset);
  schema.post('findOne', subtractOffset);
  schema.post('findOneAndUpdate', subtractOffset);
};
