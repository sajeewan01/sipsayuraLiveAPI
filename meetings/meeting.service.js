const config = require('config.json');
const { Op } = require('sequelize');
const db = require('_helpers/db');
const meeting = require('_helpers/db');
const Joi = require("joi");
const axios = require('axios');
const { symbol, string } = require('joi');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const Cryptr = require('cryptr');
const cryptr = new Cryptr('myTotallySecretKey');
//Checking the crypto module
// const crypto = require('crypto');
// const algorithm = 'aes-256-cbc'; //Using AES encryption
// const key = crypto.randomBytes(32);
// const iv = crypto.randomBytes(16);

module.exports = {
    getmeeting,
    getMeetingByUserId,
    // getMeetingByMeetingId,
    createMeeting,
    deleteMeeting,
};


// hash password
// async function hash(password) {
//     return await bcrypt.hash(password, 10);
// }

//Encrypting text
// function encrypt(text) {
//    let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
//    let encrypted = cipher.update(text);
//    encrypted = Buffer.concat([encrypted, cipher.final()]);
//    return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
// }


//Get all Meetings from database
async function getmeeting() {
    const meetings = await db.Meetings.findAll();
    return meetings;
}

// Get Meeting by User id
async function getMeetingByUserId(accounts_id,is_deleted) {
    const meetings = await db.Meetings.findAll(
        {
            where: {
                accounts_id,
                is_deleted
            }
        }
    );
    return meetings;
}

// Get Meeting by meeting id
// async function getMeetingByMeetingId(meeting_id) {
//     const meetings = await db.Meetings.findAll(
//         {
//             where: {
//                 meeting_id
//             }
//         }
//     );
//     return meetings;
// }

// // Decrypting text
// function decrypt(text) {
//     let iv = Buffer.from(text.iv, 'hex');
//     let encryptedText = Buffer.from(text.encryptedData, 'hex');
//     let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
//     let decrypted = decipher.update(encryptedText);
//     decrypted = Buffer.concat([decrypted, decipher.final()]);
//     return decrypted.toString();
// }

//Create meeting 
async function createMeeting(params,res, generatedMeetingId,receivedAttendPassword,receivedModeratorPassword,start_date,start_time,accounts_id,actual_duration) {

    

//Password encryption
    var hashedAttendPassword=cryptr.encrypt(receivedAttendPassword);
    var hashedModeratorPassword=cryptr.encrypt(receivedModeratorPassword);

    console.log(hashedAttendPassword);
    
    //throw Data to Database
    const meeting = new db.Meetings(params)
    meeting.meeting_id= generatedMeetingId;
    meeting.attend_pw=hashedAttendPassword;
    meeting.moderato_pwr=hashedModeratorPassword;
    // meeting.accounts_id=accounts_id;
    // meeting.scheduled_at=`${start_date}' 
    meeting.scheduled_at_Time=`${start_time}`;
    meeting.scheduled_at_Date=`${start_date}`;
    meeting.max_duration=actual_duration;
    meeting.create_at = Date.now();
    meeting.update_at= Date.now();
    meeting.accounts_id=accounts_id;
    meeting.is_deleted = 0;
    await meeting.save();
    
}

//Join meeting 
// async function joinMeeting(req, res, next) {
      
// }

// Delete Meeting
async function deleteMeeting(meeting_id) {
    const meeting = await db.Meetings.findOne({ where: { meeting_id } });

    Object.assign(meeting, meeting_id);
    meeting.update_at= Date.now();
    meeting.is_deleted = 1;
    await meeting.save();

    return meeting;
}


