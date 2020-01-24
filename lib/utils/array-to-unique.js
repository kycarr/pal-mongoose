const arrayToUnique = a => {
  a.sort();
  return a.reduce((acc, cur, i, arr) => {
    if (i > 1 && arr[i - 1] == cur) {
      return acc;
    }

    acc.push(cur);
    return acc;
  }, []);
};

module.exports = arrayToUnique;
