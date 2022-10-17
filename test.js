const discord = require("discord.js")
const enmap = require("enmap")
const { ticketsystem, log } = require("./index")

const client = new discord.Client(
    {
        intents:
            [
                "Guilds",
                "GuildBans",
                "GuildEmojisAndStickers",
                "GuildIntegrations",
                "GuildInvites",
                "GuildMembers",
                "GuildMessageReactions",
                "GuildMessageTyping",
                "GuildMessages",
                "GuildPresences",
                "GuildScheduledEvents",
                "GuildVoiceStates",
                "GuildWebhooks"
            ]
    }
)

const ticket = new ticketsystem(client,
    {
        status:
        {
            name: "⚠ WARTUNGSARBEITEN ⚠ - ?botname?",
            type: "dnd",
            activities: {
                type: 0
            }
        },
        customconsole: true,
        supporterrolename: "Ticket Supporter",
        adminrolename: "Ticket Admin",
        credits: {
            enable: true
        },
        ticket: true,     
        inviteable: true,
        discord_logging_channel: "1030166299688583258"  ,
        logging_in_discord: true,
        ticketsettings:{
            ticketname:"?thema?-?id?"
        } 
    }
)
/*
ticket.updatestatus({
    name:"⚠ WARTUNGSARBEITEN ⚠",
    type:"dnd",
    activities:{
        type:5
    }
})*/

client.login(require("./token.js").gen_toke)
