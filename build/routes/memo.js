'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _Memo = require('../models/Memo');

var _Memo2 = _interopRequireDefault(_Memo);

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express2.default.Router();

router.post('/', function (req, res) {
    if (typeof req.session.loginInfo === 'undefined') {
        res.status(403).json({
            error: 'NOT LOGGED IN',
            code: 1
        });
    }

    if (typeof req.body.contents !== 'string') {
        res.status(400).json({
            error: 'EMPTY CONTENTS',
            code: 2
        });
    }

    if (req.body.contents === '') {
        res.status(400).json({
            error: 'EMPTY CONTENTS',
            code: 2
        });
    }

    var memo = new _Memo2.default({
        writer: req.session.loginInfo.username,
        contents: req.body.contents
    });

    memo.save(function (err) {
        if (err) throw err;
        return res.json({ success: true });
    });
});

router.put('/:id', function (req, res) {
    if (!_mongoose2.default.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({
            error: 'INVALID ID',
            code: 1
        });
    }

    if (typeof req.body.contents !== 'string') {
        res.status(400).json({
            error: 'EMPTY CONTENTS',
            code: 2
        });
    }

    if (req.body.contents === '') {
        res.status(400).json({
            error: 'EMPTY CONTENTS',
            code: 2
        });
    }

    if (typeof req.session.loginInfo === 'undefined') {
        res.status(403).json({
            error: 'NOT LOGGED IN',
            code: 3
        });
    }

    _Memo2.default.findById(req.params.id, function (err, memo) {
        if (err) throw err;

        if (!memo) {
            return res.status(404).json({
                error: "NO RESOURCE",
                code: 4
            });
        }

        if (memo.writer != req.session.loginInfo.username) {
            return res.status(403).json({
                error: "PERMISSION FAILURE",
                code: 5
            });
        }

        memo.contents = req.body.contents;
        memo.date.edited = new Date();
        memo.is_edited = true;

        memo.save(function (err, memo) {
            if (err) throw err;
            return res.json({
                success: true,
                memo: memo
            });
        });
    });
});

router.delete('/:id', function (req, res) {
    if (!_mongoose2.default.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({
            error: 'INVALID ID',
            code: 1
        });
    }

    if (typeof req.session.loginInfo === 'undefined') {
        res.status(403).json({
            error: 'NOT LOGGED IN',
            code: 1
        });
    }

    _Memo2.default.findById(req.params.id, function (err, memo) {
        if (err) throw err;

        if (!memo) {
            return res.status(404).json({
                error: "NO RESOURCE",
                code: 3
            });
        }

        if (memo.writer != req.session.loginInfo.username) {
            return res.status(403).json({
                error: "PERMISSION FAILURE",
                code: 4
            });
        }

        _Memo2.default.remove({ _id: req.params.id }, function (err) {
            if (err) throw err;
            res.json({
                success: true
            });
        });
    });
});

router.get('/', function (req, res) {
    _Memo2.default.find().sort({ '_id': -1 }).limit(6).exec(function (err, memo) {
        if (err) throw err;
        res.json(memo);
    });
});

router.get('/:listType/:id', function (req, res) {
    var listType = req.params.listType;
    var id = req.params.id;

    if (listType !== 'old' && listType !== 'new') {
        return res.status(400).json({
            error: 'INVALID LISTTYPE',
            code: 1
        });
    }

    if (!_mongoose2.default.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            error: 'INVALID ID',
            code: 2
        });
    }

    var objId = new _mongoose2.default.Types.ObjectId(req.params.id);

    if (listType === 'new') {
        _Memo2.default.find({ _id: { $gt: objId } }).sort({ _id: -1 }).limit(6).exec(function (err, memos) {
            if (err) throw err;
            return res.json(memos);
        });
    } else {
        _Memo2.default.find({ _id: { $lt: objId } }).sort({ _id: -1 }).limit(6).exec(function (err, memos) {
            if (err) throw err;
            return res.json(memos);
        });
    }
});

router.post('/star/:id', function (req, res) {
    if (!_mongoose2.default.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({
            error: 'INVALID ID',
            code: 1
        });
    }

    if (typeof req.session.loginInfo === 'undefined') {
        return res.status(403).json({
            error: 'NOT LOGGED IN',
            code: 2
        });
    }

    _Memo2.default.findById(req.params.id, function (err, memo) {
        if (err) throw err;

        if (!memo) {
            return res.status(404).json({
                error: 'NO RESOURCE',
                code: 3
            });
        }

        var index = memo.starred.indexOf(req.session.loginInfo.username);

        var hasStarred = index === -1 ? false : true;

        if (!hasStarred) {
            memo.starred.push(req.session.loginInfo.username);
        } else {
            memo.starred.splice(index, 1);
        }

        memo.save(function (err, memo) {
            if (err) throw err;
            res.json({
                success: true,
                'has_starred': !hasStarred,
                memo: memo
            });
        });
    });
});

router.get('/:username', function (req, res) {
    _Memo2.default.find({ writer: req.params.username }).sort({ '_id': -1 }).limit(6).exec(function (err, memos) {
        if (err) throw err;
        res.json(memos);
    });
});

router.get('/:username/:listType/:id', function (req, res) {
    var listType = req.params.listType;
    var id = req.params.id;

    if (listType !== 'old' && listType !== 'new') {
        return res.status(400).json({
            error: 'INVALID LISTTYPE',
            code: 1
        });
    }

    if (!_mongoose2.default.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            error: "INVALID ID",
            code: 2
        });
    }

    var objId = new _mongoose2.default.Types.ObjectId(id);

    if (listType === 'new') {
        _Memo2.default.find({ writer: req.params.username, _id: { $gt: objId } }).sort({ _id: -1 }).limit(6).exec(function (err, memos) {
            if (err) throw err;
            res.json(memos);
        });
    } else {
        _Memo2.default.find({ writer: req.params.username, _id: { $lt: objId } }).sort({ _id: -1 }).limit(6).exec(function (err, memos) {
            if (err) throw err;
            res.json(memos);
        });
    }
});

exports.default = router;