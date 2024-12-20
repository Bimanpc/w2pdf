const express = require('express');
const multer = require('multer');
const libre = require('libreoffice-convert');
const path = require('path');
const fs = require('fs');

const app = express();
const upload = multer({ dest: 'uploads/' });

libre.convertAsync = function (filePath, ext, callback) {
    return new Promise((resolve, reject) => {
        libre.convert(filePath, ext, undefined, (err, done) => {
            if (err) {
                reject(err);
            } else {
                resolve(done);
            }
        });
    });
};

app.post('/convert', upload.single('file'), async (req, res) => {
    const filePath = req.file.path;
    const ext = '.pdf';
    const outputPath = path.join(__dirname, 'uploads', path.basename(filePath, path.extname(filePath)) + ext);

    try {
        await libre.convertAsync(filePath, ext);
        res.download(outputPath, (err) => {
            if (err) {
                console.error(err);
            }
            fs.unlinkSync(filePath);
            fs.unlinkSync(outputPath);
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Conversion failed.');
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
