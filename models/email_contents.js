/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('Email', {
		id: {
			autoIncrement: true,
			type: DataTypes.INTEGER,
			allowNull: false,
			primaryKey: true
		},
		contents: {
			type: DataTypes.TEXT,
			allowNull: false
		},
		subject: {
			type: DataTypes.STRING(50),
			allowNull: false
		}
	}, {
		sequelize,
		tableName: 'email_contents',
		timestamps: true,
		paranoid: true,
		underscored: true,
	});
};
