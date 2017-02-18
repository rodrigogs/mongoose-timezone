import test from 'ava';
import mongoose from 'mongoose';
import dotevn from 'dotenv';
import timeZone from './index';

dotevn.load();

let Schema;

test.cb.before((t) => {
  mongoose.connect(process.env.DATABASE_URL)
    .then(t.end)
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

  let savedDoc;
  new TestSchema({ date1: now })
    .save()
    .then(doc => (savedDoc = doc))
    .then(doc => t.is(doc.date1.valueOf(), now.valueOf()))
    .then(() => TestSchema.find({ _id: savedDoc._id }))
    .then(docs => t.is(docs[0].date1.valueOf(), now.valueOf()))
    .then(() => TestSchema.findOne({ _id: savedDoc._id }))
    .then(doc => t.is(doc.date1.valueOf(), now.valueOf()))
    .then(t.end)
    .catch(t.fail);
});
