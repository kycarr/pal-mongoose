const mongoose = require("mongoose");
const mongoUnit = require("mongo-unit");

mongoUnit
  .start()
  .then(url => {
    console.log("fake mongo is started with url: ", url);
    process.env.MONGO_URI = url; // this var process.env.DATABASE_URL = will keep link to fake mongo
    return mongoose.connect(url, {
      reconnectTries: Number.MAX_VALUE,
      reconnectInterval: 1000,
      useFindAndModify: false,
      useNewUrlParser: true
    });
  })
  .then(() => {
    mongoose.set("useCreateIndex", true);
    console.log("mongoose: connection successful");
    run(); // this line start mocha tests
  });

after(async () => {
  try {
    await mongoose.disconnect();
  } catch (mongooseDisconnectErr) {
    console.log(`error on mongoose disconnect: ${mongooseDisconnectErr}`);
  }
  try {
    await mongoUnit.stop();
  } catch (mongoUnitErr) {
    console.log(`error on mongo unit stop: ${mongoUnitErr}`);
  }
});
