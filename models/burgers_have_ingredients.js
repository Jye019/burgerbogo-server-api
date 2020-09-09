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
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
      paranoid: true,
      underscored: true,
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
