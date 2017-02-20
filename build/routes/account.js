'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _account = require('../models/account');

var _account2 = _interopRequireDefault(_account);

var _emailjs = require('emailjs');

var _emailjs2 = _interopRequireDefault(_emailjs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var server = _emailjs2.default.server.connect({
    user: 'publison',
    password: 'wjdgh0754522',
    host: 'smtp.naver.com',
    port: 465,
    ssl: true
});

var router = _express2.default.Router();

router.post('/signup', function (req, res) {
    var usernameRegex = /^[a-z0-9_-]\w{5,20}$/;
    var passwordRegex = /^(?=.*[a-zA-Z])(?=.*[!@#$%^&*+=-])(?=.*[0-9]).{6,16}$/;

    if (!usernameRegex.test(req.body.username)) {
        return res.status(400).json({
            error: 'BAD USERNAME',
            code: 1
        });
    }

    if (!passwordRegex.test(req.body.password) || typeof req.body.password !== 'string') {
        return res.status(400).json({
            error: 'BAD PASSWORD',
            code: 2
        });
    }

    _account2.default.findOne({ username: req.body.username }, function (err, exists) {
        if (err) throw err;
        if (exists) {
            return res.status(409).json({
                error: 'USERNAME EXISTS',
                code: 3
            });
        }

        var account = new _account2.default({
            username: req.body.username,
            password: req.body.password
        });

        account.password = account.generateHash(account.password);

        account.save(function (err) {
            if (err) throw err;

            var message = {
                text: '테스트메일 내용',
                from: 'publison@naver.com',
                to: 'jhson0819@gmail.com',
                subject: '테스트메일 제목'
            };

            server.send(message, function (err, message) {
                //console.log(err || message);
            });

            return res.json({
                success: true
            });
        });
    });
});

router.post('/signin', function (req, res) {
    if (typeof req.body.password !== 'string') {
        return res.status(401).json({
            error: 'LOGIN FAILED',
            code: 1
        });
    }

    _account2.default.findOne({ username: req.body.username }, function (err, account) {
        if (err) throw err;

        if (!account) {
            return res.status(401).json({
                error: 'LOGIN FAILED',
                code: 1
            });
        }

        if (!account.validateHash(req.body.password)) {
            return res.status(401).json({
                error: 'LOGIN FAILED',
                code: 1
            });
        }

        var session = req.session;
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

router.get('/getinfo', function (req, res) {
    if (typeof req.session.loginInfo === "undefined") {
        return res.status(401).json({
            error: 1
        });
    }

    res.json({
        info: req.session.loginInfo
    });
});

router.post('/logout', function (req, res) {
    req.session.destroy(function (err) {
        if (err) throw err;
    });

    return res.json({
        success: true
    });
});

router.get('/search/:username', function (req, res) {
    var re = new RegExp('^' + req.params.username);

    _account2.default.find({ username: { $regex: re } }, { _id: false, username: true }).limit(5).sort({ username: 1 }).exec(function (err, accounts) {
        if (err) throw err;
        res.json(accounts);
    });
});

router.get('/search', function (req, res) {
    res.json([]);
});

exports.default = router;