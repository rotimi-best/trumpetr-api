const mongoose = require('mongoose')
const Schema = mongoose.Schema
const {
  Types: { ObjectId },
} = Schema
const timestamp = require('mongoose-timestamp')

const PostSchema = new Schema({
  userId: {
    type: ObjectId,
    default: null,
  },
  bibleverse: String,
  lessons: Array,
  lovedBy: Array,
  smiledBy: Array,
  rocketBy: Array,
});

PostSchema.plugin(timestamp)

module.exports = mongoose.model('Post', PostSchema)
