const { DataTypes } = require('sequelize');
const Joi = require("joi");

module.exports = model;

function model(sequelize) {
    const attributes = {
        full_name: { type: DataTypes.STRING, allowNull: true },
        meeting_id: { type: DataTypes.STRING, allowNull: true },
        password: { type: DataTypes.STRING, allowNull: true },
        role: { type: DataTypes.STRING,allowNull: true },
        is_deleted : { type: DataTypes.INTEGER,allowNull: true },
        update_at: { type: DataTypes.DATE, allowNull: true },
        create_at: { type: DataTypes.DATE ,allowNull: true},
        session_url:{type: DataTypes.TEXT, allowNull: true}
    };
    const options = {
        // disable default timestamp fields (createdAt and updatedAt)
        timestamps: false
    };

    return sequelize.define('join_meeting', attributes, options);
}