/**
 * A DemoUser record holds special info related to demo users,
 * specifically what learner records the user has in abbreviated form,
 * e.g. lessons-completed, knowledge-component mastery etc
 */
const mongoose = require("./utils/mongoose");
const Schema = mongoose.Schema;

/**
 * subdoc for a lesson the demo user has completed
 */
const DemoUserLesson = new Schema({
  lesson: {
    type: Schema.Types.ObjectId,
    ref: "Lesson",
    required: "{PATH} is required!"
  },
  score: {
    type: Number,
    default: 1.0
  }
});

/**
 * subdoc for a knowledge component for which the demo user has a mastery score
 */
const DemoUserKnowledge = new Schema({
  kc: {
    type: Schema.Types.ObjectId,
    ref: "KnowledgeComponent",
    required: "{PATH} is required!"
  },
  score: {
    type: Number,
    default: 1.0
  }
  // TODO: add decay params @see UserKnowledgeComponent
});

const DemoUser = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: "{PATH} is required!",
      unique: true
    },
    goal: {
      type: Schema.Types.ObjectId,
      ref: "Goal"
    },
    focus: {
      type: String
    },
    topic: {
      type: Schema.Types.ObjectId,
      ref: "Topic"
    },
    // TODO: specify focus and topic for goal (if needed?)
    lessons: [DemoUserLesson],
    kcs: [DemoUserKnowledge]
  },
  { timestamps: true }
);

DemoUser.plugin(require("./plugins/mongoose-to-id"));
DemoUser.plugin(require("mongoose-findorcreate"));
DemoUser.plugin(require("./plugins/mongoose-no-underscore-id"));

module.exports = mongoose.model("DemoUser", DemoUser);
