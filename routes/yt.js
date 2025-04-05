const express = require("express");
const router = express.Router();
const ytdl = require("ytdl-core");

// GET /api/yt/info?url=...
router.get("/info", async (req, res) => {
    const url = req.query.url;

    if (!ytdl.validateURL(url)) {
        return res.status(400).json({ error: "Invalid YouTube URL" });
    }

    try {
        const info = await ytdl.getInfo(url);
        const formats = info.formats.map(f => ({
            itag: f.itag,
            quality: f.qualityLabel,
            format: f.container,
            audioOnly: f.hasAudio && !f.hasVideo,
            videoOnly: f.hasVideo && !f.hasAudio,
        }));
        res.json({ title: info.videoDetails.title, formats });
    } catch (err) {
        res.status(500).json({ error: `Error fetching video info : ${err}` });
        console.error(err);
    }
});

/*
// GET /api/yt/download?url=...&itag=...
router.get("/download", async (req, res) => {
    const { url, itag } = req.query;

    if (!ytdl.validateURL(url)) {
        return res.status(400).send("Invalid YouTube URL");
    }

    try {
        const info = await ytdl.getInfo(url);
        const format = info.formats.find(f => f.itag.toString() === itag);

        if (!format) return res.status(400).send("Invalid format");

        const filename = `${info.videoDetails.title.replace(/[^\w\s]/gi, "")}.${format.container}`;
        res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

        ytdl(url, { format }).pipe(res);
    } catch (err) {
        res.status(500).send("Error processing download");
    }
});
*/

/*
function x() {
const fs = require('fs');
const ytdl = require('ytdl-core');
// TypeScript: import ytdl from 'ytdl-core'; with --esModuleInterop
// TypeScript: import * as ytdl from 'ytdl-core'; with --allowSyntheticDefaultImports
// TypeScript: import ytdl = require('ytdl-core'); with neither of the above

ytdl('http://www.youtube.com/watch?v=aqz-KE-bpKQ')
  .pipe(fs.createWriteStream('video.mp4'));
};
*/

module.exports = router;