const discord = require('discord.js');
const dnd = require('../icons/data.json')
const { embedh } = require("../embedhandler/index.js")

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
    var reports = getdb(`reports`)
    var udb = getdb(`reportuser`)

    client.on('interactionCreate', async interaction => {
        consoledata.log("TEST")
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
            if (interaction.commandName == "reportinfo") {
                const din = interaction.options.getString("reportid")
                if (din == "ALL") {
                    var data = udb.get(`${interaction.guildId}-all`)
                    if (!data) {
                        return interaction.reply({ embeds: [await embedh("reportids", { reports: { tar: false }, author: { name: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamics: true }) } })] })
                    }
                    data = data.reports
                    return interaction.reply({ embeds: [await embedh("reportids", { reports: { tar: true, rids: data }, author: { name: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamics: true }) } })] })
                }
                var datau = udb.get(`${interaction.guildId}-${din}`)
                if (datau) {

                    return interaction.reply({ embeds: [await embedh("reportids", { reports: { tar: true, rids: datau }, author: { name: interaction.guild.members.cache.get(din).user.tag, iconURL: interaction.guild.members.cache.get(din).displayAvatarURL({}) } })] })

                    var data = datau.reports
                    var m = "";
                    const embed = new discord.EmbedBuilder()
                        .setTitle("Alle Reportid's des Users " + client.users.cache.get(din).tag)
                        .setColor("Orange")
                        .setFooter({ text: "By " + dnd.byt })
                    if (data.length == 0) {
                        embed.setFields({ name: "Reports", value: "Keine Reports bis jetzt vorhanden!" })
                        return interaction.reply({ embeds: [embed] })
                    }
                    for (let i = 0; i < data.length; i++) {
                        var t = m;
                        m = m + data[i] + "\n";
                        if (m >= 4000) {
                            m = t
                        }
                    }
                    embed.setFields({ name: "Reports Insgesammt", value: "" + data.length })
                    embed.setDescription("**ReportID's**:\n" + m)
                    return interaction.reply({ embeds: [embed] })

                }
                datau = reports.get(`${din}`)
                if (datau) {
                    if (datau.reporttype == "user") {

                        datau.rid = din
                        return interaction.reply({ embeds: [await embedh("reportids", { reports: { tar: true, rids: datau, uom: true }, author: { name: interaction.guild.members.cache.get(datau.reporteduser).user.tag, iconURL: interaction.guild.members.cache.get(datau.reporteduser).displayAvatarURL() } })] })
                    }
                    if (datau.reporttype == "message") {
                        datau.rid = din
                        return interaction.reply({ embeds: [await embedh("reportids", { reports: { tar: true, rids: datau, uom: false }, author: { name: interaction.guild.members.cache.get(datau.reporteduser).user.tag, iconURL: interaction.guild.members.cache.get(datau.reporteduser).displayAvatarURL() } })] })

                        const embed = new discord.EmbedBuilder()
                            .setTitle("Report " + din)
                            .setColor("Red")
                            .setFooter({ text: "By " + dnd.byt })
                            .setFields(
                                {
                                    name: "Reporteduser",
                                    value: "" + datau.reporteduser + "\n||<@" + datau.reporteduser + ">||"
                                },
                                {
                                    name: "Reporter",
                                    value: "" + datau.reporter + "\n||<@" + datau.reporter + ">||"
                                },
                                {
                                    name: "Reporttype",
                                    value: "" + datau.reporttype
                                },
                                {
                                    name: "Reason",
                                    value: "" + datau.reason
                                },
                                {
                                    name: "Zeit",
                                    value: "" + datau.time
                                }
                            )
                        return interaction.reply({ embeds: [embed] })
                    }
                    if (datau.reporttype == "message") {
                        const embed = new discord.EmbedBuilder()
                            .setTitle("Report " + din)
                            .setColor("Red")
                            .setFooter({ text: "By " + dnd.byt })
                            .setFields(
                                {
                                    name: "Reporteduser",
                                    value: "" + datau.reporteduser + "\n||<@" + datau.reporteduser + ">||"
                                },
                                {
                                    name: "Reporter",
                                    value: "" + datau.reporter + "\n||<@" + datau.reporter + ">||"
                                },
                                {
                                    name: "Reporttype",
                                    value: "" + datau.reporttype
                                },
                                {
                                    name: "Message",
                                    value: "" + datau.reportedmessage.content + "\n||[Link](" + datau.reportedmessage.link + ")||"
                                },
                                {
                                    name: "Zeit",
                                    value: "" + datau.time
                                }
                            )
                        return interaction.reply({ embeds: [embed] })

                    }
                }
                return interaction.reply({ content: "Keine Verfügbaren daten! Bitte überprüfe deine Angaben", ephemeral: true })
            }
        }
        if (interaction.commandType == discord.ApplicationCommandType.Message) {
            if (interaction.commandName == "report") {
                if (!db.get(`${interaction.guildId}`) || !db.get(`${interaction.guildId}`).user || !db.get(`${interaction.guildId}`).user.aktiv || db.get(`${interaction.guildId}`).user.aktiv != true) { return interaction.reply({ content: "Deaktiviert!", ephemeral: true }) }

                var rid = (Math.floor(Math.random() * 9999999999) + 1000000000).toString(16);
                if (reports.get(`${rid}`)) {
                    rid = "" + rid + "_" + rid
                }
                var rt = interaction.targetMessage.content;
                var ty = true;
                if (rt == "") {
                    rt = JSON.stringify(interaction.targetMessage.embeds)
                    ty = false;
                }
                const embed = new discord.EmbedBuilder()
                    .setTitle("Report Message | " + rid)
                    .addFields(
                        {
                            name: ty ? "Reported Message" : "Reported Embed (data)",
                            value: "" + rt + "\n||[Nachricht](" + interaction.targetMessage.url + ")||",
                            inline: false
                        },
                        {
                            name: "Nachricht von",
                            value: "" + interaction.targetMessage.author.tag + "\n||<@" + interaction.targetMessage.author.id + ">||",
                            inline: false
                        },
                        {
                            name: "Reporter",
                            value: "" + interaction.user.tag + "\n||<@" + interaction.user.id + ">||",
                            inline: false
                        }, {
                        name: "Zeit",
                        value: "" + discord.time(new Date(), discord.TimestampStyles.RelativeTime)
                    }
                    )
                reports.set(`${rid}`, {
                    reporteduser: "" + interaction.targetMessage.author.id,
                    reportedmessage: {
                        content: "" + rt,
                        link: "" + interaction.targetMessage.url
                    },
                    reporter: "" + interaction.user.id,
                    reporttype: "message",
                    time: discord.time(new Date(), discord.TimestampStyles.RelativeTime)
                })

                if (!udb.get(`${interaction.guildId}-all`)) {
                    udb.set(`${interaction.guildId}-all`, {
                        reports: [rid]
                    })
                } else {
                    var table = [rid];
                    var data = udb.get(`${interaction.guildId}-all`).reports
                    for (let i = 0; i < data.length; i++) {
                        table.push(data[i])
                    }
                    udb.set(`${interaction.guildId}-all`, {
                        reports: table
                    })
                }
                if (!udb.get(`${interaction.guildId}-${interaction.targetMessage.author.id}`)) {
                    udb.set(`${interaction.guildId}-${interaction.targetMessage.author.id}`, {
                        reports: [rid]
                    })
                } else {
                    var table = [rid];
                    var data = udb.get(`${interaction.guildId}-${interaction.targetMessage.author.id}`).reports
                    for (let i = 0; i < data.length; i++) {
                        table.push(data[i])
                    }
                    udb.set(`${interaction.guildId}-${interaction.targetMessage.author.id}`, {
                        reports: table
                    })
                }

                interaction.reply({ content: "Done :)", ephemeral: true })
                client.channels.cache.get(db.get(`${interaction.guildId}`).user.channel).send({ embeds: [embed] })
            }
        }
        if (interaction.commandType == discord.ApplicationCommandType.User) {
            if (interaction.commandName == "report") {
                if (!db.get(`${interaction.guildId}`) || !db.get(`${interaction.guildId}`).user || !db.get(`${interaction.guildId}`).user.aktiv || db.get(`${interaction.guildId}`).user.aktiv != true) { return interaction.reply({ content: "Deaktiviert!", ephemeral: true }) }

                var rid = (Math.floor(Math.random() * 9999999999) + 1000000000).toString(16);
                if (reports.get(`${rid}`)) {
                    rid = "" + rid + "_" + rid
                }
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
                    .setTitle("Report User | " + rid)
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
                        }, {
                        name: "Zeit",
                        value: "" + discord.time(new Date(), discord.TimestampStyles.RelativeTime)
                    }
                    )

                reports.set(`${rid}`, {
                    reporteduser: "" + interaction.targetUser.id,
                    reporter: "" + interaction.user.id,
                    reason: "" + modalsubmit.fields.getTextInputValue('reason'),
                    reporttype: "user",
                    time: discord.time(new Date(), discord.TimestampStyles.RelativeTime)
                })

                if (!udb.get(`${interaction.guildId}-all`)) {
                    udb.set(`${interaction.guildId}-all`, {
                        reports: [rid]
                    })
                } else {
                    var table = [rid];
                    var data = udb.get(`${interaction.guildId}-all`).reports
                    for (let i = 0; i < data.length; i++) {
                        table.push(data[i])
                    }
                    udb.set(`${interaction.guildId}-all`, {
                        reports: table
                    })
                }
                if (!udb.get(`${interaction.guildId}-${interaction.targetUser.id}`)) {
                    udb.set(`${interaction.guildId}-${interaction.targetUser.id}`, {
                        reports: [rid]
                    })
                } else {
                    var table = [rid];
                    var data = udb.get(`${interaction.guildId}-${interaction.targetUser.id}`).reports
                    for (let i = 0; i < data.length; i++) {
                        table.push(data[i])
                    }
                    udb.set(`${interaction.guildId}-${interaction.targetUser.id}`, {
                        reports: table
                    })
                }
                modalsubmit.reply({ content: "Done :)", ephemeral: true })
                client.channels.cache.get(db.get(`${interaction.guildId}`).user.channel).send({ embeds: [embed] })
            }
        }
    })
}
