const mongoose = require("../mongoose");
const Schema = mongoose.Schema;

const KnowledgeComponentRelevance = new Schema({
  kc: {
    type: Schema.Types.ObjectId,
    ref: "KnowledgeComponent",
    required: "{PATH} is required!",
    index: true
  },
  relevance: {
    type: Number,
    min: 0,
    max: 1,
    default: 1
  }
});

// these are embedded docs and clients have no reason to know their db ids
KnowledgeComponentRelevance.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.__v;
    delete ret._id;
  }
});

module.exports = KnowledgeComponentRelevance;
