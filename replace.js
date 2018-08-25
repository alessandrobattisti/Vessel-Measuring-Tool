#! /usr/bin/env node
const replace = require('replace-in-file');
const options = {
  files: 'build/*.html',
  from: /\/Vessel-Measuring-Tool\//g,
  to: './',
};
replace(options)
  .then(changes => {
    console.log('Modified files:', changes.join(', '));
  })
  .catch(error => {
    console.error('Error occurred:', error);
  });
