/* jshint indent: 1 */

module.exports = function (sequelize, DataTypes) {
  const reviews = sequelize.define(
    "Review",
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
      // defaultScope: {
      //   attributes: {
      //     exclude: [
      //       "user_id",
      //       "burger_id",
      //       "userId",
      //       "BurgerId",
      //       "createdAt",
      //       "updatedAt",
      //       "deletedAt",
      //     ],
      //   },
      // },
    }
  );

  reviews.associate = (models) => {
    reviews.belongsTo(models.User, {
      foreignKey: "user_id",
    });
    reviews.belongsTo(models.Burger, {
      foreignKey: "burger_id",
    });
    reviews.addScope("newReview", {
      order: [["createdAt", "DESC"]],
      attributes: ["id"],
      include: [
        {
          model: models.Burger,
          attributes: [
            "id",
            "name",
            "price_single",
            "price_set",
            "price_combo",
            "image",
          ],
          include: [{ model: models.Brand, attributes: ["name"] }],
        },
      ],
    });
  };

  return reviews;
};
