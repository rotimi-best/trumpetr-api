const mongoose = require('mongoose')
const Schema = mongoose.Schema
const {
  Types: { ObjectId },
} = Schema
const timestamp = require('mongoose-timestamp')

const PostSchema = new Schema({
  userId: ObjectId,
  read: String,
  lesson: String,
  lovedBy: Array,
  suprisedBy: Array,
  thankfulBy: Array,
});

PostSchema.plugin(timestamp)

module.exports = mongoose.model('Post', PostSchema)
