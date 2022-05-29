const { expect } = require("chai");
const request = require("request");

const testFunction = async (videoID, videoTitle, channelTitle) => {
  const url = `http://localhost:3000/api/video/${videoID}`;

  it("Should returns status: 200", () => {
    request(url, (error, response, body) => {
      expect(response.statusCode).to.equal(200);
    });
  });
  it(`Should returns ID: ${videoID}`, () => {
    request(url, (error, response, body) => {
      expect(body.id).to.equal(videoID);
    });
  });
  it(`Should returns Title: ${videoTitle}`, () => {
    request(url, (error, response, body) => {
      expect(body.snippet.title).to.equal(videoTitle);
    });
  });

  it(`Should returns Channel Title: ${channelTitle}`, () => {
    request(url, (error, response, body) => {
      expect(body.snippet.channelTitle).to.equal(channelTitle);
    });
  });
};

describe("Youtube Lookup", () => {
  describe(
    "Test jNQXAC9IVRw",
    testFunction("jNQXAC9IVRw", "Me at the zoo", "jawed"),
  );
  describe(
    "Test LeAltgu_pbM",
    testFunction("LeAltgu_pbM", "My Snowboarding Skillz", "mw"),
  );
  describe("Test aBfUFr9SBY0", testFunction("aBfUFr9SBY0", "tribute", "gp"));
});
