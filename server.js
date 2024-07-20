const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const basicAuth = require('express-basic-auth');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('public'));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    if (path.extname(file.originalname) === '.js') {
        cb(null, true);
    } else {
        cb(new Error('Only .js files are allowed!'), false);
    }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

app.use('/admin', basicAuth({
    users: { 'admin': 'password' },
    challenge: true,
    realm: 'Admin Area'
}));

app.post('/upload', upload.fields([{ name: 'file' }, { name: 'icon' }]), (req, res) => {
    const { title, description, author, authorLink, repoLink } = req.body;
    const file = req.files['file'] ? req.files['file'][0] : null;
    const iconFile = req.files['icon'] ? req.files['icon'][0] : null;

    if (!file) {
        return res.status(400).send('No file uploaded.');
    }

    fs.readFile('mods.json', 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading mods.json');
        }

        let modsData = JSON.parse(data);
        let newMod = {
            'display-name': title || file.originalname,
            'mod-name': path.parse(file.filename).name,
            'author': author || 'Unknown',
            'author-link': authorLink || '',
            'description': description || 'No description',
            'icon': iconFile ? `/uploads/icons/${iconFile.filename}` : '/uploads/icons/default.png',
            'repo-link': repoLink || '',
            'download-link': `/uploads/${file.filename}`
        };

        modsData.mods.push(newMod);

        fs.writeFile('mods.json', JSON.stringify(modsData, null, 2), (err) => {
            if (err) {
                return res.status(500).send('Error writing to mods.json');
            }

            res.send('File uploaded and mod added successfully.');
        });
    });
});

app.get('/list-files', (req, res) => {
    fs.readFile('mods.json', 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading mods.json');
        }

        let modsData = JSON.parse(data);
        res.json(modsData.mods);
    });
});

app.delete('/admin/delete-mod/:modName', (req, res) => {
    const modName = req.params.modName;

    fs.readFile('mods.json', 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading mods.json');
        }

        let modsData = JSON.parse(data);
        const modIndex = modsData.mods.findIndex(mod => mod['mod-name'] === modName);

        if (modIndex === -1) {
            return res.status(404).send('Mod not found.');
        }

        modsData.mods.splice(modIndex, 1);

        fs.writeFile('mods.json', JSON.stringify(modsData, null, 2), (err) => {
            if (err) {
                return res.status(500).send('Error writing to mods.json');
            }

            const filePath = path.join(__dirname, 'uploads', `${modName}.js`);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }

            const iconPath = path.join(__dirname, 'uploads/icons', `${modName}-icon.png`);
            if (fs.existsSync(iconPath)) {
                fs.unlinkSync(iconPath);
            }

            res.send('Mod deleted successfully.');
        });
    });
});

app.put('/admin/update-mod/:modName', upload.fields([{ name: 'file' }, { name: 'icon' }]), (req, res) => {
    const modName = req.params.modName;
    const { title, description, author, authorLink, repoLink } = req.body;
    const file = req.files['file'] ? req.files['file'][0] : null;
    const iconFile = req.files['icon'] ? req.files['icon'][0] : null;

    fs.readFile('mods.json', 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading mods.json');
        }

        let modsData = JSON.parse(data);
        let mod = modsData.mods.find(mod => mod['mod-name'] === modName);

        if (!mod) {
            return res.status(404).send('Mod not found.');
        }

        if (title) mod['display-name'] = title;
        if (description) mod.description = description;
        if (author) mod.author = author;
        if (authorLink) mod['author-link'] = authorLink;
        if (repoLink) mod['repo-link'] = repoLink;
        if (file) mod['download-link'] = `/uploads/${file.filename}`;
        if (iconFile) mod.icon = `/uploads/icons/${iconFile.filename}`;

        fs.writeFile('mods.json', JSON.stringify(modsData, null, 2), (err) => {
            if (err) {
                return res.status(500).send('Error writing to mods.json');
            }
            res.send('Mod updated successfully.');
        });
    });
});

if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

if (!fs.existsSync('uploads/icons')) {
    fs.mkdirSync('uploads/icons');
}

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
