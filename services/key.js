const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

function generateKeyPair(username) {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: {
            type: 'pkcs1',
            format: 'pem',
        },
        privateKeyEncoding: {
            type: 'pkcs1',
            format: 'pem',
        },
    });

    console.log(typeof publicKey);


    const publicFolderPath = path.join(__dirname, 'public');
    const privateKeyPath = path.join(publicFolderPath, `${username}_private_key.pem`);
    const publicKeyPath = path.join(publicFolderPath, `${username}_public_key.pem`);

    // Ensure the 'public' folder exists
    if (!fs.existsSync(publicFolderPath)) {
        fs.mkdirSync(publicFolderPath, { recursive: true });
    }

    // Save the keys
    fs.writeFileSync(privateKeyPath, privateKey);
    fs.writeFileSync(publicKeyPath, publicKey);

    console.log(`Key pair generated for ${username}`);
    return publicKey; 
}

module.exports = { generateKeyPair };
