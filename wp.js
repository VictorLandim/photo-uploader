require('dotenv').config();

const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const token = process.env.WORDPRESS_TOKEN;

const BASE_URL = process.env.BASE_URL;

const GET_URL = `${BASE_URL}?number=100`;
const DELETE_URL = (id) => `${BASE_URL}/${id}/delete`
const UPLOAD_URL = `${BASE_URL}/new`;

const resultPath = path.join(__dirname, 'res');

const deleteImages = async () => {
  const allImages = await fetch(GET_URL, {
    method: 'GET',
    headers: {
      'authorization': `Bearer ${token}`
    }
  });
  const allImagesData = await allImages.json();

  const ids = allImagesData.media.map(item => item.ID);

  const promises = ids.map(id => {
    const promise = fetch(DELETE_URL(id), {
      method: 'POST',
      headers: {
        'authorization': `Bearer ${token}`
      }
    });

    return promise;
  });

  return Promise.all(promises);
};

const uploadImages = async () => {
  const allPromises = [];

  const folders = fs.readdirSync(resultPath);

  folders.forEach(folder => {
    const files = fs.readdirSync(path.join(resultPath, folder));

    const buffers = files.map(file => {
      const filePath = path.join(resultPath, folder, file);

      const image = fs.createReadStream(filePath);

      return image;
    });

    const promises = buffers.map(image => {
      const form = new FormData();
      form.append('media[0]', image);

      // album name
      form.append('attrs[0][alt]', folder);

      const promise = fetch(UPLOAD_URL, {
        method: 'POST',
        headers: {
          'authorization': `Bearer ${token}`,
        },
        body: form
      });

      return promise;
    });

    allPromises.push(promises);
  })

  return Promise.all(allPromises)
}

const main = async () => {
  try {
    console.log('Deleting images.')
    await deleteImages()
    console.log('All images deleted.')

    console.log('Uploading images.')
    await uploadImages()
    console.log('All images uploaded.')

  } catch (e) {
    console.log(e)
  }
}

main()
