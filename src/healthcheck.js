"use strict";

import http from 'http';

const options = {  
  host: process.env.GATEWAY_HOST || '0.0.0.0',
  port: process.env.GATEWAY_PORT || 3333,
  path: '/health',
  timeout: 2000
};

const request = http.request(options, (res) => {  
  console.log(`STATUS: ${res.statusCode}`);
  process.exitCode = (res.statusCode === 200) ? 0 : 1;
  process.exit();
});

request.on('error', (err) => {  
  console.log(`HEALTH ERROR:${err}`);
  process.exit(1);
});

request.end();
