import test from 'ava';
import mongoose from 'mongoose';
import moment from 'moment-timezone';
import dotevn from 'dotenv';
import timeZone from './index';

dotevn.load();

const offset = moment().utcOffset() * 60 * 1000;
let Schema;
let Collection;

test.cb.before((t) => {
  mongoose.connect(process.env.DATABASE_URL)
    .then(() => {
      const db = mongoose.connections[0].db;
      Collection = db.collection('schemas');
      t.end();
    })
    .catch(t.fail);
});

test.cb.after((t) => {
  mongoose.disconnect()
    .then(t.end)
    .catch(t.fail);
});

test.cb.beforeEach((t) => {
  Schema = new mongoose.Schema({
    date1: {
      type: Date,
      default: new Date(),
    },
    date2: {
      type: Date,
      default: new Date(),
    },
    subDoc: {
      subProp: {
        type: Date,
        default: new Date(),
      },
    },
  });
  t.end();
});

test.cb('Should save the model and return the exact saved values', (t) => {
  Schema.plugin(timeZone);
  const TestSchema = mongoose.model('Schema', Schema);

  const now = new Date();
  const fixedOffset = now.valueOf() + offset;

  let savedDoc;
  new TestSchema({ date1: now })
    .save()
    .then(doc => (savedDoc = doc))
    .then(doc => t.is(doc.date1.valueOf(), now.valueOf()))
    .then(() => Collection.find({ _id: savedDoc._id }).toArray())
    .then(doc => t.is(doc[0].date1.valueOf(), fixedOffset))
    .then(t.end)
    .catch(t.fail);
});

test.cb('Should update the model and return the exact updated values', (t) => {
  Schema.plugin(timeZone);
  const TestSchema = mongoose.model('Schema', Schema);

  const now = new Date();
  const tomorrow = new Date(new Date().valueOf() + 86400000);
  const tomorrowFixedOffset = tomorrow.valueOf() + offset;

  let savedDoc;
  new TestSchema({ date1: now })
    .save()
    .then(doc => (savedDoc = doc))
    .then((doc) => {
      doc.date1 = tomorrow;
      return doc.save();
    })
    .then(() => TestSchema.findOne({ _id: savedDoc._id }))
    .then(doc => t.is(doc.date1.valueOf(), tomorrow.valueOf()))
    .then(() => Collection.find({ _id: savedDoc._id }).toArray())
    .then(doc => t.is(doc[0].date1.valueOf(), tomorrowFixedOffset))
    .then(t.end)
    .catch(t.fail);
});
