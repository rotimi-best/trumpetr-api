const PostModel = require('../models/post')

module.exports = {
  addPost: data => require('./templates/add')(PostModel, data),
  getPost: (params, sort, selectedFields) =>
    require('./templates/get')(PostModel, params, sort, selectedFields),
  updatePost: (findField, setField) =>
    require('./templates/update')(PostModel, findField, setField),
  deletePost: findField =>
    require('./templates/delete')(PostModel, findField),
}
