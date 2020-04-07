const mongoose = require("./utils/mongoose");
const Schema = mongoose.Schema;
const KnowledgeComponentRelevance = require("./schema/KnowledgeComponentRelevance");
const handlePromiseOrCallback = require("./utils/handle-promise-or-callback");
const Topic = new Schema(
  {
    name: { type: String, required: "{PATH} is required!" },
    alias: { type: String, required: "{PATH} is required!", unique: true },
    pronunciation: { type: String },
    recommender: { type: String },
    knowledgeComponents: [KnowledgeComponentRelevance],
    prerequisiteTopics: [
      {
        type: Schema.Types.ObjectId,
        ref: "Topic"
      }
    ]
  },
  { timestamps: true }
);

Topic.plugin(require("./plugins/mongoose-find-one-by-id-or-alias"));
Topic.plugin(require("./plugins/mongoose-no-underscore-id"));
Topic.plugin(require("mongoose-findorcreate"));

Topic.methods.findLessons = function(fields, callback) {
  if (typeof fields === "function") {
    callback = fields;
    fields = null;
  }
  const lessonModel = mongoose.model("Lesson");
  const promise = new Promise((resolve, reject) => {
    let query = lessonModel
      .find({
        topic: this._id,
        ord: { $gte: 0 },
        deleted: { $ne: true }
      })
      .sort({ ord: 1 });
    if (fields) {
      query = query.select(fields);
    }
    query.exec((err, item) => {
      if (err) {
        reject(err);
      } else {
        resolve(item);
      }
    });
  });
  return handlePromiseOrCallback(promise, callback);
};

module.exports = mongoose.model("Topic", Topic);
