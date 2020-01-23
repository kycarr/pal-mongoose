const { promisify } = require("es6-promisify");
const bcrypt = require("bcrypt-nodejs");
const bcryptHash = promisify(bcrypt.hash);
const mongoose = require("./mongoose");
const Schema = mongoose.Schema;

const User = new Schema(
  {
    creationDeviceId: { type: String, index: true }, // device id passed when user was created
    nameLower: {
      type: String,
      required: "{PATH} is required!",
      unique: true,
      lowercase: true,
      trim: true
    },
    name: { type: String, required: "{PATH} is required!" },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    lastLoginAt: { type: Date, default: Date.now },
    lastDeviceId: { type: String, index: true },
    deleted: { type: Boolean, index: true, sparse: true },
    deletedReason: { type: String },
    type: { type: String } // usually undefined. Type 'demo' indicates to client to not save learner records, etc.
  },
  { timestamps: true }
);

User.plugin(require("./plugins/mongoose-to-id"));
User.plugin(require("mongoose-findorcreate"));
User.plugin(require("./plugins/mongoose-no-underscore-id"));

/**
 * Basic findById but does NOT return requested user
 * if the user exists and is marked deleted
 *
 * @param {ObjectId} userId
 * @param {function(err,user)} callback - (optional)
 * @returns {undefined|Promise} promise if no callback passed
 */
User.statics.findActiveById = function(userId, callback) {
  const userModel = this;

  const promise = new Promise((resolve, reject) => {
    userModel.findOne({ _id: userId, deleted: { $ne: true } }, (err, user) => {
      if (err) {
        return reject(err);
      }
      return resolve(user);
    });
  });

  if (!callback) {
    return promise;
  }

  promise
    .then(pRes => {
      return callback(null, pRes);
    })
    .catch(pErr => {
      return callback(pErr);
    });
};

/**
 * Basic find but does NOT return any users where deleted==true
 */
User.statics.findActive = function(query) {
  const userModel = this;
  query = query || {};
  return new Promise((resolve, reject) => {
    userModel.find({ ...query, deleted: { $ne: true } }, (err, user) => {
      if (err) {
        return reject(err);
      }
      return resolve(user);
    });
  });
};

User.statics.findOneActive = function(query) {
  const userModel = this;
  query = query || {};
  return new Promise((resolve, reject) => {
    userModel.findOne({ ...query, deleted: { $ne: true } }, (err, user) => {
      if (err) {
        return reject(err);
      }
      return resolve(user);
    });
  });
};

User.statics.isUserNameAvailable = function(userName, callback) {
  const userModel = this;
  const promise = new Promise((resolve, reject) => {
    userModel
      .findOne({ nameLower: userName.toLowerCase() })
      .then(user => resolve(!Boolean(user)))
      .catch(err => reject(err));
  });
  if (!callback) {
    return promise;
  }
  promise
    .then(pRes => {
      return callback(null, pRes);
    })
    .catch(pErr => {
      return callback(pErr);
    });
};

User.statics.isEmailAvailable = function(email, callback) {
  const userModel = this;
  const promise = new Promise((resolve, reject) => {
    userModel.findOne({ email: email.toLowerCase() }, (err, user) => {
      if (err) {
        return reject(err);
      }
      return resolve(!Boolean(user));
    });
  });
  if (!callback) {
    return promise;
  }
  promise
    .then(pRes => {
      return callback(null, pRes);
    })
    .catch(pErr => {
      return callback(pErr);
    });
};

/**
 * Find the user with given userId, mark them as logged in,
 * and then return user via callback
 * @param {string} userId
 * @param {string} deviceId - the device id to login
 * @param {function(err, user)} callback
 */
User.statics.login = function(userId, deviceId, callback) {
  var userModel = this;
  userId = userModel.toId(userId);
  userModel.findOne({ _id: userId, deleted: { $ne: true } }, (err, user) => {
    if (err) {
      return callback(err);
    }

    user._login(deviceId); // don't wait for save callback to return

    return callback(null, user);
  });
};

/**
 * Finds and returns the user having the passed access token.
 *
 * @param {string} accessToken
 * @param {function(err, user)} callback
 */
User.statics.authenticate = function(accessToken, callback) {
  var self = this;

  mongoose
    .model("UserAccessToken")
    .authenticate(accessToken, function(err, uat) {
      if (err) {
        return callback(err);
      }
      if (!uat) {
        return callback();
      }
      const userId = self.toId(uat.user);
      return self.findOne({ _id: userId, deleted: { $ne: true } }, callback);
    });
};

