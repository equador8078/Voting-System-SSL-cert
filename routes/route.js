const USER = require('../models/user')
const { generateKeyPair } = require('../services/key')
const VOTE = require('../models/vote')
const crypto = require('crypto');
const express = require('express')
const fs =require('fs')

const router = express.Router();
const privateKey = fs.readFileSync('C:\\Users\\yashb\\OneDrive\\Desktop\\TSP\\private-key.pem', 'utf8');

function decryptVote(encryptedVote) {
    const bufferEncryptedVote = Buffer.from(encryptedVote, 'base64'); // Assuming encrypted vote is sent as base64

    const decrypted = crypto.privateDecrypt(
        {
            key: privateKey,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: 'sha256',
        },
        bufferEncryptedVote
    );

    return decrypted.toString('utf8');  // Return the decrypted data (the voted person)
}

// Render Signin page
router.get('/signin', (req, res) => {
    res.render('signin');
});

// Render Signup page
router.get('/signup', (req, res) => {
    res.render('signup');
});

// Render Admin login page with default state
router.get('/adminLogIn', (req, res) => {
    res.render('signin', { user: 'admin', adminLoggedIn: false });
});

// Render Admin panel page
router.get('/adminPanel', (req, res) => {
    res.render('admin', { user: 'admin' });
});

router.get('/votersPanel', (req, res) => {
    if (!req.user) {
        // If the user is not logged in, redirect to the signin page
        return res.redirect('/signin');
    }

    const loggedInUserId = req.user._id;
    console.log(loggedInUserId)
    res.render('voterPanel', { loggedInUserId });
});



router.post('/signup', async (req, res) => {
    const { fullName, email, password, role } = req.body;
    const publicKey = generateKeyPair(fullName);
    try {
        await USER.create({
            fullName,
            email,
            password,
            publicKey,
            role
        });
    } catch (errorResponse) {
        if (errorResponse.code === 11000) {
            res.render('signup', {
                Error: 'User already exists!'
            });
        } else {
            console.log(errorResponse);
            res.send({ Error: 'Some error occurred, please try again!' });
        }
    }

    res.redirect('/signin')
});

router.post('/signin', async (req, res) => {
    const { email, password } = req.body;

    // Check if the credentials match the hardcoded admin
    if (email === 'yashb@gmail.com' && password === 'Yash1234') {
        // Array to hold progress values (percentage of votes for each person)
        const progressValues = [];

        const people = ['Ayush', 'Yash', 'Nishant', 'Rajpal'];

        for (let person of people) {
            const voteCount = await VOTE.countDocuments({ votedPerson: person });
            let progress = 0;

            if (voteCount === 0) {
                progress = 0;
            } else if (voteCount === 1) {
                progress = 25;
            } else if (voteCount === 2) {
                progress = 50;
            } else if (voteCount === 3) {
                progress = 75;
            } else if (voteCount >= 4) {
                progress = 100;
            }

            progressValues.push(progress);
        }

        return res.render('admin', { user: 'admin', adminLoggedIn: true, progressValues });
    }

    try {
        const token = await USER.matchPasswordAndCreateToken(email, password);
        console.log(token);
        return res.cookie('token', token).redirect('/votersPanel');
    } catch (err) {
        console.log(err);
        res.render('signin', {
            Error: 'Incorrect Email or Password'
        });
    }
});

router.post('/vote', async (req, res) => {
    const { encryptedVote } = req.body;  // Get the encrypted vote from the request body

    try {
        const decryptedVote = decryptVote(encryptedVote); // Decrypt the vote
        console.log('Decrypted Vote:', decryptedVote);

        // Now save the vote in the database
        const { userId } = req.body;
        const existingVote = await VOTE.findOne({ userId });
        let isVoted = existingVote && existingVote.vote == 'Yes';

        // If the user has already voted, prevent multiple votes
        if (isVoted) {
            return res.redirect('/votersPanel?isVoted=true');
        } else {
            // Save the decrypted vote in the database
            const newVote = await VOTE.create({
                userId,
                votedPerson: decryptedVote,  // Save the decrypted voted person
                vote: "Yes"
            });

            console.log('Vote saved');
            res.redirect('/votersPanel?isVoted=true');
        }
    } catch (error) {
        console.error('Error processing the vote:', error);
        res.render('voterPanel', { error: 'There was an error processing your vote.' });
    }
});



module.exports = router;
