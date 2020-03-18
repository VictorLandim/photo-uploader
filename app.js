const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
var moment = require('moment');
var exifReader = require('exif-reader');

const directoryPath = path.join(__dirname, 'images');
const resultPath = path.join(__dirname, 'res');

fs.readdir(resultPath, (err, files) => {
  if (err) throw err;

  files.forEach(file => {
    fs.unlink(path.join(resultPath, file), err => {
      if (err) throw err;
    });
  });
});

console.log('Res cleared.');

fs.readdir(directoryPath, async (err, files) => {
  if (err) throw err;

  files.forEach(async (file, i) => {
    const filePath = `${directoryPath}/${file}`;
    const readStream = fs.createReadStream(filePath);

    try {
      const image = sharp(filePath);

      const metadata = await image.metadata();
      const { exif, width, height } = metadata;

      let originalDate;

      // gThumb stripped exif
      if (file.includes('DSCF5390')) originalDate = '2020:02:22 06:58:16';
      else if (file.includes('DSCF5530')) originalDate = '2020:02:23 12:58:32';
      else originalDate = exifReader(exif).exif.DateTimeOriginal;

      const date = new moment(originalDate, 'YYYY:MM:DD hh:mm:ss');
      // 2020:02:22 18:44:47
      const filename = date.toDate().toISOString();

      const res = await image
        .resize({ width: 2000 })
        .toFormat('jpeg', { progressive: true, quality: 90 })
        .withMetadata()
        .toFile(`${resultPath}/${filename}.jpg`);
    } catch (error) {
      console.log(filePath);
      console.log(error);
    }
  });
});
