/**
 * Manage a history of versions of the app
 * with the ability to easily define
 * a 'latest' and 'min' version
 */
const mongoose = require('./mongoose');
const Schema = mongoose.Schema;

/**
 * subdoc for a lesson the demo user has completed
 */
const Version = new Schema(
  {
    version: {
      type: String, // e.g. '1.0.0'
      required: '{PATH} is required!',
    },
    notes: {
      type: String,
      default: 1.0,
    },
  },
  { timestamps: true }
);

const AppVersions = new Schema(
  {
    platform: {
      type: String, // e.g. 'ios' or 'android'
      required: '{PATH} is required!',
      unique: true,
    },
    appId: {
      type: String, // e.g., the iTunes or Google Play artificial-key app id
      required: '{PATH} is required!',
    },
    appUpdateUrl: {
      type: String, // url called to launch app update on device, e.g., itms-apps://itunes.apple.com/app/id{0} for Apple App Store
      required: '{PATH} is required!',
    },
    versionMin: {
      type: String, // should match one of the defined versions
    },
    versionLatest: {
      type: String, // should match one of the defined versions
    },
    versions: [Version],
  },
  { timestamps: true }
);

AppVersions.set('toJSON', {
  virtuals: true,
  transform: (doc, ret, opts) => {
    delete ret.__v;
    delete ret._id; // don't pass id in JSON; 'platform' is the primary key
  },
});

module.exports = mongoose.model('AppVersions', AppVersions);
