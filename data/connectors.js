var { Author, Post, Comment } = require('./model.js');
var reversePopulate = require('mongoose-reverse-populate');

module.exports.getAuthor = ({_id}) => {
  return new Promise((resolve, reject) => {
    Author.findById(_id)
    .exec((err, author) => {
      var opts = {
          modelArray: author,
          storeWhere: "posts",
          arrayPop: true,
          mongooseModel: Post,
          idField: "author"
      }
      reversePopulate(opts, function(err, popAuthors) {
          var opts = {
              modelArray: popAuthors,
              storeWhere: "comments",
              arrayPop: true,
              mongooseModel: Comment,
              idField: "author"
          }
          reversePopulate(opts, function(err, authors) {
            err ? reject(err) : resolve(authors);
          });
      });
    });
  })
}

module.exports.getAuthors = ({limit, last}) => {
  return new Promise((resolve, reject) => {
    Author.find({})
      .exec((err, author) => {
          var opts = {
              modelArray: author,
              storeWhere: "posts",
              arrayPop: true,
              mongooseModel: Post,
              idField: "author"
          }
          reversePopulate(opts, function(err, popAuthors) {
              var opts = {
                  modelArray: popAuthors,
                  storeWhere: "comments",
                  arrayPop: true,
                  mongooseModel: Comment,
                  idField: "author"
              }
              reversePopulate(opts, function(err, authors) {
                err ? reject(err) : resolve(authors);
              });
          });
    });
  });
}

module.exports.createAuthor = (args) => {
  return new Promise((resolve, reject) => {
    let author = new Author(args.input);
    author.save(function(err) {
      if (err) reject(err);
      else resolve(author);
    });
  });
}

module.exports.getPosts = () => {
  return new Promise((resolve, reject) => {
    Post.find({})
      .populate({path:'author', model: 'Author'})
      .exec((err, post) => {
        var opts = {
            modelArray: post,
            storeWhere: "comments",
            arrayPop: true,
            mongooseModel: Comment,
            idField: "post"
        }
        reversePopulate(opts, function(err, posts) {
          err ? reject(err) : resolve(posts);
        });
    });
  });
}
module.exports.createPost = (args) => {
  return new Promise((resolve, reject) => {
    let post = new Post();

    post.title = args.input.title;
    post.text = args.input.text;
    post.author = args.input.author;
    post.save(function(err) {
      if (err) reject(err);
      else {
        Post.findById(post._id).populate({path:'author', model: 'Author'}).exec((err, post) => {
          err ? reject(err) : resolve(post);
        });
      }
    });
  });
}

module.exports.getComments = () => {
  return new Promise((resolve, reject) => {
    Comment.find({})
        .populate({path:'author', model: 'Author'})
        .exec((err, res) => {
      err ? reject(err) : resolve(res);
    });
  });
}

module.exports.createComment = (args) => {
  return new Promise((resolve, reject) => {
    let comment = new Comment();
    comment.text = args.input.text;
    comment.author = args.input.author;
    comment.post = args.input.post;
    comment.save(function(err) {
      if (err) reject(err);
      else {
        Comment.findById(comment._id)
        .populate({path:'author', model: 'Author'})
        .populate({path:'post', model: 'Post'})
        .exec((err, fetchedComment) => {
          err ? reject(err) : resolve(fetchedComment);
        });
      }
    });
  });
}

module.exports.deleteComment = (args) => {
  return new Promise((resolve, reject) => {
    Comment.findOneAndRemove({id: args.id}).exec((err, comment) => {
      err ? reject(err) : resolve(comment);
    });
  });
}

module.exports.updateComment = (args) => {
  return new Promise((resolve, reject) => {
    Comment.findByIdAndUpdate(args.input.id, { $set: { text: args.input.text }}, {upsert: false}, function(err, comment){
      console.log(comment._id);
      Comment.findById(comment._id)
      .populate({path:'author', model: 'Author'})
      .populate({path:'post', model: 'Post'})
      .exec((err, fetchedComment) => {
        err ? reject(err) : resolve(fetchedComment);
      });
    });
  });
}
