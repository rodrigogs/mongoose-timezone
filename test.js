require('dotenv').config();

const mongoose = require('mongoose');
const moment = require('moment-timezone');

const offset = moment().utcOffset() * 60 * 1000;
const { ObjectId } = mongoose.Types;
let MongooseSchema;
let Schema;
let Collection;

const timeZone = require('./index');

beforeAll(async () => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('Environment variable "DATABASE_URL" must be a valid connection string');

  await mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true });
  const db = mongoose.connections[0].db;
  Collection = db.collection('schemas');

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

  Schema.plugin(timeZone);

  MongooseSchema = mongoose.model('Schema', Schema);
});

afterAll(() => mongoose.disconnect());

describe('timeZone', () => {

  it('should save the model and return the exact saved values', async () => {
    const now = new Date();
    const fixedOffset = now.valueOf() + offset;

    const mongooseDoc = await (new MongooseSchema({ date1: now }).save());
    const mongoDocs = await Collection.find({ _id: mongooseDoc._id }).toArray();

    expect(mongooseDoc.date1.valueOf()).toEqual(now.valueOf());
    expect(mongoDocs[0].date1.valueOf()).toEqual(fixedOffset);
  });

  it('should update the model and return the exact updated values', async () => {
    const now = new Date();
    const tomorrow = new Date(new Date().valueOf() + 86400000);
    const tomorrowFixedOffset = tomorrow.valueOf() + offset;

    const mongooseDoc = await (new MongooseSchema({ date1: now }).save());
    mongooseDoc.date1 = tomorrow;

    await mongooseDoc.save();

    const retrieved = await MongooseSchema.findOne({ _id: mongooseDoc._id });
    const mongoDocs = await Collection.find({ _id: retrieved._id }).toArray();

    expect(retrieved.date1.valueOf()).toEqual(tomorrow.valueOf());
    expect(mongoDocs[0].date1.valueOf()).toEqual(tomorrowFixedOffset);
  });

  it('should work when no document is retrieved', async () => {
    await MongooseSchema.findOne({ _id: new ObjectId() });
  });

});
