/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('burger', {
		id: {
			autoIncrement: true,
			type: DataTypes.INTEGER,
			allowNull: false,
			primaryKey: true
		},
		brand_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: {
					tableName: 'brand',
				},
				key: 'id'
			}
		},
		name: {
			type: DataTypes.STRING(45),
			allowNull: true
		},
		price_single: {
			type: DataTypes.INTEGER,
			allowNull: true
		},
		price_set: {
			type: DataTypes.INTEGER,
			allowNull: true
		},
		calorie: {
			type: DataTypes.INTEGER,
			allowNull: true
		},
		image: {
			type: DataTypes.STRING(200),
			allowNull: true
		},
		release: {
			type: DataTypes.DATEONLY,
			allowNull: true
		},
		weight: {
			type: DataTypes.INTEGER,
			allowNull: true
		},
		protein: {
			type: DataTypes.INTEGER,
			allowNull: true
		},
		natrium: {
			type: DataTypes.INTEGER,
			allowNull: true
		},
		sugar: {
			type: DataTypes.INTEGER,
			allowNull: true
		},
		saturated_fat: {
			type: DataTypes.INTEGER,
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
		tableName: 'burger',
		timestamps: true,
		paranoid: true
	});
};
