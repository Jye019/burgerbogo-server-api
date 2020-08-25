/* jshint indent: 1 */

module.exports = function (sequelize, DataTypes) {
  const reviews = sequelize.define(
    "reviews",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      burger_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      score: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      sweet: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      sour: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      salty: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      spicy: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "reviews",
      timestamps: true,
      paranoid: true,
      underscored: true,
    }
  );

  reviews.associate = (models) => {
    reviews.belongsTo(models.users, {
      foreignKey: "user_id",
    });
    reviews.belongsTo(models.burgers, {
      foreignKey: "burger_id",
    });
  };

  return reviews;
};
