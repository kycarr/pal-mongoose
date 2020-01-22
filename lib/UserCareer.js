const mongoose = require("./mongoose");
const Schema = mongoose.Schema;
const UserCareer = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: "{PATH} is required!",
      unique: true
    },
    isConfirmed: { type: Boolean }
  },
  { timestamps: true }
);

UserCareer.plugin(require("./plugins/mongoose-to-id"));
UserCareer.plugin(require("mongoose-findorcreate"));
UserCareer.plugin(require("./plugins/mongoose-no-underscore-id"));
module.exports = mongoose.model("UserCareer", UserCareer);
