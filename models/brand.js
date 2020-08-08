/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('brand', {
		id: {
			autoIncrement: true,
			type: DataTypes.INTEGER,
			allowNull: false,
			primaryKey: true
		},
		name: {
			type: DataTypes.STRING(45),
			allowNull: true
		},
		create_at: {
			type: DataTypes.STRING(45),
			allowNull: true
		},
		update_at: {
			type: DataTypes.STRING(45),
			allowNull: true
		},
		delete_at: {
			type: DataTypes.STRING(45),
			allowNull: true
		}
	}, {
		sequelize,
		tableName: 'brand',
		timestamps: false
	});
};
