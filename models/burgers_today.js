/* jshint indent: 1 */

module.exports = function (sequelize, DataTypes) {
  const burgers_today = sequelize.define(
    "TBurger",
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
    },
    {
      sequelize,
      tableName: "burgers_today",
      timestamps: true,
      paranoid: true,
      underscored: true,
      defaultScope: {
        attributes: {
          exclude: [
            "createdAt",
            "updatedAt",
            "deletedAt",
            "burger_id",
            "BurgerId",
          ],
        },
      },
    }
  );

  burgers_today.associate = (models) => {
    burgers_today.belongsTo(models.Burger, {
      foreignKey: "burger_id",
    });
  };

  return burgers_today;
};
