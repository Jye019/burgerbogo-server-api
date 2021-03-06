/* jshint indent: 1 */

module.exports = function (sequelize, DataTypes) {
  const brands = sequelize.define(
    "Brand",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(45),
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: "brands",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
      paranoid: true,
      underscored: true,
    }
  );
  brands.associate = (models) => {
    brands.hasMany(models.Burger);
  };
  return brands;
};
