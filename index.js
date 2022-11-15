const path = require("path");
const cors = require("cors");
const express = require("express");
const formidable = require("formidable");
const { rm, mkdir, copyFile, rmdir } = require("fs/promises");

const port = 6060;

const storageDir = path.join(__dirname, ".storage");

const app = express();

app.use(
  cors({
    exposedHeaders: ["Access-Control-Allow-Origin"],
  })
);
app.use(express.static(storageDir));

app.post("/:collection", function (req, res) {
  formidable({ allowEmptyFiles: false, hashAlgorithm: "MD5" }).parse(
    req,
    async function (err, _, files) {
      const file = files.file;

      if (err || !file || !file.size || !file.hash) {
        res.json({ success: false });
        return;
      }

      try {
        const newDir = path.join(storageDir, req.params.collection, file.hash);
        const newFilepath = path.join(newDir, file.originalFilename);
        const url = `/${req.params.collection}/${file.hash}/${file.originalFilename}`;

        await mkdir(newDir, { recursive: true });
        await copyFile(file.filepath, newFilepath);

        res.json({
          success: true,
          url,
        });
      } catch (e) {
        res.json({ success: false });
      }
    }
  );
});

app.delete("/:collection/:hash/:filename", async function (req, res) {
  try {
    await rm(path.join(storageDir, req.path));
    await rmdir(path.join(storageDir, req.params.collection, req.params.hash));
    await rmdir(path.join(storageDir, req.params.collection));
    res.json({ success: true });
  } catch (e) {
    res.json({ success: false });
  }
});

app.listen(port, () => {
  console.log(`Listen on: ${port}`);
});
