const mongoose = require("./utils/mongoose");
const Schema = mongoose.Schema;
const Lesson = require("./Lesson");
const Resource = require("./Resource");
const User = require("./User");

const ResourceStatus = new Schema(
  {
    resource: {
      type: Schema.Types.ObjectId,
      ref: "Resource",
      required: "{PATH} is required!"
    },
    isTerminationPending: { type: Boolean, default: true }
  },
  { timestamps: true }
);

const UserLessonSession = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: "{PATH} is required!"
    },
    session: { type: String, required: "{PATH} is required!" },
    lesson: {
      type: Schema.Types.ObjectId,
      ref: "Lesson"
    },
    resourceStatuses: [ResourceStatus]
  },
  { timestamps: true }
);

UserLessonSession.index({ user: 1, session: 1 }, { unique: true });
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

UserLessonSession.statics.isResourceTerminationPending = async function(
  user,
  session,
  resource
) {
  const lessSess = await this.findOneByUserAndSession(user, session);
  if (!lessSess) {
    return false;
  }
  const resourceId =
    resource instanceof Resource ? `${resource._id}` : `${resource}`;
  const rs = lessSess.resourceStatuses.find(
    x => `${x.resource}` === `${resourceId}`
  );
  return Boolean(rs && rs.isTerminationPending);
};

UserLessonSession.statics.setResourceTerminationPending = async function(
  user,
  session,
  resource,
  terminationPending = true
) {
  if (!(user && user instanceof User)) {
    throw new Error("user must be a User instance");
  }
  if (!(session && typeof session === "string")) {
    throw new Error("session must be a non-empty string");
  }
  const resourceId =
    resource instanceof Resource ? `${resource._id}` : `${resource}`;
  if (!resourceId) {
    throw new Error("resource must a string, ObjectId or Resource instance");
  }
  const lessSess =
    (await this.findOneByUserAndSession(user, session)) ||
    (await this.findOneAndUpdate(
      { user: user.id, session },
      {
        user: user.id,
        session
      },
      { upsert: true, new: true }
    ).exec());
  lessSess.resourceStatuses = Array.isArray(lessSess.resourceStatuses)
    ? lessSess.resourceStatuses
    : [];
  let rs = lessSess.resourceStatuses.find(
    x => `${x.resource}` === `${resourceId}`
  );
  if (rs) {
    rs.isTerminationPending = Boolean(terminationPending);
  } else {
    rs = {
      resource: new mongoose.Types.ObjectId(resourceId),
      isTerminationPending: Boolean(terminationPending)
    };
    lessSess.resourceStatuses.push(rs);
  }
  await lessSess.save();
  return lessSess;
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
