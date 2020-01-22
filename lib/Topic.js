const mongoose = require("./mongoose");
const Schema = mongoose.Schema;
const KnowledgeComponentRelevance = require("./schema/KnowledgeComponentRelevance");

const Topic = new Schema(
  {
    name: { type: String, required: "{PATH} is required!" },
    alias: { type: String, required: "{PATH} is required!", unique: true },
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

  var query = lessonModel
    .find({
      topic: this._id,
      ord: { $gte: 0 },
      deleted: { $ne: true }
    })
    .sort({ ord: 1 });

  if (fields) {
    query = query.select(fields);
  }

  return query.exec((err, item) => {
    if (callback) {
      callback(err, item);
    }
  });
};

module.exports = mongoose.model("Topic", Topic);
