const express = require('express');
const router = express.Router();
const joinMeetingService = require('./join_meeting.service');
const axios = require('axios');
const crypto = require('crypto');
require('dotenv').config()
const Cryptr = require('cryptr');
const cryptr = new Cryptr('myTotallySecretKey');
// const xml2js = require('xml2js');
const { UUIDV4 } = require('sequelize');
const JWT = require('jsonwebtoken')
const {verifyAccessToken} = require('../_middleware/authorize');


//routes
router.post('/:id', verifyAccessToken, joinRedirect);
router.post('/info/:id', verifyAccessToken, joinMeetingInfo);
router.get('/u', joinAttendee);

module.exports = router;

// //Hash Function 
function hash(x) {
    return (crypto.createHash('sha1').update(x).digest('hex'));
}

//parseXml2Json
function parseXmlToJson(xml) {
    const json = {};
    for (const res of xml.matchAll(/(?:<(\w*)(?:\s[^>]*)*>)((?:(?!<\1).)*)(?:<\/\1>)|<(\w*)(?:\s*)*\/>/gm)) {
        const key = res[1] || res[3];
        const value = res[2] && parseXmlToJson(res[2]);
        json[key] = ((value && Object.keys(value).length) ? value : res[2]) || null;
    }
    return json;
}

function getMinutesBetweenDates(startDate) {
    var diff = Math.abs(new Date(startDate) - new Date());
    return Math.round(diff / 60000);
}

async function joinRedirect(req, res, next) {
    var meetingID = req.params.id;
    joinMeetingService.joinRedirect(req, res, next, meetingID)
        // .then(meetings => res.send(meetings))
        .then(meetings => joinRequest(req, res, next, meetings))
        .catch(next);
}

async function joinMeetingInfo(req, res, next) {
    var meetingID = req.params.id;
    console.log(meetingID);
    joinMeetingService.joinMeetingInfo(req, res, next, meetingID)
        // .then(meetings => res.send(meetings))
        .then(meetings => joinMeetingInfoSend(req, res, next, meetings))
        .catch(next);
}

//join meeting (Moderator)
function joinRequest(req, res, next, meetings) {
    var full_name = meetings[0].name;
    var meeting_id = meetings[0].meeting_id;
    var password = meetings[0].moderato_pwr;
    var scheduled_at_Date = meetings[0].scheduled_at_Date;
    var scheduled_at_Time = meetings[0].scheduled_at_Time;
    var max_duration = meetings[0].max_duration;

    var time1 = getMinutesBetweenDates(`${scheduled_at_Date} ${scheduled_at_Time}`);

    //password decryption
    var decryptedPassword = cryptr.decrypt(password);

    //Generate checksum
    var joinChecksumTxt = `joinmeetingID=${meeting_id}&password=${decryptedPassword}&fullName=${full_name}&role=MODERATOR&redirect=false${process.env.SECRET_KEY}`;
    var joinChecksum = hash(joinChecksumTxt);

    //best to use .getTime() to compare dates
    if (time1 <= max_duration) {
        // Http post
        axios.post(`https://live.sipsayura.com/bigbluebutton/api/join?meetingID=${meeting_id}&password=${decryptedPassword}&fullName=${full_name}&role=MODERATOR&redirect=false&checksum=${joinChecksum}`).then((join_meetings) => {
            var BBresponse = join_meetings.data;
            // res.json(BBresponse);
            // console.log(BBresponse);
            var jsonData = parseXmlToJson(BBresponse);
            var session_url = jsonData.url;
            if (jsonData.returncode == "SUCCESS") {
                joinMeetingService.joinMeeting(req, res, next, full_name, meeting_id, session_url);
                res.status(200).json({ staus: "success", message: "You have joined successfully.", url: session_url});
            } else {
                res.send("Can't joined to the meeting now try again later.");
            }
        })
    } else if (time1 > max_duration) {
        res.status(400).json({ staus: "failed", message: `You have scheduled this meeting at ${scheduled_at_Date} ${scheduled_at_Time}, you cant start this meeting now.` });
        console.log(`You have scheduled this meeting at ${scheduled_at}, you cant start this meeting now.`);
    } else {
        res.status(503).json({ staus: "failed", message: "Some thing went wrong." });
        console.log("Some thing went wrong.");
    }

}

//join meeting (Moderator)
function joinMeetingInfoSend(req, res, next, meetings) {
    var name = meetings[0].name;
    var meeting_id = meetings[0].meeting_id;
    var password = meetings[0].attend_pw;
    // var scheduled_at = meetings[0].scheduled_at;
    var scheduled_at_Date = meetings[0].scheduled_at_Date;
    var scheduled_at_Time = meetings[0].scheduled_at_Time;
    var max_duration = meetings[0].max_duration;

    //password decryption
    var decryptedPassword = cryptr.decrypt(password);


    res.status(200).json({meeting_id:meeting_id, name:name, scheduled_at_Date: scheduled_at_Date, scheduled_at_Time:scheduled_at_Time, password:decryptedPassword, max_duration:max_duration});
}

//join meeting (Attandee)
function joinAttendee(req, res, next) {
    var full_name = req.body.name;
    var meeting_id = req.body.meeting_id;
    var password = req.body.password;

    //Generate checksum
    var joinChecksumTxt = `joinmeetingID=${meeting_id}&password=${password}&fullName=${full_name}&role=VIEWER&redirect=false${process.env.SECRET_KEY}`;
    var joinChecksum = hash(joinChecksumTxt);

    // Http post
    axios.post(`https://live.sipsayura.com/bigbluebutton/api/join?meetingID=${meeting_id}&password=${password}&fullName=${full_name}&role=VIEWER&redirect=false&checksum=${joinChecksum}`).then((join_meetings) => {
        var BBresponse = join_meetings.data;
        // res.json(BBresponse);
        // console.log(BBresponse);
        var jsonData = parseXmlToJson(BBresponse);
        if (jsonData.returncode == "SUCCESS") {
            res.status(200).json({ staus: "success", message: "You have joined successfully."});
        } else {
            res.send("Can't joined to the meeting now try again later.");
        }
    })
}


