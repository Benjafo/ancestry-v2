var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* API endpoint for testing client-server communication */
router.get('/api/test', function(req, res) {
  res.json({
    message: 'Hello from the server!',
    timestamp: new Date().toISOString(),
    status: 'success'
  });
});

module.exports = router;
