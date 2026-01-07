const express = require("express");
const router = express.Router();
const ytdl = require("@distube/ytdl-core");

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

module.exports = router;