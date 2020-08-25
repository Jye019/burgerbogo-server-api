/* jshint indent: 1 */

module.exports = function (sequelize, DataTypes) {
  const brands = sequelize.define(
    "Brands",
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
    },
    {
      sequelize,
      tableName: "brands",
      timestamps: true,
      paranoid: true,
      underscored: true,
    }
  );
  brands.associate = (models) => {
    brands.hasMany(models.Burgers);
  };
  return brands;
};
