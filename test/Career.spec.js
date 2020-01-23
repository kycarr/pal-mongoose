const { expect } = require("chai");
const mongoUnit = require("mongo-unit");
const mongoose = require("mongoose");
const Career = require("Career");

describe("Career", function() {
  beforeEach(async () => {
    await mongoUnit.load(require("./fixtures/mongodb/data-default.js"));
  });

  afterEach(async () => {
    await mongoUnit.drop();
  });

  describe("findOneByIdOrAlias", function() {
    it("finds one by alias", async () => {
      const item = await Career.findOneByIdOrAlias(
        "e6-petty-officer-first-class"
      );
      expect(item).to.have.property("name", "E6 Petty Officer First Class");
    });

    it("finds one by id string", async () => {
      const item = await Career.findOneByIdOrAlias("5d799472becb4e208db91c7b");
      expect(item).to.have.property("name", "E6 Petty Officer First Class");
    });

    it("finds one by id object", async () => {
      const item = await Career.findOneByIdOrAlias(
        mongoose.Types.ObjectId("5d799472becb4e208db91c7b")
      );
      expect(item).to.have.property("name", "E6 Petty Officer First Class");
    });
  });

  describe("findSuggested", function() {
    it("finds a career marked as default suggested", async () => {
      const item = await Career.findSuggested();
      expect(item).to.have.property("name", "E2 Fire Controlman");
    });
  });
});
