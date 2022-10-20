const { DiscordAPIError } = require('discord.js');
const discord = require('discord.js');

/**
 * 
 * @param {discord.Client} client 
 * @param {object} consoledata
 * @param {object} rname
 * @param {object} nsdata
 * @param {function getname(name) {return enmap.default}} getdb
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

module.exports.run = (client, consoledata, getdb, channel) => {
    consoledata.log("Start Reporthandler")

    client.on('interactionCreate', async interaction => {
        var db = getdb(`reportengin`)
        if (interaction.commandType == discord.ApplicationCommandType.ChatInput) {
            if (interaction.commandName == "setupreport") {
                switch (interaction.options.getSubcommand()) {
                    case "message":
                        var a = interaction.options.getString("report");
                        var channel = interaction.options.getChannel("channel")

                        if ((a != "aktiv") && (a != "deaktiv")) return interaction.reply({ content: "Fehlerhafte Angabe (Aktivieren oder Deaktivieren!)", ephemeral: true })
                        if (channel.type != discord.ChannelType.GuildText) return interaction.reply({ content: "Fehlerhafte Angabe (Channel keine Kathegorie oder sonstiges!)", ephemeral: true })

                        if (a == "aktiv") {
                            a = true;
                        }
                        if (a == "deaktiv") {
                            a = false;
                        }

                        if (!db.get(`${interaction.guildId}`)) {

                            db.set(`${interaction.guildId}`, {
                                message: {
                                    aktiv: a,
                                    channel: channel.id
                                },
                                user: {
                                    aktiv: false,
                                    channel: 0
                                }
                            })

                            return interaction.reply({ content: "Done :)", ephemeral: true })

                        }

                        var data = db.get(`${interaction.guildId}`)

                        db.set(`${interaction.guildId}`, {
                            message: {
                                aktiv: a,
                                channel: channel.id
                            },
                            user: {
                                aktiv: data.user.aktiv,
                                channel: data.user.channel
                            }
                        })

                        interaction.reply({ content: "Done :)", ephemeral: true })
                        break;

                    case "user":
                        var a = interaction.options.getString("report");
                        var channel = interaction.options.getChannel("channel")

                        if ((a != "aktiv") && (a != "deaktiv")) return interaction.reply({ content: "Fehlerhafte Angabe (Aktivieren oder Deaktivieren!)", ephemeral: true })
                        if (channel.type != discord.ChannelType.GuildText) return interaction.reply({ content: "Fehlerhafte Angabe (Channel keine Kathegorie oder sonstiges!)", ephemeral: true })

                        if (a == "aktiv") {
                            a = true;
                        }
                        if (a == "deaktiv") {
                            a = false;
                        }

                        if (!db.get(`${interaction.guildId}`)) {

                            db.set(`${interaction.guildId}`, {
                                user: {
                                    aktiv: a,
                                    channel: channel.id
                                },
                                message: {
                                    aktiv: false,
                                    channel: 0
                                }
                            })

                            return interaction.reply({ content: "Done :)", ephemeral: true })

                        }

                        var data = db.get(`${interaction.guildId}`)

                        db.set(`${interaction.guildId}`, {
                            user: {
                                aktiv: a,
                                channel: channel.id
                            },
                            message: {
                                aktiv: data.message.aktiv,
                                channel: data.message.channel
                            }
                        })

                        interaction.reply({ content: "Done :)", ephemeral: true })
                        break;
                }
            }
        }
        if (interaction.commandType == discord.ApplicationCommandType.Message) {
            if (interaction.commandName == "report") {
                if (!db.get(`${interaction.guildId}`) || !db.get(`${interaction.guildId}`).user || !db.get(`${interaction.guildId}`).user.aktiv || db.get(`${interaction.guildId}`).user.aktiv != true) { return interaction.reply({ content: "Deaktiviert!", ephemeral: true }) }

                const embed = new discord.EmbedBuilder()
                    .setTitle("Report Message")
                    .addFields(
                        {
                            name: "Reported Message",
                            value: "" + interaction.targetMessage.content + "\n||[Nachricht](" + interaction.targetMessage.url + ")||",
                            inline: false
                        },
                        {
                            name: "Nachricht von",
                            value: "" + interaction.user.tag + "\n||<@" + interaction.targetMessage.author.id + ">||",  
                            inline: false
                        },
                        {
                            name: "Reporter",
                            value: "" + interaction.user.tag + "\n||<@" + interaction.user.id + ">||",
                            inline: false
                        }
                    )
                interaction.reply({ content: "Done :)", ephemeral: true })
                client.channels.cache.get(db.get(`${interaction.guildId}`).user.channel).send({ embeds: [embed] })
            }
        }
        if (interaction.commandType == discord.ApplicationCommandType.User) {
            if (interaction.commandName == "report") {
                if (!db.get(`${interaction.guildId}`) || !db.get(`${interaction.guildId}`).user || !db.get(`${interaction.guildId}`).user.aktiv || db.get(`${interaction.guildId}`).user.aktiv != true) { return interaction.reply({ content: "Deaktiviert!", ephemeral: true }) }

                const modal = new discord.ModalBuilder()
                    .setCustomId('reportUserModal')
                    .setTitle(`Report User: ${interaction.targetUser.tag}`)
                    .setComponents(
                        new discord.ActionRowBuilder().setComponents(
                            new discord.TextInputBuilder()
                                .setCustomId('reason')
                                .setLabel('Grund')
                                .setStyle(discord.TextInputStyle.Paragraph)
                                .setRequired(true)
                                .setMinLength(10)
                                .setMaxLength(500)
                        )
                    );

                await interaction.showModal(modal);

                var modalsubmit = await interaction.awaitModalSubmit({ time: 0 })



                const embed = new discord.EmbedBuilder()
                    .setTitle("Report User")
                    .addFields(
                        {
                            name: "Reported Nutzer",
                            value: "" + interaction.targetUser.tag + "\n||<@" + interaction.targetUser.id + ">||",
                            inline: false
                        },
                        {
                            name: "Reporter",
                            value: "" + interaction.user.tag + "\n||<@" + interaction.user.id + ">||",
                            inline: false
                        },
                        {
                            name: "Grund",
                            value: "" + modalsubmit.fields.getTextInputValue('reason'),
                            inline: false
                        }
                    )
                modalsubmit.reply({ content: "Done :)", ephemeral: true })
                client.channels.cache.get(db.get(`${interaction.guildId}`).user.channel).send({ embeds: [embed] })
            }
        }
    })

}
