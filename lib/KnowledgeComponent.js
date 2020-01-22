const mongoose = require('./mongoose');
const Schema = mongoose.Schema;

const KnowledgeComponent = new Schema(
  {
    name: { type: String, required: '{PATH} is required!' },
    alias: { type: String, required: '{PATH} is required!', unique: true },
    desc: { type: String, required: '{PATH} is required!' },
  },
  { timestamps: true }
);

KnowledgeComponent.plugin(
  require('./plugins/mongoose-find-one-by-id-or-alias')
);
KnowledgeComponent.plugin(require('./plugins/mongoose-no-underscore-id'));
KnowledgeComponent.plugin(require('mongoose-findorcreate'));

module.exports = mongoose.model('KnowledgeComponent', KnowledgeComponent);
