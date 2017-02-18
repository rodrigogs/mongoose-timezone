# mongoose-timezone

[![Build Status](https://travis-ci.org/rodrigogs/mongoose-timezone.svg?branch=master)](https://travis-ci.org/rodrigogs/mongoose-timezone)
[![Code Climate](https://codeclimate.com/github/rodrigogs/mongoose-timezone/badges/gpa.svg)](https://codeclimate.com/github/rodrigogs/mongoose-timezone)
[![Test Coverage](https://codeclimate.com/github/rodrigogs/mongoose-timezone/badges/coverage.svg)](https://codeclimate.com/github/rodrigogs/mongoose-timezone/coverage)
[![dependencies Status](https://david-dm.org/rodrigogs/mongoose-timezone/status.svg)](https://david-dm.org/rodrigogs/mongoose-timezone)
[![devDependency Status](https://david-dm.org/rodrigogs/mongoose-timezone/dev-status.svg)](https://david-dm.org/rodrigogs/mongoose-timezone#info=devDependencies)
[![npm](https://img.shields.io/npm/dt/mongoose-timezone.svg)](https://www.npmjs.com/package/mongoose-timezone)
[![npm version](https://badge.fury.io/js/mongoose-timezone.svg)](https://badge.fury.io/js/mongoose-timezone)

A mongoose plugin to normalize stored dates timezone. By default mongo dates are stored in UTC format, this behaviour may cause problems when using advanced aggregation queries or when retrieving those dates from another system with different timezone.

mongoose-timezone basically adds the current timezone offset to the date before store and removes the offset when retrieving data. This way dates are kept proportional in the database and in the app.

## Install
> npm install mongoose-timezone --save

## Usage
```javascript
const mongoose = require('mongoose');
const timeZone = require('mongoose-timezone');

const Schema = new mongoose.Schema({
    date: Date,
    subDocument: {
        subDate: {
            type: Date,
        },
    },
});

// If no path is given, all date fields will be applied
Schema.plugin(timeZone, { paths: ['date', 'subDocument.subDate'] });
mongoose.model('Schema', Schema);
```

## Notes
* [insertMany](http://mongoosejs.com/docs/api.html#model_Model.insertMany) function is not supported due to mongoose's API limitations
* [update](http://mongoosejs.com/docs/api.html#model_Model.update) function is not supported due to mongoose's API limitations, [save](http://mongoosejs.com/docs/api.html#model_Model.save) function could be used instead.

## Contributing
1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request

## License
[Licence](https://github.com/rodrigogs/mongoose-timezone/blob/master/LICENSE) © Rodrigo Gomes da Silva
