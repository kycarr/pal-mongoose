/**
 * For mongoose model functions that generally return a Promise,
 * but also accept an optional callback.
 *
 * If the callback is not passed, then just return the promise.
 * If the callback *is* passed,
 * then await the promise and pass the result (or error) to the callback.
 *
 * NOTE: in general we should be deprecating the use of callbacks
 * and any time we can be sure that a function has no dependent callers
 * what use the callback, eliminate it from the api/function signature.
 */
function handlePromiseOrCallback(promise, callback) {
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
}
module.exports = handlePromiseOrCallback;
