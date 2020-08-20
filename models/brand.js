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
		}
	}, {
		sequelize,
		tableName: 'brand',
		timestamps: true,
		paranoid: true
	});
};
