var extractif = require('extractif');
var moment = require('moment');

extractif('images/DSCF5352.JPG', function(err, tags) {
  const originalDate = tags['Date and Time (Original)'];
  const date = new moment(originalDate, 'YYYY:MM:DD hh:mm:ss');
  // 2020:02:22 18:44:47
  console.log(date.toDate());
});
