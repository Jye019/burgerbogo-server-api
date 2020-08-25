/* jshint indent: 1 */

module.exports = function (sequelize, DataTypes) {
  const ingredients = sequelize.define(
    "ingredients",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(45),
        allowNull: true,
      },
      type: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "ingredients",
      timestamps: true,
      paranoid: true,
      underscored: true,
    }
  );
  ingredients.associate = (models) => {
    ingredients.hasMany(models.burgers_have_ingredients);
  };
  return ingredients;
};
