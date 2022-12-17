const { join } = require("path");
const cors = require("cors");
const express = require("express");
const formidable = require("formidable");
const { rm, mkdir, copyFile, rmdir, opendir } = require("fs/promises");
const { access, constants } = require("fs");

const port = 6060;

const storageDir = join(__dirname, ".storage");

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
        res.status(500).json({ success: false });
        return;
      }

      try {
        const newDir = join(storageDir, req.params.collection, file.hash);
        const newFilepath = join(newDir, file.originalFilename);
        const url = `/${req.params.collection}/${file.hash}/${file.originalFilename}`;

        await mkdir(newDir, { recursive: true });
        await copyFile(file.filepath, newFilepath, constants.COPYFILE_EXCL);

        res.json({
          success: true,
          path: url,
          url,
        });
      } catch (err) {
        console.error(err);

        const message = { success: false, code: "", reason: "" };

        if (err.code === "EEXIST") {
          message.code = "EEXIST";
          message.reason = "File already exists.";
        }

        res.status(500).json(message);
      }
    }
  );
});

app.delete("/:collection/:hash/:filename", async function (req, res) {
  try {
    await deleteToCollection(
      req.params.collection,
      req.params.hash,
      req.params.filename
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

app.listen(port, () => {
  console.log(`Listen on: ${port}`);
});

// Utils
async function deleteToCollection(collection, hash, filename) {
  let path = join(storageDir, collection, hash, filename);
  if (!(await isExist(path))) return;
  await rm(path);

  path = join(path, "..");
  if (!(await isEmpty(path))) return;
  await rmdir(path);

  path = join(path, "..");
  if (!(await isEmpty(path))) return;
  await rmdir(path);
}

async function isEmpty(path) {
  try {
    const directory = await opendir(path);
    const entry = await directory.read();
    await directory.close();

    return entry === null;
  } catch (error) {
    return false;
  }
}

function isExist(path) {
  return new Promise((resolve) => {
    access(path, (err) => {
      resolve(err === null);
    });
  });
}
