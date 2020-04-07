const mongoose = require("./utils/mongoose");
const arrayToUnique = require("./utils/array-to-unique");
const Schema = mongoose.Schema;

/**
 * Subdocument for a goals
 */
const Focus = new Schema({
  _id: { type: String, required: "{PATH} is required!" },
  name: { type: String, required: "{PATH} is required!" },
  pronunciation: { type: String },
  desc: { type: String, required: "{PATH} is required!" },
  topics: [{ type: Schema.Types.ObjectId, ref: "Topic" }]
});

Focus.plugin(require("./plugins/mongoose-no-underscore-id"));

const Goal = new Schema(
  {
    name: { type: String, required: "{PATH} is required!" },
    pronunciation: { type: String },
    desc: { type: String, required: "{PATH} is required!" },
    alias: { type: String, required: "{PATH} is required!", unique: true },
    focusList: [Focus]
  },
  { timestamps: true }
);

Goal.plugin(require("./plugins/mongoose-find-one-by-id-or-alias"));
Goal.plugin(require("./plugins/mongoose-no-underscore-id"));
Goal.plugin(require("./plugins/mongoose-to-id"));
Goal.plugin(require("mongoose-findorcreate"));

Goal.methods.findAllKnowledgeComponents = async function() {
  const topicIds = this.findUniqueTopicIds();

  const topics = await mongoose
    .model("Topic")
    .find({ _id: { $in: topicIds } })
    .exec();

  return Object.getOwnPropertyNames(
    topics.reduce((acc, cur) => {
      if (!Array.isArray(cur.knowledgeComponents)) {
        return acc;
      }
      cur.knowledgeComponents.forEach(kcr => (acc[kcr.kc] = kcr.kc));
      return acc;
    }, {})
  );
};

Goal.methods.findFocusByIdOrAlias = function(idOrAlias) {
  if (!this.focusList || this.focusList.length == 0) {
    return null;
  }

  let id = this.toId(idOrAlias);

  for (var i = 0; i < this.focusList.length; i++) {
    let f = this.focusList[i];
    if (f.id === id || f.alias === idOrAlias) {
      return f;
    }
  }

  return null;
};

Goal.methods.findUniqueTopicIds = function() {
  if (!this.focusList) {
    return [];
  }

  const all = this.focusList.reduce((acc, cur) => {
    return cur.topics ? [...acc, ...cur.topics] : acc;
  }, []);

  return arrayToUnique(all);
};

module.exports = mongoose.model("Goal", Goal);
