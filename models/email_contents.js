/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('email_contents', {
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
		createdAt: {
			type: DataTypes.DATE,
			allowNull: true
		},
		updatedAt: {
			type: DataTypes.DATE,
			allowNull: true
		},
		deletedAt: {
			type: DataTypes.DATE,
			allowNull: true
		},
		subject: {
			type: DataTypes.STRING(50),
			allowNull: false
		}
	}, {
		sequelize,
		tableName: 'email_contents',
		timestamps: true,
		paranoid: true
	});
};
