/* jshint indent: 1 */

module.exports = function (sequelize, DataTypes) {
  const burgers = sequelize.define(
    "Burger",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      brand_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(45),
        allowNull: false,
      },
      price_single: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      price_set: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      price_combo: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      calorie: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      image: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      released_at: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      weight: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      protein: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      natrium: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      sugar: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      saturated_fat: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "burgers",
      timestamps: true,
      paranoid: true,
      underscored: true,
      // defaultScope: {
      //   attributes: {
      //     exclude: [
      //       "brand_id",
      //       "BrandId",
      //       "createdAt",
      //       "updatedAt",
      //       "deletedAt",
      //     ],
      //   },
      // },
    }
  );

  burgers.associate = (models) => {
    burgers.belongsTo(models.Brand, {foreignKey: "brand_id"});
    burgers.hasMany(models.Review, {as: 'Review'});
    burgers.hasMany(models.BIngredient);
    burgers.hasMany(models.TBurger);
    burgers.addScope("burgersToday", {
      attributes: [
        "id",
        "name",
        "price_single",
        "price_set",
        "price_combo",
        "image",
      ],
      include: [{ model: models.Brand, attributes: ["name"] }],
    });
  };

  return burgers;
};
