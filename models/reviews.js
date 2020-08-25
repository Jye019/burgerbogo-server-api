/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('reviews', {
		id: {
			autoIncrement: true,
			type: DataTypes.INTEGER,
			allowNull: false,
			primaryKey: true
		},
		users_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: {
					tableName: 'users',
				},
				key: 'id'
			}
		},
		burgers_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: {
					tableName: 'burgers',
				},
				key: 'id'
			}
		},
		content: {
			type: DataTypes.TEXT,
			allowNull: true
		},
		score: {
			type: DataTypes.FLOAT,
			allowNull: true
		},
		sweet: {
			type: DataTypes.FLOAT,
			allowNull: true
		},
		sour: {
			type: DataTypes.FLOAT,
			allowNull: true
		},
		salty: {
			type: DataTypes.FLOAT,
			allowNull: true
		},
		spicy: {
			type: DataTypes.FLOAT,
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
		tableName: 'reviews',
		timestamps: true,
		paranoid: true,
		underscored: true
	});
};
