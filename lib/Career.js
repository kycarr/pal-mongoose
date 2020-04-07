const mongoose = require("./utils/mongoose");
const Schema = mongoose.Schema;

const Career = new Schema(
  {
    name: { type: String, required: "{PATH} is required!" },
    alias: { type: String, required: "{PATH} is required!", unique: true },
    pronunciation: { type: String },
    defaultSuggested: { type: Boolean, default: false },
    desc: { type: String, required: "{PATH} is required!" },
    suggestedGoals: [{ type: Schema.Types.ObjectId, ref: "Goal" }],
    ord: { type: Number, default: 1 },
    deleted: { type: Boolean }
  },
  { timestamps: true }
);

Career.plugin(require("./plugins/mongoose-find-one-by-id-or-alias"));
Career.plugin(require("./plugins/mongoose-no-underscore-id"));

Career.statics.findSuggested = async function() {
  const model = this;
  const defaultSuggested = await model.findOne({
    defaultSuggested: true
  });
  if (defaultSuggested) {
    return defaultSuggested;
  }
  return await model.findOne();
};

module.exports = mongoose.model("Career", Career);
