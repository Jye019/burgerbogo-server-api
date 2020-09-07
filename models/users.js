/* jshint indent: 1 */

module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "User",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      password: {
        type: DataTypes.STRING(80),
        allowNull: false,
      },
      birth_year: {
        type: "YEAR",
        allowNull: true,
      },
      user_level: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 10,
      },
      nickname: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING(30),
        allowNull: false,
      },
      verified: {
        type: DataTypes.INTEGER(1),
        allowNull: true,
        defaultValue: 0,
      },
      verify_key: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      gender: {
        type: DataTypes.INTEGER(1),
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "users",
      timestamps: true,
      paranoid: true,
      underscored: true,
    }
  );
};
