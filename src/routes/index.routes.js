const {Router} = require('express');
const router = Router();

const {renderIndex, renderAbout} = require('../controllers/index.controllers');

router.get('/', renderIndex);
router.get('/about', renderAbout);
module.exports = router;
//antes de hacer el npm run dev hacer sudo systemctl start mongodb