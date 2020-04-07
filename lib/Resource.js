const mongoose = require("./utils/mongoose");
const Schema = mongoose.Schema;
const KnowledgeComponentRelevance = require("./schema/KnowledgeComponentRelevance");

const Asset = new Schema({
  name: {
    type: String,
    required: "{PATH} is required!"
  },
  type: {
    type: String,
    required: "{PATH} is required!"
  },
  uri: {
    type: String,
    required: "{PATH} is required!"
  }
});

// these are embedded docs and clients have no reason to know their db ids
Asset.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.__v;
    delete ret._id;
  }
});

const Resource = new Schema(
  {
    name: { type: String, required: "{PATH} is required!" },
    alias: { type: String, required: "{PATH} is required!", unique: true },
    pronunciation: { type: String },
    // type is really the launch type, e.g. web
    type: { type: String, required: "{PATH} is required!", index: true },
    // contentType is the exact content type--e.g. mentorpal is a contentType where the 'type' (launch type) is 'web'
    contentType: { type: String, required: "{PATH} is required!", index: true },
    uri: { type: String, required: "{PATH} is required!", index: true }, // TODO: probably better to have a 'data' object which could be a string or properties
    explorationLevel: { type: Number, default: 0 },
    duration: { type: Number, default: 60 },
    assets: [Asset],
    knowledgeComponents: [KnowledgeComponentRelevance],
    // set TRUE to have xapi statements created by external/cmi5 resources passed to client with activity-type 'cmi5-au'
    isCmiAU: { type: Boolean, index: true, sparse: true }
  },
  { timestamps: true }
);

Resource.plugin(require("./plugins/mongoose-find-one-by-id-or-alias"));
Resource.plugin(require("./plugins/mongoose-no-underscore-id"));
Resource.plugin(require("mongoose-findorcreate"));

module.exports = mongoose.model("Resource", Resource);
