/* eslint-disable consistent-return */
/* eslint-disable no-plusplus */
/* eslint-disable prefer-destructuring */
const fs = require("fs");
const cors = require("cors");
const express = require("express");
const NodeCache = require("node-cache");
const bodyParser = require("body-parser");
const rateLimit = require("express-rate-limit");
const { default: axios } = require("axios");
const morgan = require("morgan");
const compression = require("compression");
const serveStatic = require("serve-static");
const path = require("path");

require("dotenv").config();

const port = process.env.PORT || 3000;
const API_KEY = process.env.YOUTUBE_API_KEY;

const app = express();
const cache = new NodeCache({ stdTTL: 60 * 10 });
const limiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: true,
});

const verifyCache = (req, res, next) => {
  try {
    const { videoID } = req.params;

    if (cache.has(videoID)) {
      return res.status(200).json(cache.get(videoID));
    }
    return next();
  } catch (err) {
    res.status(500).send({ error: "Internal Server Error!", code: 500 });
  }
};

const video = async (req, res) => {
  const { videoID } = req.params;

  if (req.query.print == "pretty") {
    app.set("json spaces", 2);
  }

  if (/([a-zA-z0-9_-]){11}$/gi.test(videoID) && videoID.length == 11) {
    try {
      const apiData = await axios(
        `https://www.googleapis.com/youtube/v3/videos?key=${API_KEY}&id=${videoID}&part=snippet,statistics,recordingDetails,status,liveStreamingDetails,localizations,contentDetails,topicDetails`
      );
      let videoData = apiData.data.items;
      if (!videoData.length >= 1) {
        res.status(404).send({ error: "Video Not Found!", code: 404 });
      } else {
        videoData = videoData[0];
        videoData.snippet.thumbnails = [];

        for (let i = 0; i <= 3; i++) {
          videoData.snippet.thumbnails[i] = {
            url: `https://i.ytimg.com/vi/${videoData.id}/${i}.jpg`,
          };
        }

        videoData.contentDetails.duration = videoData.contentDetails.duration
          .replace(/(PT)|(S)/gi, "")
          .replace(/([DHM])/gi, ":");

        delete videoData.etag;
        delete videoData.snippet.localized;

        res.json(videoData);
        cache.set(videoID, videoData);
      }
    } catch (error) {
      res.status(500).send({ error: "Internal Server Error!", code: 500 });
      console.log(error);
    }
  } else {
    res.status(400).send({ error: "Invalid VideoID !", code: 400 });
  }
};

const notFound = async (req, res) => {
  try {
    const pageNotFoundHtml = await fs.readFileSync(
      path.join(__dirname, "public/404.html"),
      "utf8"
    );
    res.status(404).send(pageNotFoundHtml);
  } catch (err) {
    res.status(404).send("Page Not Found!");
    console.log(err);
  }
};

app.use(cors());
app.use(compression());
// app.set("json spaces", 2);
app.use(bodyParser.json());
app.use("/api/*", limiter);
app.use("/api/*", morgan("tiny"));
app.get("/api/video/:videoID", verifyCache, video);
app.use(
  serveStatic(path.join(__dirname, "public"), {
    index: ["index.html"],
    dotfiles: "deny",
  })
);
app.get("*", notFound);

app.listen(port, () => console.log(`app listening on port ${port}!`));
