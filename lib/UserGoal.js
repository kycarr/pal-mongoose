const mongoose = require("./utils/mongoose");
const Schema = mongoose.Schema;
const Goal = require("./Goal");
const User = require("./User");
const UserGoal = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: "{PATH} is required!",
      unique: true
    },
    activeGoal: {
      type: Schema.Types.ObjectId,
      ref: "Goal",
      required: "{PATH} is required!",
      index: true
    },
    activeFocus: {
      type: String,
      ref: "Goal.focusList",
      required: "{PATH} is required!",
      index: true
    }
  },
  { timestamps: true }
);
UserGoal.plugin(require("./plugins/mongoose-to-id"));
UserGoal.plugin(require("mongoose-findorcreate"));
UserGoal.plugin(require("./plugins/mongoose-no-underscore-id"));

UserGoal.statics.findForUser = async function(user) {
  if (!(user instanceof User)) {
    throw new Error("user param must be a User instance");
  }
  return await this.findOne({ user: user.id }).exec();
};

UserGoal.statics.saveGoalAndFocus = async function(user, goalId, focusId) {
  if (!(user instanceof User)) {
    throw new Error("user param must be a User instance");
  }
  const userGoalModel = this;
  const goal = await Goal.findOneByIdOrAlias(goalId);
  if (!goal) {
    throw new Error(`no such goal: ${goalId}`);
  }
  const focus = focusId ? goal.findFocusByIdOrAlias(focusId) : null;
  const userGoal = await userGoalModel
    .findOneAndUpdate(
      { user: user.id },
      {
        user: user.id,
        activeGoal: goal ? goal.id : undefined,
        activeFocus: focus ? focus.id : undefined
      },
      { upsert: true, new: true }
    )
    .exec();
  return userGoal;
};
module.exports = mongoose.model("UserGoal", UserGoal);
