const { expect } = require("chai");
const mongoUnit = require("mongo-unit");
const mongoose = require("mongoose");
const User = require("User");

describe("User", function() {
  beforeEach(async () => {
    await mongoUnit.load(require("./fixtures/mongodb/data-default.js"));
  });

  afterEach(async () => {
    await mongoUnit.drop();
  });

  describe("findActiveById", function() {
    it("finds one user by id string", async () => {
      const user = await User.findActiveById("5dd88892c012321c14267155");
      expect(user.id).to.eql(
        mongoose.Types.ObjectId("5dd88892c012321c14267155")
      );
      expect(user.name).to.eql("kcarr");
      expect(user.email).to.eql("kcarr@ict.usc.edu");
    });

    it("finds one user by ObjectId", async () => {
      const user = await User.findActiveById(
        mongoose.Types.ObjectId("5dd88892c012321c14267155")
      );
      expect(user.id).to.eql(
        mongoose.Types.ObjectId("5dd88892c012321c14267155")
      );
      expect(user.name).to.eql("kcarr");
      expect(user.email).to.eql("kcarr@ict.usc.edu");
    });

    it("does not return a user for an existing user that is marked deleted", async () => {
      const user = await User.findById(
        mongoose.Types.ObjectId("5bf4a366becb4e208de99099")
      ).exec();
      expect(user.name).to.eql("DeletedUser");
      expect(await User.findActiveById("5bf4a366becb4e208de99099")).to.not
        .exist;
    });
  });

  describe("findActive", function() {
    it("finds all users EXCEPT deleted users", async () => {
      const users = await User.findActive({});
      expect(users.find(u => u.name === "kcarr").name).to.eql("kcarr");
      expect(users.find(u => u.name === "larry").name).to.eql("larry");
      expect(users.find(u => u.name === "Expert").name).to.eql("Expert");
      expect(users.find(u => u.name === "DeletedUser")).to.not.exist;
    });

    it("applies a query like the default mongoose find function", async () => {
      const users = await User.findActive({ name: "larry" });
      expect(users[0].name).to.eql("larry");
      expect(users.length).to.eql(1);
    });
  });

  describe("isUserNameAvailable", function() {
    it("determines a user name belonging to an active user is unavailable", async () => {
      const available = await User.isUserNameAvailable("kcarr");
      expect(available).to.eql(false);
    });

    it("determines an untaken user name is available", async () => {
      const available = await User.isUserNameAvailable("untakenname");
      expect(available).to.eql(true);
    });

    it("determines a user name taken by a deleted user is unavailable", async () => {
      const available = await User.isUserNameAvailable("DeletedUser");
      expect(available).to.eql(false);
    });
  });

  describe("isEmailAvailable", function() {
    it("determines an email assigned to an active user is unavailable", async () => {
      const available = await User.isEmailAvailable("kcarr@ict.usc.edu");
      expect(available).to.eql(false);
    });

    it("determines an email not assigned to any user is available", async () => {
      const available = await User.isEmailAvailable("kcarr100@ict.usc.edu");
      expect(available).to.eql(true);
    });

    it("determines an email assigned to a deleted user is unavailable", async () => {
      const available = await User.isEmailAvailable(
        "deleteduser@pal.ict.usc.edu"
      );
      expect(available).to.eql(false);
    });
  });
});
