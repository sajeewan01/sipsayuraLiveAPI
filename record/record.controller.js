const express = require('express');
const router = express.Router();
const Joi = require('joi');

router.post('/recording_status', bbbResponse);

module.exports =router;

function bbbResponse(req, res, next){
    console.log('Recording Completed');
}