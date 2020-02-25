const mongoose = require("./utils/mongoose");
const Schema = mongoose.Schema;
const Lesson = require("./Lesson");
const User = require("./User");

const UserLessonSession = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: "{PATH} is required!",
      unique: true
    },
    session: { type: String, required: "{PATH} is required!" },
    lesson: {
      type: Schema.Types.ObjectId,
      ref: "Lesson",
      required: "{PATH} is required!",
      unique: true
    }
  },
  { timestamps: true }
);

UserLessonSession.index({ user: 1, sessionId: 1 }, { unique: true });
UserLessonSession.plugin(require("./plugins/mongoose-to-id"));
UserLessonSession.plugin(require("mongoose-findorcreate"));
UserLessonSession.plugin(require("./plugins/mongoose-no-underscore-id"));

UserLessonSession.statics.findOneByUserAndSession = async function(
  user,
  session
) {
  if (!(user && user instanceof User)) {
    throw new Error("user must be a User instance");
  }
  if (!session && typeof session === "string") {
    throw new Error("session must be a non-empty string");
  }
  return await this.findOne({ user: user.id, session }).exec();
};

UserLessonSession.statics.saveUserLessonSession = async function(
  user,
  session,
  lesson
) {
  if (!(user && user instanceof User)) {
    throw new Error("user must be a User instance");
  }
  if (!(lesson && lesson instanceof Lesson)) {
    throw new Error("lesson must be a Lesson instance");
  }
  if (!(session && typeof session === "string")) {
    throw new Error("session must be a non-empty string");
  }
  return await this.findOneAndUpdate(
    { user: user.id, session },
    {
      user: user.id,
      session,
      lesson: lesson.id
    },
    { upsert: true, new: true }
  ).exec();
};

module.exports = mongoose.model("UserLessonSession", UserLessonSession);
