const mongoose = require("./utils/mongoose");
const Schema = mongoose.Schema;

const Lesson = new Schema(
  {
    name: { type: String, required: "{PATH} is required!" },
    alias: { type: String, required: "{PATH} is required!", unique: true },
    pronunciation: { type: String },
    type: { type: String, required: "{PATH} is required!", index: true },
    displayType: { type: String, required: "{PATH} is required!", index: true },
    desc: { type: String, required: "{PATH} is required!" },
    downloadable: { type: Boolean },
    estMinLow: { type: Number, default: 1 },
    estMinHigh: { type: Number, default: 2 },
    topic: {
      type: Schema.Types.ObjectId,
      ref: "Topic",
      required: "{PATH} is required!",
      index: true
    },
    resources: [{ type: Schema.Types.ObjectId, ref: "Resource" }],
    ord: { type: Number, default: 1 },
    deleted: { type: Boolean }
  },
  { timestamps: true }
);

Lesson.plugin(require("./plugins/mongoose-find-one-by-id-or-alias"));
Lesson.plugin(require("./plugins/mongoose-no-underscore-id"));
Lesson.plugin(require("mongoose-findorcreate"));

module.exports = mongoose.model("Lesson", Lesson);
