/**
 * NOTE:
 *
 * It would be much simpler to just have an accessToken field in User,
 * and it would also be less resource intensive.
 * The reason we keep it separate is becsause otherwise
 * it would be too easy for access tokens in leak in the process
 * of querying user objects (e.g. friends)
 */

const mongoose = require('./mongoose');
const uuid = require('uuid');
const convertHex = require('convert-hex');
const crypto = require('crypto');
const Schema = mongoose.Schema;

const UserAccessToken = new Schema(
  {
    accessToken: { type: String, unique: true },
    resetPasswordToken: { type: String, unique: true },
    resetPasswordExpires: { type: Date, default: Date.now },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: '{PATH} is required!',
      unique: true,
    },
  },
  { timestamps: true }
);

UserAccessToken.plugin(require('./plugins/mongoose-to-id'));
UserAccessToken.plugin(require('mongoose-findorcreate'));
UserAccessToken.plugin(require('./plugins/mongoose-no-underscore-id'));

UserAccessToken.statics.loginWithCredentials = function(
  userName,
  password,
  deviceId,
  callback
) {
  const self = this;
  const promise = new Promise((resolve, reject) => {
    if (!userName) {
      const err = new Error('user name cannot be null or empty');
      err.status = 400;
      return reject(err);
    }
    if (!password) {
      const err = new Error('password cannot be null or empty');
      err.status = 400;
      return reject(err);
    }
    const userModel = mongoose.model('User');
    userModel
      .loginWithCredentials(userName, password, deviceId)
      .then(user => {
        self
          ._findOrCreateTokenForUser(user)
          .then(userToken => resolve(userToken))
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

UserAccessToken.statics.signUpWithCredentials = function(
  userName,
  password,
  email,
  deviceId,
  callback
) {
  const self = this;
  const promise = new Promise((resolve, reject) => {
    if (!userName) {
      const err = new Error('username cannot be null or empty');
      err.status = 400;
      return reject(err);
    }
    if (!password) {
      const err = new Error('password cannot be null or empty');
      err.status = 400;
      return reject(err);
    }
    if (!email) {
      const err = new Error('email cannot be null or empty');
      err.status = 400;
      return reject(err);
    }
    mongoose
      .model('User')
      .signUpWithCredentials(userName, password, email, deviceId)
      .then(user => {
        self
          ._findOrCreateTokenForUser(user)
          .then(userToken => resolve(userToken))
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

UserAccessToken.statics.authenticate = function(accessToken, callback) {
  this.findOne({ accessToken: accessToken }, (err, token) => {
    if (err) {
      return callback(err);
    }

    if (!token) {
      err = new Error('token not found');
      err.status = 401;
      return callback(err);
    }

    const userModel = mongoose.model('User');
    userModel.findActiveById(token.user, function(userErr, user) {
      if (userErr) {
        return callback(userErr);
      }

      if (!user) {
        err = new Error(
          'cannot find associated user for token (userid=' + token.user + ')'
        );
        err.status = 401;
        return callback(err);
      }

      token.user = user;

      callback(null, token);
    });
  });
};

UserAccessToken.statics.loginWithAccessToken = function(
  accessToken,
  deviceId,
  callback
) {
  this.findOne({ accessToken: accessToken }, function(err, token) {
    if (err) {
      return callback(err);
    }

    if (!token) {
      err = new Error('token not found');
      err.status = 401;
      return callback(err);
    }

    const userModel = mongoose.model('User');
    userModel.login(token.user, deviceId, (userErr, user) => {
      if (userErr) {
        return callback(userErr);
      }

      if (!user) {
        err = new Error(
          'cannot find associated user for token (userid=' + token.user + ')'
        );
        err.status = 401;
        return callback(err);
      }

      token.user = user;

      callback(null, token);
    });
  });
};

UserAccessToken.statics.forgotPassword = function(email) {
  const self = this;
  return new Promise((resolve, reject) => {
    if (!email) {
      return reject(new Error('Must pass a valid email'));
    }
    self.find({}).then(all => {
      const userModel = mongoose.model('User');
      userModel
        .findUserByEmail(email)
        .then(user => {
          if (!user) {
            var err = new Error('Email not found.');
            err.status = 401;
            return reject(err);
          }
          self
            ._findOrCreateTokenForUser(user)
            .then(userAccessToken => {
              if (!userAccessToken) {
                const err = new Error('User not found.');
                err.status = 401;
                return reject(err);
              }
              const resetToken = crypto.randomBytes(20).toString('hex');
              userAccessToken._forgotPassword(resetToken);
              userAccessToken.user = user;
              return resolve(userAccessToken);
            })
            .catch(err => reject(err));
        })
        .catch(err => reject(err));
    });
  });
};

UserAccessToken.statics.resetPassword = function(token, password) {
  const self = this;
  return new Promise((resolve, reject) => {
    if (!token) {
      return reject(new Error('must pass a valid reset token'));
    }
    if (!password) {
      return reject(new Error('must pass a valid password'));
    }
    self
      .findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
      })
      .then(userAccessToken => {
        if (!userAccessToken) {
          var err = new Error('Password reset link is invalid or has expired.');
          err.status = 401;
          return reject(err);
        }
        mongoose
          .model('User')
          .findActiveById(userAccessToken.user)
          .then(user => {
            if (!user) {
              err = new Error(
                'cannot find associated user for token (userid=' +
                  token.user +
                  ')'
              );
              err.status = 401;
              return reject(err);
            }
            mongoose
              .model('User')
              .resetPassword(user.name, password)
              .then(user => {
                if (!user) {
                  return reject(new Error('server error'));
                }
                userAccessToken._forgotPassword(null);
                userAccessToken.user = user;
                return resolve(userAccessToken);
              })
              .catch(err => reject(err));
          })
          .catch(err => reject(err));
      })
      .catch(err => reject(err));
  });
};

/***
 * Used internally, creates an accessToken string from a user
 *
 * @param user - User object
 * @returns an access token string
 */
UserAccessToken.statics._findOrCreateTokenForUser = function(user, callback) {
  const self = this;
  const userAccessTokenModel = this;
  const userId = this.toId(user);
  const promise = new Promise((resolve, reject) => {
    self.findOne({ user: userId }, (err, userAccessToken) => {
      if (err) {
        return reject(err);
      }
      if (userAccessToken) {
        userAccessToken.user = user; // needs to be populated
        return resolve(userAccessToken);
      }
      const userIdBytes = convertHex.hexToBytes(user._id.toHexString());
      const accessToken = uuid.v1({ node: userIdBytes.slice(6) }); // use the last 6 bytes of the user's id to generate the access token (the first 6 bytes are time and machine)
      userAccessToken = new userAccessTokenModel({
        accessToken: accessToken,
        user: userId,
      });
      userAccessToken.save(saveAuthTokenErr => {
        if (saveAuthTokenErr) {
          return reject(saveAuthTokenErr);
        }
        userAccessTokenModel
          .findOne({ user: userId })
          .then(newToken => {
            if (!newToken) {
              return reject(new Error('failed to create token'));
            }
            newToken.user = user;
            return resolve(newToken);
          })
          .catch(err => reject(err));
      });
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

UserAccessToken.methods._forgotPassword = function(token, callback) {
  const userAccessToken = this;
  userAccessToken.resetPasswordToken = token;
  userAccessToken.resetPasswordExpires = Date.now() + 360000;

  userAccessToken.save(saveErr => {
    if (!callback) {
      return;
    }
    if (saveErr) {
      return callback(saveErr);
    }
    return callback(null, userAccessToken);
  });
};

module.exports = mongoose.model('UserAccessToken', UserAccessToken);
