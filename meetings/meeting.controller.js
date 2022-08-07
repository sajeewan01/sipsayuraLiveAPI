const express = require('express');
const router = express.Router();
const Joi = require('joi');
const meetingService = require('./meeting.service');
const axios = require('axios');
const crypto = require('crypto');
require('dotenv').config()
const xml2js = require('xml2js');
const { UUIDV4 } = require('sequelize');
// const { v4: uuidv4 } = require('uuid');
const { date } = require('joi');
const niceware = require('niceware');
const dotenv = require('dotenv');
const { secret } = require('config.json');
const jwt = require('express-jwt');
const JWT = require('jsonwebtoken')
const { verifyAccessToken } = require('../_middleware/authorize');
const { TIME } = require('sequelize');

//routes
router.get('/getMeeting', verifyAccessToken, getmeeting);
router.post('/getMeetingByUserID', verifyAccessToken, getMeetingByUserId);
// router.post('/getMeetingByMeetingID/:id', verifyAccessToken, getMeetingByMeetingId);
router.delete('/deleteMeeting/:id', verifyAccessToken, deleteMeeting);
router.post('/createMeeting', verifyAccessToken, requestMeeting);

module.exports = router;

//Custom UUID
function uuidv4() {
    return ("LETMO@" + 2e8).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

// console.log(uuidv4());

//Get all meetings
function getmeeting(_req, res, next) {
    meetingService.getmeeting()
        .then(meetings => res.send(meetings))
        .catch(next);
}

//Get meeting by UserId
function getMeetingByUserId(req, res, next) {
    meetingService.getMeetingByUserId(req.userId, 0)
        .then(meetings => res.send(meetings))
        .catch(next);
}

// //Get meeting by MeetingId
// function getMeetingByMeetingId(req, res, next) {
//     var meeting_id = req.params.id;
//     meetingService.getMeetingByMeetingId(meeting_id)
//         .then(meetings => res.send(meetings))
//         .catch(next);
// }

//Create meeting
function createMeeting(req, res, next, generatedMeetingId, receivedAttendPassword, receivedModeratorPassword, start_date, selected_start_time,accounts_id, actual_duration) {
    meetingService.createMeeting(req.body, req.get('origin'), generatedMeetingId, receivedAttendPassword, receivedModeratorPassword, start_date, selected_start_time, accounts_id, actual_duration)
        .then(() => res.status(200).json({ status: "Success", message: 'Meeting Created Successfully' }))
        // .then(() => res.json('Meeting Created Successfully'))
        .catch(next);
}

//Delete meeting
function deleteMeeting(req, res, next) {
    var meeting_id = req.params.id;
    meetingService.deleteMeeting(meeting_id)
        .then(meeting => res.status(200).json({ message: 'Meeting Deleted Successfully' }))
        .catch(next);
}

//Hash Function 
function hash(x) {
    return (crypto.createHash('sha1').update(x).digest('hex'));
}

//create meeting
function requestMeeting(req, res, next) {
    var name = req.body.name;
    //var meeting_id = req.body.meeting_id;
    var attend_pw = req.body.attend_pw;
    // var moderato_pwr = req.body.moderato_pwr;
    // var max_duration = req.body.max_duration;
    var max_participant = req.body.max_participant;
    var auto_start_recording = req.body.auto_start_recording;
    var lock_settings_disable_public_chat = req.body.lock_settings_disable_public_chat;
    var mute_on_start = req.body.mute_on_start;
    var allow_mods_to_eject_camaras = req.body.allow_mods_to_eject_camaras;
    var selected_end_time = req.body.selected_end_time;
    var selected_start_time = req.body.selected_start_time;
    var start_date = req.body.start_date;
    var accounts_id = req.userId;

    var startDate = new Date(
        `${start_date},${selected_start_time}`
    );

    var endDate = new Date(
        `${start_date},${selected_end_time}`
    );

    var max_duration = getDifferentBetweenMinutes(startDate, endDate);
    // console.log(`${start_date} ${selected_start_time} ${selected_end_time}`);
    // console.log(`${startDate} ${endDate}`);
    // console.log(max_duration);

    function getDifferentBetweenMinutes(dt1, dt2) {
        var diff = (dt2.getTime() - dt1.getTime()) / 1000;
        diff /= 60;
        return Math.abs(Math.round(diff));
    }

    var generatedMeetingId = uuidv4();
    var receivedAttendPassword = "";
    var receivedModeratorPassword = "";

    // The number of bytes must be even
    var generatedmoderator_pwd_lst = niceware.generatePassphrase(8);
    var generatedmoderator_pwd = generatedmoderator_pwd_lst[2];

    // //duration Calculation

    function getMinutesBetweenDates(startDate) {
        var diff = (new Date(startDate) - new Date()) / 1000;
        diff /= 60;
        return Math.abs(Math.round(diff));
        // var diff = Math.abs(new Date(startDate) - new Date());
        // return Math.round(diff / 60000);
    }
    // console.log(result);

    var actual_duration = getMinutesBetweenDates(`${start_date} ${selected_start_time}`) + Number(max_duration);
    console.log(actual_duration);
    // const result = getMinutesBetweenDates('2022-07-10 09:50 AM');

    //record call back url
    var recordUrl = "http://localhost:4000/record/recording_status";
    var encodedUrl = encodeURIComponent(recordUrl);

    //checksum Text
    var checksumText = `createname=${name}&meetingID=${generatedMeetingId}&attendeePW=${attend_pw}&moderatorPW=${generatedmoderator_pwd}&duration=${actual_duration}&maxParticipants=${max_participant}&record=true&meta_bbb-recording-ready-url=${encodedUrl}&allowStartStopRecording=true&autoStartRecording=${auto_start_recording}&lockSettingsDisablePublicChat=${lock_settings_disable_public_chat}&muteOnStart=${mute_on_start}&allowModsToEjectCameras=${allow_mods_to_eject_camaras}${process.env.SECRET_KEY}`;

    //checksum call
    var checksum = hash(checksumText);

    // // Http post
    axios.post(`https://live.sipsayura.com/bigbluebutton/api/create?name=${name}&meetingID=${generatedMeetingId}&attendeePW=${attend_pw}&moderatorPW=${generatedmoderator_pwd}&duration=${actual_duration}&maxParticipants=${max_participant}&record=true&meta_bbb-recording-ready-url=${encodedUrl}&allowStartStopRecording=true&autoStartRecording=${auto_start_recording}&lockSettingsDisablePublicChat=${lock_settings_disable_public_chat}&muteOnStart=${mute_on_start}&allowModsToEjectCameras=${allow_mods_to_eject_camaras}&checksum=${checksum}`).then((meetings) => {
        var BBresponse = meetings.data;
        console.log(BBresponse);
        var jsonData = parseXmlToJson(BBresponse);
        receivedAttendPassword = jsonData.attendeePW;
        receivedModeratorPassword = jsonData.moderatorPW;
        if (jsonData.returncode == "SUCCESS" && jsonData.messageKey != "duplicateWarning") {
            createMeeting(req, res, next, generatedMeetingId, receivedAttendPassword, receivedModeratorPassword, start_date, selected_start_time, accounts_id, actual_duration);
        } else if (jsonData.returncode == "FAILED" || jsonData.messageKey == "duplicateWarning") {
            if (jsonData.messageKey == "idNotUnique") {
                // res.send("A meeting already exists with that meeting ID. Please use a different meeting ID");
                res.status(500).json({ status: "Failed", message: "Internal Server Error" })
            } else {
                res.status(503).json({ status: "Failed", message: "Service Unavailable." })
            }
        } else {
            res.status(400).json({ status: "Failed", message: "Bad Request." })
        }
    }
    )
}

function parseXmlToJson(xml) {
    const json = {};
    for (const res of xml.matchAll(/(?:<(\w*)(?:\s[^>]*)*>)((?:(?!<\1).)*)(?:<\/\1>)|<(\w*)(?:\s*)*\/>/gm)) {
        const key = res[1] || res[3];
        const value = res[2] && parseXmlToJson(res[2]);
        json[key] = ((value && Object.keys(value).length) ? value : res[2]) || null;
    }
    return json;
}
