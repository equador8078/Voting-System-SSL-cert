const https = require('https');
const express = require('express');
const fs = require('fs');

const router= require('./routes/route')


require('dotenv').config()

const mongoose=require('mongoose')
const path=require('path')
const {checkIfCookieExists}=require('./middlewares/authentication')
const cookieParser=require('cookie-parser')

const app = express();

mongoose.connect("mongodb://localhost:27017/voters-System").then(()=>console.log('MongoDB connected!!'))

app.set('view engine','ejs')
app.set('views', path.resolve('./views'))

app.use(express.urlencoded({extended:false}))
app.use(cookieParser())
app.use(checkIfCookieExists("token"))
app.use(express.static(path.resolve('./public')))
// Serve static files (if needed)
app.use(express.static('public'));

// Route to provide the RSA public key
app.get('/public-key', (req, res) => {
    try {
        const publicKeyPath = path.join(__dirname, 'public-key.pem');
        const publicKey = fs.readFileSync(publicKeyPath, 'utf8');
        const base64Key = Buffer.from(publicKey).toString('base64');
        res.send(base64Key);
    } catch (error) {
        console.error("Error reading public key:", error);
        res.status(500).send("Error loading public key");
    }
});


// SSL certificate paths
const options = {
    key: fs.readFileSync('C:\\Users\\yashb\\OneDrive\\Desktop\\TSP\\private-key.pem'),
    cert: fs.readFileSync('C:\\Users\\yashb\\OneDrive\\Desktop\\TSP\\server-cert.pem'),
};

app.use('/', router)

https.createServer(options, app).listen(4430, () => {
    console.log('Secure server running at https://localhost:4430');
});