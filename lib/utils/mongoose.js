try {
  module.exports = require("mongoose");
} catch (_) {
  // workaround when `npm link`'ed for development
  const prequire = require("parent-require");
  module.exports = prequire("mongoose");
}
