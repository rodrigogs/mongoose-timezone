'use strict';

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

  function fixOffset(doc, add, cb) {
    _.each(paths, (path, index) => {
      const date = _.get(doc, path);
      if (date) {
        const modifier = add ? 1 : -1;
        const fixedOffset = date.valueOf() + (modifier * offset);
        _.set(doc, path, new Date(fixedOffset));
      }
      if (index + 1 === paths.length) cb();
    });
  }

  function addOffset(next) {
    if (!this) return next();
    fixOffset(this, true, next);
  }

  function subtractOffset(docs, next) {
    if (docs && !_.isArray(docs)) docs = [docs.constructor.name === 'model' ? docs : this];
    _.each(docs, (result, index) => {
      fixOffset(result, false, () => {
        if (index + 1 === docs.length) next();
      });
    });
  }

  schema.pre('save', addOffset);
  schema.pre('findOneAndUpdate', addOffset);

  schema.post('save', subtractOffset);
  schema.post('find', subtractOffset);
  schema.post('findOne', subtractOffset);
  schema.post('findOneAndUpdate', subtractOffset);
};
