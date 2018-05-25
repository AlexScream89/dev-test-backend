const express = require('express');
const multer = require('multer');
const router = express.Router();

const TripsController = require('../controllers/trips');
const checkAuth = require('../middleware/check-auth');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './public/images');
    },
    filename: function (req, file, cb) {
        cb(null, new Date().toISOString() + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
});

router.get('', checkAuth, TripsController.get_trips);
router.post('', checkAuth, TripsController.trips_create);
router.get('/:id', checkAuth, TripsController.get_trip_by_id);
router.post('/image-upload', checkAuth, upload.single('file'), TripsController.upload_image);

module.exports = router;