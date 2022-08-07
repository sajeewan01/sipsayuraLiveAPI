const { DataTypes } = require('sequelize');
const Joi = require("joi");

module.exports = model;

function model(sequelize) {
    const attributes = {
        name: { type: DataTypes.STRING, allowNull: true },
        meeting_id: { type: DataTypes.STRING, allowNull: true },
        max_duration: { type: DataTypes.TIME, allowNull: true },
        is_deleted: { type: DataTypes.TINYINT,allowNull: true },
        welcome: { type: DataTypes.STRING, allowNull: true },
        attend_pw: { type: DataTypes.STRING ,allowNull: true},
        moderato_pwr: { type: DataTypes.STRING,allowNull: true},
        max_participant: { type: DataTypes.INTEGER ,allowNull: true},
        scheduled_at_Time: { type: DataTypes.STRING, allowNull: true },
        scheduled_at_Date: { type: DataTypes.STRING, allowNull: true },
        logout_url: { type: DataTypes.STRING,allowNull: true },
        record_id: { type: DataTypes.INTEGER,allowNull: true },
        accounts_id: { type: DataTypes.INTEGER ,allowNull: true},
        update_at: { type: DataTypes.DATE, allowNull: true },
        create_at: { type: DataTypes.DATE ,allowNull: true}
    };
    const options = {
        // disable default timestamp fields (createdAt and updatedAt)
        timestamps: false
    };

    return sequelize.define('meeting', attributes, options);
}