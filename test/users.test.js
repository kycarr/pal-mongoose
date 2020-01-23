const { expect } = require("chai");
const mongoUnit = require("mongo-unit");
const mongoose = require("mongoose");
const User = require("User");

describe("users", function() {
  beforeEach(async () => {
    await mongoUnit.load(require("./fixtures/mongodb/data-default.js"));
  });

  afterEach(async () => {
    await mongoUnit.drop();
  });

  it("finds one user by name", async () => {
    const user = await User.findUserByName("kcarr");
    expect(user.id).to.eql(mongoose.Types.ObjectId("5dd88892c012321c14267155"));
    expect(user.name).to.eql("kcarr");
    expect(user.email).to.eql("kcarr@ict.usc.edu");
  });
});
