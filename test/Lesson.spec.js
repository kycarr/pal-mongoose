const { expect } = require("chai");
const mongoUnit = require("mongo-unit");
const mongoose = require("mongoose");
const Lesson = require("Lesson");

describe("Lesson", function() {
  beforeEach(async () => {
    await mongoUnit.load(require("./fixtures/mongodb/data-default.js"));
  });

  afterEach(async () => {
    await mongoUnit.drop();
  });

  it("finds lessons by topic", async () => {
    const topicLessons = await Lesson.find({
      topic: mongoose.Types.ObjectId("5ba2ef369b1fafcf999a95dc")
    });
    expect(topicLessons[0]).to.have.property("name", "Review Diode Current Flow")
    expect(topicLessons[0]).to.have.property("alias", "diode-action-review-diode-current-flow")
  });

  it("finds one lesson by id", async () => {
    const topicLessons = await Lesson.find({
      _id: mongoose.Types.ObjectId("5b5a2cd69b1fafcf999d932e")
    });
    expect(topicLessons[0]).to.have.property("name", "Review Diode Current Flow")
    expect(topicLessons[0]).to.have.property("alias", "diode-action-review-diode-current-flow")
  });
});
