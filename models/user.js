/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('user', {
    user_id: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    password: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    phone: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    is_admin: {
      type: DataTypes.INTEGER(4),
      allowNull: true
    },
    create_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    },
    modify_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    delete_date: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    timestamps: false,
    tableName: 'user'
  });
};
