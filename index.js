const {Client, Intents, Interaction, MessageButton, MessageActionRow} = require('discord.js');
//imports token
const{token} = require('./config.json');

const{TicTacToe} = require("./databaseObjects.js")

const client = new Client({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

//runs once and prints ready
client.once('ready', () => {
    console.log('Ready!');
})

client.on('messageCreate', (message) => {

    //checks if bot says it
    if(message.author.id === client.user.id) return;
    //if it user message is ping, reply pong
    if(message.content === "ping")
    {
        message.reply("pong");
    }
})  


/*Tic Tac Toe */
let EMPTY = Symbol("empty");
//player select square
let PLAYER = Symbol("player");
//bot select square
let BOT = Symbol("bot");


//empty grid for now
let tictactoe_state 

function makeGrid()
{
    components = []
    for(let row = 0; row < 3; row++)
    {
        actionRow = new MessageActionRow()
        for(let col = 0; col < 3; col++)
        {
            messageButton = new MessageButton()
                .setCustomId("tictactoe_" +row+ "_" + col)

          switch(tictactoe_state[row][col])
          {
              case EMPTY:
                  messageButton
                    .setLabel(" ")
                    //way button looks
                    .setStyle("SECONDARY")
                break;
              case PLAYER:
                  messageButton
                    .setLabel("X")
                    .setStyle("PRIMARY")
                break;
            case BOT:
                messageButton
                     .setLabel("O")
                    .setStyle("DANGER")
                break;
          } 

            actionRow.addComponents(messageButton)

        }  
        components.push(actionRow)
    }
    return components
}

//random place for bot
function getRandomInt(max)
{
    return Math.floor(Math.random() * max)
}

function isDraw()
{
    //check if empty spot, otherwise return true
    for(let row = 0; row<3; row++)
    {
        for(let col = 0; col<3  ; col++)
        {
            if(tictactoe_state[row][col] === EMPTY)
            {
                return false;
            }
        }
    }
    return true;
}

function isGameOver()
{
    for(let i = 0; i<3; i++)
    {
        if(tictactoe_state[i][0] == tictactoe_state[i][1] && tictactoe_state[i][1] == tictactoe_state[i][2] && tictactoe_state[i][2] != EMPTY)
        {
            return true;
        }
        if(tictactoe_state[0][i] == tictactoe_state[1][i] && tictactoe_state[1][i] == tictactoe_state[2][i] && tictactoe_state[2][i] != EMPTY)
        {
            return true;
        }
    }
    if(tictactoe_state[1][1]!= EMPTY)
    {
        if(
        (tictactoe_state[0][0] == tictactoe_state[1][1] && tictactoe_state[1][1] == tictactoe_state[0][2]) ||
        (tictactoe_state[2][0] == tictactoe_state[1][1] && tictactoe_state[0][2]))
        {
            return true;
        }
    }
    return false;
}


//select a button function
client.on("interactionCreate", async interaction =>{
    if(!interaction.isButton()) return;
    if(!interaction.customId.startsWith('tictactoe')) return;


    if(isGameOver())
    {
        interaction.update({
            components: []
        })
        return;
    }

    //find the row and col by splitting customId
    parsedFields = interaction.customId.split("_");
    //row and cols
    let row = parsedFields[1]
    let col = parsedFields[2]


    if(tictactoe_state[row][col] != EMPTY)
    {
        interaction.update({
            content: "You can't select that position",
            components: makeGrid()
        })
        return;
    }
    //players selected square
    tictactoe_state[row][col] = PLAYER;
    if(isGameOver())
    {
        let user = await TicTacToe.findOne({
            where: 
            {
                user_id: interaction.user.id
            }
        })
        
        if(!user)
        {
            user = await TicTacToe.create({user_id: interaction.user.id})
        }
        await user.increment("score")


        interaction.update({
            content: "You won the game of tic-tact-toe! You have now won " + (user.get("score") + 1) +" times(s).",
            components: []
        })
        return;
    }
    if(isDraw())
    {
        interaction.update({
            content: "The game resulted in a draw!",
            components: []
        })
        return;
    }


    /* bot functionality */
    let botRow
    let botCol
    do
    {
    botRow = getRandomInt(3)
    botCol = getRandomInt(3)
    } while(tictactoe_state[botRow][botCol] != EMPTY);

    tictactoe_state[botRow][botCol] = BOT;

    if(isGameOver())
    {
        interaction.update({
            content: "You lost the game of tic-tact-toe!",
            components: makeGrid()
        })
        return;
    }
    if(isDraw())
    {
        interaction.update({
            content: "The game resulted in a draw!",
            components: []
        })
        return;
    }
    //update state of board
    interaction.update({
        components: makeGrid()
    })
})

client.on('interactionCreate', async interaction => {
    if(!interaction.isCommand()) return;

    const { commandName } = interaction;

    if(commandName === "tictactoe")
    {
         tictactoe_state = [
            [EMPTY, EMPTY, EMPTY],
            [EMPTY, EMPTY, EMPTY],
            [EMPTY, EMPTY, EMPTY]
        ]
        await interaction.reply({content: "Playing a game of tic-tac-toe", components: makeGrid() });
    }
})

client.login(token);
