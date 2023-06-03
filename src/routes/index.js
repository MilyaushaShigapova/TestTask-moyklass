const express = require('express');
const { getList, createLessons } = require('../controller/index');

const router = express.Router();

router.get('', getList);
router.post('/lessons', createLessons);

module.exports = router;
