const mongoose = require('mongoose')
const Schema = mongoose.Schema
const timestamp = require('mongoose-timestamp')

const UserSchema = new Schema({
  fullname: String,
  nickname: String,
  password: String,
});

UserSchema.plugin(timestamp)
module.exports = mongoose.model('User', UserSchema)
