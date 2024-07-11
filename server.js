require('dotenv').config();

const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const { GridFsStorage } = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');

const mongoURI = process.env.MONGODB_URI;
const PORT = process.env.PORT || 5000;

console.log(`Mongo URI: ${mongoURI}`);
console.log(`Server running on port: ${PORT}`);

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
const conn = mongoose.connection;
conn.once('open', () => {
    console.log('MongoDB connection established successfully');
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('uploads');
});

let gfs;

const storage = new GridFsStorage({
    url: mongoURI,
    options: { useNewUrlParser: true, useUnifiedTopology: true },
    file: (req, file) => {
        return {
            filename: file.originalname,
            bucketName: 'uploads'
        };
    }
});

const upload = multer({ storage });

app.post('/upload', upload.single('image'), (req, res) => {
    res.json({ file: req.file });
});

app.get('/images', (req, res) => {
    gfs.files.find().toArray((err, files) => {
        if (!files || files.length === 0) {
            return res.status(404).json({
                err: 'No files exist'
            });
        }
        return res.json(files);
    });
});

app.get('/image/:filename', (req, res) => {
    gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
        if (!file || file.length === 0) {
            return res.status(404).json({
                err: 'No file exists'
            });
        }

        const readstream = gfs.createReadStream(file.filename);
        readstream.pipe(res);
    });
});

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
