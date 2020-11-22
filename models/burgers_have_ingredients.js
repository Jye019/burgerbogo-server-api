/* jshint indent: 1 */

module.exports = function (sequelize, DataTypes) {
  const burgers_have_ingredients = sequelize.define(
    "BIngredient",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      burger_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      ingredient_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: "burgers_have_ingredients",
      timestamps: false,
      defaultScope: {
        attributes: {
          exclude: ["BurgerId", "IngredientId"],
        },
      },
    }
  );
  burgers_have_ingredients.associate = (models) => {
    burgers_have_ingredients.belongsTo(models.Burger, {
      foreignKey: "burger_id",
    });
    burgers_have_ingredients.belongsTo(models.Ingredient, {
      foreignKey: "ingredient_id",
    });
  };
  return burgers_have_ingredients;
};
