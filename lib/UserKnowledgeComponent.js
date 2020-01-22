const mongoose = require("./mongoose");
const Schema = mongoose.Schema;

const User = require("./User");
const KnowledgeComponent = require("./KnowledgeComponent");

const UserKnowledgeComponent = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: "{PATH} is required!",
      index: true
    },
    kc: {
      type: Schema.Types.ObjectId,
      ref: "KnowledgeComponent",
      required: "{PATH} is required!",
      index: true
    },
    mastery: {
      type: Schema.Types.Number,
      required: "{PATH} is required!",
      default: 0
    },
    timestamp: {
      type: Schema.Types.Date,
      required: "{PATH} is required!"
    },
    avgTimeDecay: {
      type: Schema.Types.Number,
      required: "{PATH} is required!",
      default: 1
    },
    asymptote: {
      type: Schema.Types.Number,
      required: "{PATH} is required!",
      default: 0
    }
  },
  { timestamps: true }
);

/**
 * Unique index of user/kc. User can only have one record per kc
 */
UserKnowledgeComponent.index({ user: 1, kc: 1 }, { unique: true });

/**
 * Inserts a new record for user/kc mastery *or*
 * if the user has an existing record for the kc *and* that record's
 * timestamp is older than this update, update the existing record.
 *
 * The reason to ignore updates that are older than the current record
 * is users may be working offline and then kc-mastery updates come in
 * via synced learning records. We never want to replace the current mastery
 * with an older value. It is up to clients to handle recalculating mastery
 * when they encounter synced/out-of-order records.
 *
 * @param {User} user - the user
 * @param {KnowledgeComponent|string} kc - the KnowledgeComponent or its id
 * @param {Date|string} data.timestamp - timestamp of the mastery values
 * @param {Number} data.mastery - normalized mastery value
 * @param {Number} data.avgTimeDecay - used to calculate mastery decay
 * @param {Number} data.asymptote - used to calculate mastery decay
 */
UserKnowledgeComponent.statics.insertOrUpdateIfNewer = async function(
  user,
  kc,
  data
) {
  const userKCModel = this;

  // TODO: validate all input fields
  const userId = user instanceof User ? user.id : user;
  const kcId = kc instanceof KnowledgeComponent ? kc.id : kc;

  const timestamp = new Date(data.timestamp);
  const avgTimeDecay = data.avgTimeDecay;
  const asymptote = data.asymptote;
  const mastery = data.mastery;

  let userKC = await userKCModel.findOne({
    user: userId,
    kc: kcId
  });

  if (
    userKC &&
    userKC.timestamp instanceof Date &&
    !(timestamp > userKC.timestamp)
  ) {
    return;
  }

  await userKCModel
    .findOneAndUpdate(
      {
        user: userId,
        kc: kcId
      },
      {
        user: userId,
        kc: kcId,
        mastery: mastery,
        timestamp: timestamp,
        avgTimeDecay: avgTimeDecay,
        asymptote: asymptote
      },
      {
        upsert: true
      }
    )
    .exec();
};

UserKnowledgeComponent.plugin(require("./plugins/mongoose-no-underscore-id"));
UserKnowledgeComponent.plugin(require("mongoose-findorcreate"));

module.exports = mongoose.model(
  "UserKnowledgeComponent",
  UserKnowledgeComponent
);
