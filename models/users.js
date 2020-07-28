/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('users', {
		id: {
			autoIncrement: true,
			type: DataTypes.INTEGER,
			allowNull: false,
			primaryKey: true
		},
		name: {
			type: DataTypes.STRING(20),
			allowNull: true
		},
		password: {
			type: DataTypes.STRING(30),
			allowNull: true
		},
		phone: {
			type: DataTypes.CHAR(13),
			allowNull: true
		},
		age: {
			type: DataTypes.INTEGER.UNSIGNED,
			allowNull: true
		},
		is_admin: {
			type: DataTypes.INTEGER(1),
			allowNull: true
		},
		nickname: {
			type: DataTypes.STRING(20),
			allowNull: true
		},
		email: {
			type: DataTypes.STRING(30),
			allowNull: false
		},
		create_at: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
		},
		update_at: {
			type: DataTypes.DATE,
			allowNull: true
		},
		delete_at: {
			type: DataTypes.DATE,
			allowNull: true
		}
	}, {
		sequelize,
		tableName: 'users',
		timestamps: false
	});
};
