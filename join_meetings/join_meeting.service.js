// const config = require('config.json');
const { Op } = require('sequelize');
const db = require('_helpers/db');
// const meeting = require('_helpers/db');
const Joi = require("joi");
// const axios = require('axios');
// const { symbol, string } = require('joi');
// const { v4: uuidv4 } = require('uuid');
// const bcrypt = require('bcryptjs');





module.exports = {
    joinMeeting,
    joinRedirect,
    joinMeetingInfo
};

//Create meeting 
async function joinMeeting(req, res, next, full_name, meeting_id, session_url) {

    //throw Data to Database
    const join_meeting = new db.Join(req)
    join_meeting.full_name=full_name;
    join_meeting.meeting_id=meeting_id ;
    join_meeting.password=req.body.password;
    // join_meeting.role=req.body.role;
    join_meeting.create_at = Date.now();
    join_meeting.update_at= Date.now();
    join_meeting.session_url = session_url;
    join_meeting.is_deleted = 0;

    await join_meeting.save();
}

async function joinRedirect(req, res, next, meeting_id) {
    const meetings = await db.Meetings.findAll(
        {
            where: {
                meeting_id
            }
        }
        
    );
    return meetings;
}

async function joinMeetingInfo(req, res, next, meeting_id) {
    const meetings = await db.Meetings.findAll(
        {
            where: {
                meeting_id
            }
        }
        
    );
    return meetings;
}