User.statics.loginWithCredentials = function(
  userNameOrEmail,
  password,
  deviceId,
  callback
) {
  const self = this;
  const promise = new Promise((resolve, reject) => {
    if (!userNameOrEmail) {
      return reject(new Error("must pass a valid username"));
    }
    if (!password) {
      return reject(new Error("must pass a valid password"));
    }
    self
      .findOne({
        $or: [
          { email: userNameOrEmail.toLowerCase() },
          { nameLower: userNameOrEmail.toLowerCase() }
        ],
        deleted: { $ne: true }
      })
      .then(user => {
        if (!user) {
          var err = new Error("Username not found.");
          err.status = 401;
          return reject(err);
        }
        if (user.type === "demo") {
          return resolve(user);
        }
        bcrypt.compare(password, user.password, function(err, result) {
          if (!result) {
            const retErr = new Error("Incorrect password.");
            retErr.status = 401;
            return reject(retErr);
          }
          user._login(deviceId);
          return resolve(user);
        });
      })
      .catch(err => reject(err));
  });
  if (!callback) {
    return promise;
  }
  promise
    .then(pRes => {
      return callback(null, pRes);
    })
    .catch(pErr => {
      return callback(pErr);
    });
};

User.statics.signUpWithCredentials = function(
  userName,
  password,
  email,
  deviceId,
  callback
) {
  const userModel = this;
  const promise = new Promise((resolve, reject) => {
    if (!userName) {
      return reject(new Error("must pass a valid userName"));
    }
    if (!password) {
      return reject(new Error("must pass a valid password"));
    }
    if (!email) {
      return reject(new Error("must pass a valid email"));
    }
    userModel
      .findOne({
        $or: [
          { email: email.toLowerCase() },
          { nameLower: userName.toLowerCase() }
        ]
      })
      .then(user => {
        if (user) {
          var err = new Error("Username or email already exists.");
          err.status = 401;
          return reject(err);
        }
        bcryptHash(password, null, null)
          .then(hash => {
            user = new userModel({
              creationDeviceId: deviceId,
              lastDeviceId: deviceId,
              lastLoginAt: new Date(),
              name: userName,
              nameLower: userName.toLowerCase(),
              password: hash,
              email: email.toLowerCase()
            });
            user
              .save()
              .then(user => resolve(user))
              .catch(err => reject(err));
          })
          .catch(err => reject(err));
      })
      .catch(err => reject(err));
  });
  if (!callback) {
    return promise;
  }
  promise
    .then(pRes => {
      return callback(null, pRes);
    })
    .catch(pErr => {
      return callback(pErr);
    });
};

User.statics.resetPassword = function(username, password, callback) {
  const self = this;
  const promise = new Promise((resolve, reject) => {
    if (!username) {
      return reject(new Error("must pass a valid username"));
    }
    if (!reject) {
      return callback(new Error("must pass a valid password"));
    }
    self
      .findOne({ nameLower: username.toLowerCase() })
      .then(user => {
        if (!user) {
          var err = new Error("User could not be found.");
          err.status = 401;
          return reject(err);
        }
        bcryptHash(password, null, null)
          .then(hash => {
            user._updatePassword(hash);
            return resolve(user);
          })
          .catch(err => reject(err));
      })
      .catch(err => reject(err));
  });
  if (!callback) {
    return promise;
  }
  promise
    .then(pRes => {
      return callback(null, pRes);
    })
    .catch(pErr => {
      return callback(pErr);
    });
};

/**
 * updates the users lastLoginAt and lastDeviceId
 * as we want for each time a user logs in.
 * @param {string} deviceId - the device id to login
 * @param {function(err, user)} callback
 */
User.methods._login = function(deviceId, callback) {
  const user = this;
  user.lastLoginAt = new Date();
  user.lastDeviceId = deviceId;
  user.save(saveErr => {
    if (!callback) {
      return;
    }

    if (saveErr) {
      return callback(saveErr);
    }
    return callback(null, user);
  });
};

User.methods._updatePassword = function(password, callback) {
  const user = this;
  user.password = password;
  user.save(saveErr => {
    if (!callback) {
      return;
    }
    if (saveErr) {
      return callback(saveErr);
    }
    return callback(null, user);
  });
};

/**
 * Delete this account (by marking it 'deleted').
 * Actual removal of account records happens elsewhere
 *
 * @param reason - marked on deleted account for later investigation
 * @return if no callback passed, then returns a Promise, otherwise void
 */
User.methods.deleteAccount = function(reason, callback) {
  const user = this;

  const promise = new Promise((resolve, reject) => {
    user.deleted = true;
    user.deletedReason = reason;

    user.save(saveErr => {
      if (saveErr) {
        return reject(saveErr);
      }
      return resolve(user);
    });
  });

  if (!callback) {
    return promise;
  }

  promise
    .then(pRes => {
      return callback(null, pRes);
    })
    .catch(pErr => {
      return callback(pErr);
    });
};

User.methods.isDemoUser = function() {
  return this.type === "demo";
};

module.exports = mongoose.model("User", User);
