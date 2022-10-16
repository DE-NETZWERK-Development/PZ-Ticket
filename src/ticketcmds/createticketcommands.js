const discord = require('discord.js')

/**
 * 
 * @param {discord.Client} client 
 * @param {object} consoledata
 * 
 * @param {function(message)} consoledata.log
 * @param {function(code, message)} consoledata.Error
 * @param {function(message)} consoledata.Warning
 * @param {function(type, status, message)} consoledata.Operation
 * @param {function(status, message)} consoledata.Status
 * @param {function()} consoledata.Clear
 * @param {function(input, properties, index)} consoledata.Table
 * @param {function(message)} consoledata.Info
 */

module.exports.run = (client, consoledata) => {

    client.on('ready', async() => {
        
        try{

            var commands = await client.application.commands.fetch()
            var commandcreatetable = []

            for (let i = 0; i < commands.map(c => c).length; i++) {
                commandcreatetable.push({name:commands.map(c => c)[i].name,neu:false})
                //client.application.commands.delete(commands.map(c => c)[i])
            }

            consoledata.Info("Das erstellen der Slashcommands kann bis zu einer Stunde dauern")
            consoledata.Operation("registrieren","startet","ticket slashcommands")

            if(!commands.find(c => c.name == "ticketopen")){
                client.application.commands.create({
                    name:"ticketopen",
                    description:"Erstelle ein Ticket",
                    description_Localizations:"de",
                    dmPermission:false,
                    type:discord.ApplicationCommandType.ChatInput,
                    options:[{
                        name:"thema",
                        description:"Thema des Ticktes",
                        description_Localizations:"de",
                        name_Localizations:"de",
                        required:true,
                        type:discord.ApplicationCommandOptionType.String
                    }]
                })
                commandcreatetable.push({name:"open",neu:true})
            }

            if(!commands.find(c => c.name == "ticketclose")){
                client.application.commands.create({
                    name:"ticketclose",
                    description:"Schließe ein Ticket",
                    description_Localizations:"de",
                    dmPermission:false,
                    type:discord.ApplicationCommandType.ChatInput,
                    options:[{
                        name:"grund",
                        description:"Grund warum das Ticket geschlossen wurde -> Wird an den User ggf. weitergesendet",
                        description_Localizations:"de",
                        name_Localizations:"de",
                        required:false,
                        type:discord.ApplicationCommandOptionType.String
                    }]
                })
                commandcreatetable.push({name:"close",neu:true})
            }

            if(!commands.find(c => c.name == "ticketclaim")){
                client.application.commands.create({
                    name:"ticketclaim",
                    description:"Beanspruche ein Ticket für dich",
                    description_Localizations:"de",
                    dmPermission:false,
                    type:discord.ApplicationCommandType.ChatInput,
                })
                commandcreatetable.push({name:"claim",neu:true})
            }

            if(!commands.find(c => c.name == "ticketreopen")){
                client.application.commands.create({
                    name:"ticketreopen",
                    description:"Öffne ein Ticket damit andere Teammitglieder weiterhelfen können",
                    description_Localizations:"de",
                    dmPermission:false,
                    type:discord.ApplicationCommandType.ChatInput,
                })
                commandcreatetable.push({name:"reopen",neu:true})
            }

            if(!commands.find(c => c.name == "ticketname")){
                client.application.commands.create({
                    name:"ticketname",
                    description:"Benenne ein Ticket um",
                    description_Localizations:"de",
                    dmPermission:false,
                    type:discord.ApplicationCommandType.ChatInput,
                    options:[{
                        name:"name",
                        description:"Neuer Ticket name",
                        description_Localizations:"de",
                        name_Localizations:"de",
                        required:true,
                        type:discord.ApplicationCommandOptionType.String
                    }]
                })
                commandcreatetable.push({name:"name",neu:true})
            }

            if(!commands.find(c => c.name == "ticketthema")){
                client.application.commands.create({
                    name:"ticketthema",
                    description:"Benenne ein Ticket um",
                    description_Localizations:"de",
                    dmPermission:false,
                    type:discord.ApplicationCommandType.ChatInput,
                    options:[{
                        name:"thema",
                        description:"Neues Ticket Thema",
                        description_Localizations:"de",
                        name_Localizations:"de",
                        required:true,
                        type:discord.ApplicationCommandOptionType.String
                    }]
                })
                commandcreatetable.push({name:"thema",neu:true})
            }

            if(!commands.find(c => c.name == "ticketadd")){
                client.application.commands.create({
                    name:"ticketadd",
                    description:"Füge eine Person oder Rolle zum Ticket hinzu",
                    description_Localizations:"de",
                    dmPermission:false,
                    type:discord.ApplicationCommandType.ChatInput,
                    options:[{
                        name:"user",
                        description:"Nutzer fürs Ticket",
                        description_Localizations:"de",
                        name_Localizations:"de",
                        required:false,
                        type:discord.ApplicationCommandOptionType.User
                    },{
                        name:"rolle",
                        description: "Rolle fürs Ticket",
                        description_Localizations:"de",
                        name_Localizations:"de",
                        required:false,
                        type:discord.ApplicationCommandOptionType.Role
                    }]
                })
                commandcreatetable.push({name:"name",neu:true})
            }

            if(!commands.find(c => c.name == "ticketsetup")){
                client.application.commands.create({
                    name:"ticketsetup",
                    description:"Richte ein TicketPanel ein",
                    description_Localizations:"de",
                    dmPermission:false,
                    type:discord.ApplicationCommandType.ChatInput,
                    options:[{
                        name:"ticket-thema",
                        description:"Thema des Ticktes",
                        description_Localizations:"de",
                        name_Localizations:"de",
                        required:true,
                        type:discord.ApplicationCommandOptionType.String
                    },{
                        name:"new-ticket-category",
                        description:"Kategorie, in welcher ein neues Ticket geöffnet wird",
                        description_Localizations:"de",
                        name_Localizations:"eng",
                        required:true,
                        type:discord.ApplicationCommandOptionType.Channel
                    },{
                        name:"ticket-panel-channel",
                        description:"Channel wo das Ticketpanel erstellt werden soll",
                        description_Localizations:"de",
                        name_Localizations:"eng",
                        required:true,
                        type:discord.ApplicationCommandOptionType.Channel
                    },{
                        name:"max-ticket-per-user",
                        description:"Maximale Tickets die ein Nutzer öffnen kann",
                        description_Localizations:"de",
                        name_Localizations:"eng",
                        required:true,
                        type:discord.ApplicationCommandOptionType.Number
                    },{
                        name:"kontakt-user-on-close",
                        description:"Soll der Nutzer beim Schließen des Tickets benachritigt werden?",
                        description_Localizations:"de",
                        name_Localizations:"eng",
                        required:true,
                        type:discord.ApplicationCommandOptionType.Boolean
                    },{
                        name:"ticket-log",
                        description:"Ticket Log Channel",
                        description_Localizations:"de",
                        name_Localizations:"de",
                        required:false,
                        type:discord.ApplicationCommandOptionType.Channel
                    },{
                        name:"allowfeedback",
                        description:"Erlaube, das ein Feedblack zum Tickt abgegeben wird (der dazugehörige Channel)",
                        description_Localizations:"de",
                        name_Localizations:"eng",
                        required:false,
                        type:discord.ApplicationCommandOptionType.Channel
                    }]
                })
                commandcreatetable.push({name:"setup",neu:true})
            }

            consoledata.Table(commandcreatetable)

        }catch(e) {
            consoledata.Error(e,"Fehler behindert das Erstellen der Ticket Commands")
        }

    })
}