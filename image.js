
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const moment = require('moment');
const exifReader = require('exif-reader');

const directoryPath = path.join(__dirname, 'images');
const resultPath = path.join(__dirname, 'res');

// res contains subfolders containing images
//  res
//  |  - folderA/
//  |       | img1.png
//  |       | img2.png
//  |   - folderB/
//
const deleteRes = async () => {
  fs.rmdirSync(resultPath, { recursive: true });
  fs.mkdirSync(resultPath)
}

const resizeImages = async () => {
  const folders = fs.readdirSync(directoryPath);

  const allPromises = [];

  // create input file structure in output
  folders.forEach(folder => {
    fs.mkdirSync(path.join(resultPath, folder));
  });

  folders.forEach(folder => {
    const files = fs.readdirSync(path.join(directoryPath, folder));

    const promises = files.map(async file => {
      const filePath = path.join(directoryPath, folder, file);
      const image = sharp(filePath);

      const metadata = await image.metadata();
      const { exif, width, height, orientation } = metadata;

      let date = new moment();

      // film photos don't have exif data
      if (exif) {
        const originalDate = exifReader(exif).exif.DateTimeOriginal;

        date = new moment(originalDate, 'YYYY:MM:DD hh:mm:ss');
      } else {
        const fileCreatedAt = fs.statSync(filePath).birthtime;

        date = new moment(fileCreatedAt)
      }

      // 2020:02:22 18:44:47
      const filename = date.toDate().toISOString();

      const promise = image
        .resize({ width: 2000 })
        .toFormat('jpeg', { progressive: true, quality: 90 })
        .withMetadata({ orientation })
        .toFile(path.join(resultPath, folder, `${filename}.jpg`));

      return promise;
    });

    allPromises.push(promises);
  });

  return Promise.all(allPromises)
};

const main = async () => {
  try {
    deleteRes();
    console.log('Res cleared.');

    await resizeImages();
    console.log('Images resized.')

  } catch (e) {
    console.log(e);
  }
};

main();