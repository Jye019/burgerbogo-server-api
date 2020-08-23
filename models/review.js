/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('review', {
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
		burger_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: {
					tableName: 'burger',
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
		tableName: 'review',
		timestamps: true,
		paranoid: true
	});
};
