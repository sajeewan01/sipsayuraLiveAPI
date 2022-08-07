const { DataTypes } = require('sequelize');
 const Joi = require("joi");

module.exports = model;

function model(sequelize) {
    const attributes = {
        meetingName: { type: DataTypes.STRING, allowNull: false },
        meetingID: { type: DataTypes.STRING, allowNull: false },
        // title: { type: DataTypes.STRING, allowNull: false },
        duration: { type: DataTypes.TIME, allowNull: false },
        creatDatetime: { type: DataTypes.DATE, allowNull: false },
        recording: { type: DataTypes.BOOLEAN, allowNull: false },
        startDatetime: { type: DataTypes.DATE },
        userID: { type: DataTypes.STRING, allowNull: false },
        attendeePW: { type: DataTypes.STRING },
        moderatorPW: { type: DataTypes.STRING },
        internalMeetingId: { type: DataTypes.STRING },
    };



    return sequelize.define('record', attributes);
}