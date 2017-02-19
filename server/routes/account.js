import express from 'express';
import Account from '../models/account';
import email from 'emailjs';

const server = email.server.connect({
    user: 'publison',
    password: 'wjdgh0754522',
    host: 'smtp.naver.com',
    port: 465,
    ssl: true
});

const router = express.Router();

router.post('/signup', (req, res) => {
    let usernameRegex = /^[a-z0-9_-]\w{5,20}$/;
    let passwordRegex = /^(?=.*[a-zA-Z])(?=.*[!@#$%^&*+=-])(?=.*[0-9]).{6,16}$/;

    if(!usernameRegex.test(req.body.username)){
        return res.status(400).json({
            error: 'BAD USERNAME',
            code: 1
        });
    }

    if(!passwordRegex.test(req.body.password) || typeof req.body.password !== 'string'){
        return res.status(400).json({
            error: 'BAD PASSWORD',
            code: 2
        });
    }

    Account.findOne({username: req.body.username}, (err, exists) => {
        if(err) throw err;
        if(exists){
            return res.status(409).json({
                error: 'USERNAME EXISTS',
                code: 3
            });
        }

        let account = new Account({
            username: req.body.username,
            password: req.body.password
        });

        account.password = account.generateHash(account.password);

        account.save(err => {
            if(err) throw err;

            const message = {
                text: '테스트메일 내용',
                from: 'publison@naver.com',
                to: 'jhson0819@gmail.com',
                subject: '테스트메일 제목'
            };

            server.send(message, function(err, message){
                //console.log(err || message);
            });

            return res.json({
                success: true
            });
        });
    });
});

router.post('/signin', (req, res) => {
    if(typeof req.body.password !== 'string'){
        return res.status(401).json({
            error: 'LOGIN FAILED',
            code: 1
        });
    }

    Account.findOne({username: req.body.username}, (err, account) => {
        if(err) throw err;

        if(!account){
            return res.status(401).json({
                error: 'LOGIN FAILED',
                code: 1
            });
        }

        if(!account.validateHash(req.body.password)){
            return res.status(401).json({
                error: 'LOGIN FAILED',
                code: 1
            });
        }

        let session = req.session;
        session.loginInfo = {
            _id: account._id,
            username: account.username
        };

        console.log(session.loginInfo);

        return res.json({
            success: true
        });
    });
});

router.get('/getinfo', (req, res) => {
    if(typeof req.session.loginInfo === "undefined"){
        return res.status(401).json({
            error: 1
        });
    }

    res.json({
        info: req.session.loginInfo
    });
});

router.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if(err) throw err;
    });

    return res.json({
        success: true
    });
});

router.get('/search/:username', (req, res) => {
    let re = new RegExp('^' + req.params.username);

    Account.find({username: {$regex: re}}, {_id: false, username: true})
           .limit(5)
           .sort({username:1})
           .exec((err, accounts) => {
               if(err) throw err;
               res.json(accounts);
           });
});

router.get('/search', (req, res) => {
    res.json([]);
});

export default router;
