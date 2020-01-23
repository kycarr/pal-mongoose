const { expect } = require("chai");
const mongoUnit = require("mongo-unit");
const mongoose = require("mongoose");
const Goal = require("Goal");

describe("Goal", function() {
  beforeEach(async () => {
    await mongoUnit.load(require("./fixtures/mongodb/data-default.js"));
  });

  afterEach(async () => {
    await mongoUnit.drop();
  });

  describe("findOneByIdOrAlias", function() {
    it("finds one by alias", async () => {
      const item = await Goal.findOneByIdOrAlias("advancement-test-fc-e3");
      expect(item).to.have.property("name", "Advancement Test - FC E3");
    });

    it("finds one by id string", async () => {
      const item = await Goal.findOneByIdOrAlias("5b5a2cd69b1fafcf999d957e");
      expect(item).to.have.property("name", "Advancement Test - FC E3");
    });

    it("finds one by id object", async () => {
      const item = await Goal.findOneByIdOrAlias(
        mongoose.Types.ObjectId("5b5a2cd69b1fafcf999d957e")
      );
      expect(item).to.have.property("name", "Advancement Test - FC E3");
    });
  });
});
