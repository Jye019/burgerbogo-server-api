/* jshint indent: 1 */

module.exports = function (sequelize, DataTypes) {
  const burgers = sequelize.define(
    "Burgers",
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
        allowNull: true,
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
    }
  );

  burgers.associate = (models) => {
    burgers.belongsTo(models.Brands, {
      foreignKey: "brand_id",
    });
    burgers.hasMany(models.Reviews);
    burgers.hasMany(models.BIngredients);
  };

  return burgers;
};
