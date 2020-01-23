const { expect } = require("chai");
const mongoUnit = require("mongo-unit");
const mongoose = require("mongoose");
const User = require("User");
const UserAccessToken = require("UserAccessToken");

describe("UserAccessToken", function() {
  beforeEach(async () => {
    await mongoUnit.load(require("./fixtures/mongodb/data-default.js"));
  });

  afterEach(async () => {
    await mongoUnit.drop();
  });

  describe("loginWithCredentials", function() {
    it("succeeds when username and password are valid", async () => {
      const token = await UserAccessToken.loginWithCredentials("kcarr", "asdf");
      expect(token).to.exist;
      const user = await User.findOne({ name: "kcarr" });
      expect(token.user.id).to.eql(user._id);
    });

    it("succeeds when email and password are valid", async () => {
      const token = await UserAccessToken.loginWithCredentials(
        "kcarr@ict.usc.edu",
        "asdf"
      );
      expect(token).to.exist;
      const user = await User.findOne({ name: "kcarr" });
      expect(token.user.id).to.eql(user._id);
    });

    it("updates last login on success", async () => {
      const beforeLogin = new Date();
      const token = await UserAccessToken.loginWithCredentials("kcarr", "asdf");
      expect(token).to.exist;
      const user = await User.findOne({ name: "kcarr" });
      expect(user.lastLoginAt).to.be.greaterThan(beforeLogin);
    });

    it("throws an error if username not found", async () => {
      let expectedErr = null;
      try {
        await UserAccessToken.loginWithCredentials("noneexistantuser", "asdf");
      } catch (err) {
        expectedErr = err;
      }
      expect(expectedErr).to.exist;
    });

    it("throws an error if password is invalid", async () => {
      let expectedErr = null;
      try {
        await UserAccessToken.loginWithCredentials("kcarr", "wrongpassword");
      } catch (err) {
        expectedErr = err;
      }
      expect(expectedErr).to.exist;
    });
  });

  describe("signUpWithCredentials", function() {
    it("succeeds when username, password, and email are valid", async () => {
      const token = await UserAccessToken.signUpWithCredentials(
        "newuser1",
        "asdf",
        "someemail@domain.com"
      );
      expect(token).to.exist;
      const user = await User.findOne({ name: "newuser1" });
      expect(token.user.id).to.eql(user._id);
    });

    it("updates lastLoginAt on success", async () => {
      const before = new Date();
      const token = await UserAccessToken.signUpWithCredentials(
        "newuser1",
        "asdf",
        "someemail@domain.com"
      );
      expect(token).to.exist;
      const user = await User.findOne({ name: "newuser1" });
      expect(user.lastLoginAt).to.be.greaterThan(before);
    });

    it("updates createdAt login on success", async () => {
      const before = new Date();
      const token = await UserAccessToken.signUpWithCredentials(
        "newuser1",
        "asdf",
        "someemail@domain.com"
      );
      expect(token).to.exist;
      const user = await User.findOne({ name: "newuser1" });
      expect(user.createdAt).to.be.greaterThan(before);
    });

    it("throws an error if username not passed", async () => {
      let expectedErr = null;
      try {
        await UserAccessToken.signUpWithCredentials();
      } catch (err) {
        expectedErr = err;
      }
      expect(expectedErr).to.exist;
    });

    it("throws an error if password not passed", async () => {
      let expectedErr = null;
      try {
        await UserAccessToken.signUpWithCredentials("someusername");
      } catch (err) {
        expectedErr = err;
      }
      expect(expectedErr).to.exist;
    });

    it("throws an error if email not passed", async () => {
      let expectedErr = null;
      try {
        await UserAccessToken.signUpWithCredentials(
          "someusername",
          "somepassword"
        );
      } catch (err) {
        expectedErr = err;
      }
      expect(expectedErr).to.exist;
    });

    it("throws an error if username is taken", async () => {
      let expectedErr = null;
      try {
        await UserAccessToken.signUpWithCredentials(
          "kcarr",
          "asdf",
          "someemail@domain.com"
        );
      } catch (err) {
        expectedErr = err;
      }
      expect(expectedErr).to.exist;
    });

    it("throws an error if email is taken", async () => {
      let expectedErr = null;
      try {
        await UserAccessToken.signUpWithCredentials(
          "somenewusername",
          "asdf",
          "kcarr@ict.usc.edu"
        );
      } catch (err) {
        expectedErr = err;
      }
      expect(expectedErr).to.exist;
    });
  });

  describe("authenticate", function() {
    it("succeeds with valid auth token", async () => {
      const token = await UserAccessToken.authenticate(
        "82189440-16fc-11ea-996e-321c14267155"
      );
      expect(token).to.exist;
      const user = await User.findOne({ name: "kcarr" });
      expect(token.user.id).to.eql(user._id);
    });

    it("succeeds with auth token returned by login", async () => {
      const loginToken = await UserAccessToken.loginWithCredentials(
        "kcarr",
        "asdf"
      );
      const token = await UserAccessToken.authenticate(loginToken.accessToken);
      expect(token).to.exist;
      const user = await User.findOne({ name: "kcarr" });
      expect(token.user.id).to.eql(user._id);
    });

    it("succeeds with auth token returned by signup", async () => {
      const signupToken = await UserAccessToken.signUpWithCredentials(
        "newuser1",
        "asdf",
        "someemail@domain.com"
      );
      const token = await UserAccessToken.authenticate(signupToken.accessToken);
      expect(token).to.exist;
      const user = await User.findOne({ name: "newuser1" });
      expect(token.user.id).to.eql(user._id);
    });

    it("throws an error if token is invalid", async () => {
      let expectedErr = null;
      try {
        await UserAccessToken.authenticate("someinvalidtoken");
      } catch (err) {
        expectedErr = err;
      }
      expect(expectedErr).to.exist;
    });
  });
});
