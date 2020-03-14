const { expect } = require("chai");
const mongoUnit = require("mongo-unit");
const mongoose = require("mongoose");
const Lesson = require("Lesson");
const Topic = require("Topic");

describe("Topic", function() {
  beforeEach(async () => {
    await mongoUnit.load(require("./fixtures/mongodb/data-default.js"));
  });

  afterEach(async () => {
    await mongoUnit.drop();
  });

  describe("findOneByIdOrAlias", function() {
    it("finds one by alias", async () => {
      const item = await Topic.findOneByIdOrAlias("diode-action");
      expect(item).to.have.property("name", "Diode Action");
    });

    it("finds one by id string", async () => {
      const item = await Topic.findOneByIdOrAlias("5bb6540bbecb4e208da0f6e7");
      expect(item).to.have.property("alias", "diode-action");
    });

    it("finds one by id object", async () => {
      const item = await Topic.findOneByIdOrAlias(
        mongoose.Types.ObjectId("5bb6540bbecb4e208da0f6e7")
      );
      expect(item).to.have.property("alias", "diode-action");
    });
  });

  describe("findLessons", function() {
    it("finds lessons belonging to a topic instance", async () => {
      const topic = await Topic.findOneByIdOrAlias("diode-action");
      const lessons = await topic.findLessons();
      expect(lessons.length).to.eql(4);
    });

    it("orders returned lessons by the ord field", async () => {
      const topic = await Topic.findOneByIdOrAlias("diode-action");
      const lessons = await topic.findLessons();
      expect(lessons[0]).to.have.property(
        "alias",
        "diode-action-prerequisites"
      );
      expect(lessons[0]).to.have.property("ord", 0);
      expect(lessons[1]).to.have.property(
        "alias",
        "diode-action-diodes-tutorial"
      );
      expect(lessons[1]).to.have.property("ord", 1);
      expect(lessons[2]).to.have.property(
        "alias",
        "diode-action-review-diode-current-flow"
      );
      expect(lessons[2]).to.have.property("ord", 2);
      expect(lessons[3]).to.have.property(
        "alias",
        "diode-action-review-normal-diode-breakdown-mode"
      );
      expect(lessons[3]).to.have.property("ord", 3);
    });

    it("excludes lessons marked deleted from the result", async () => {
      const topic = await Topic.findOneByIdOrAlias("diode-action");
      const deletedLesson = await Lesson.findOne({
        _id: mongoose.Types.ObjectId("5bb6540cbecb4e208da0f9b5")
      });
      expect(deletedLesson.topic).to.eql(topic._id);
      expect(deletedLesson).to.have.property("deleted", true);
      const lessons = await topic.findLessons();
      expect(lessons.find(i => i._id === deletedLesson._id)).to.not.exist;
    });
  });
});
