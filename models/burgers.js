/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('burgers', {
		id: {
			autoIncrement: true,
			type: DataTypes.INTEGER,
			allowNull: false,
			primaryKey: true
		},
		brands_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: {
					tableName: 'brands',
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
		price_combo: {
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
		released_at: {
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
		created_at: {
			type: DataTypes.DATE,
			allowNull: true
		},
		updated_at: {
			type: DataTypes.DATE,
			allowNull: true
		},
		deleted_at: {
			type: DataTypes.DATE,
			allowNull: true
		}
	}, {
		sequelize,
		tableName: 'burgers',
		timestamps: true,
		paranoid: true,
		underscored: true
	});
};
