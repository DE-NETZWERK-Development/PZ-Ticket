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

    client.on('ready', async () => {

        try {

            var commands = await client.application.commands.fetch()
            var commandcreatetable = []

            for (let i = 0; i < commands.map(c => c).length; i++) {
                //commandcreatetable.push({name:commands.map(c => c)[i].name,neu:false})
                //client.application.commands.delete(commands.map(c => c)[i])
            }

            consoledata.Info("Das erstellen der Slashcommands kann bis zu einer Stunde dauern")
            consoledata.Operation("registrieren", "startet", "ticket slashcommands")

            if (!commands.find(c => c.name == "report")) {
                client.application.commands.create({
                    type: discord.ApplicationCommandType.User,
                    name: "report",
                    dmPermission: false
                })
            }

            if (!commands.find(c => c.name == "report")) {
                client.application.commands.create({
                    type: discord.ApplicationCommandType.Message,
                    name: "report",
                    dmPermission: false
                })
            }

            if (!commands.find(c => c.name == "setupreport")) {
                client.application.commands.create({
                    name: "setupreport",
                    description: "Richte das Report System ein",
                    description_Localizations: "de",
                    dmPermission: false,
                    type: discord.ApplicationCommandType.ChatInput,
                    options: [{
                        name: "reportmessage",
                        description: "Aktiviere / Deaktiviere das Reporten von Nachrichten",
                        description_Localizations: "de",
                        name_Localizations: "de",
                        required: true,
                        type: discord.ApplicationCommandOptionType.String,
                        choices: [{
                            name: "Aktivieren",
                            value: "aktiv"
                        }, {
                            name: "Deaktivieren",
                            value: "deaktiv"
                        }]
                    }, {
                        name: "reportuser",
                        description: "Aktiviere / Deaktiviere das Reporten von Nutzern",
                        description_Localizations: "de",
                        name_Localizations: "de",
                        required: true,
                        type: discord.ApplicationCommandOptionType.String,
                        choices: [{
                            name: "Aktivieren",
                            value: "aktiv"
                        }, {
                            name: "Deaktivieren",
                            value: "deaktiv"
                        }]
                    }],
                    autocomplete:true
                })
            }


            //consoledata.Table(commandcreatetable)

        } catch (e) {
            consoledata.Error(e, "Fehler behindert das Erstellen der Ticket Commands")
        }

    })
}
