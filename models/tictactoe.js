module.exports = (sequelize, DataTypes) => {
    return sequelize.define("tictactoe",{
        user_id: 
        {
            type: DataTypes.STRING,
            //two rows cannot have the same value for a column
            primaryKey: true,
        },
        score:
        {
            type: DataTypes.INTEGER,
            //score should be 0 for first time player
            defaultValue: 0,
            allowNull: false,

        }
    })
}