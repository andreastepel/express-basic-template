const express = require('express');
const router = express.Router();
const sampleController = require('../controllers').sampleController;

router.get('/', sampleController.sample)

module.exports = router;