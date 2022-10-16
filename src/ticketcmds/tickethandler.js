const discord = require('discord.js')

/**
 * 
 * @param {discord.Client} client 
 * @param {object} consoledata
 * @param {object} rname
 * @param {object} ndata
 * 
 * @param {string} ndata.fs
 * 
 * @param {string} rname.support
 * @param {string} rname.admin
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

module.exports.run = (client, consoledata, getdb, rname, ndata) => {
    const support = new discord.AttachmentBuilder('./src/icons/support.png');
    const error = new discord.AttachmentBuilder('./src/icons/error.png');

    client.on('interactionCreate', async interaction => {
        if (interaction.commandType == discord.ApplicationCommandType.ChatInput) {
            switch (interaction.commandName) {
                case "ticketsetup":
                    try {
                        await interaction.reply({
                            embeds: [
                                new discord.EmbedBuilder()
                                    .setTitle("🎟 Ticket - Setup ⚙")
                                    .setFooter({ text: "By Planet Zero", iconURL: client.user.avatarURL({}) })
                                    .setDescription("Ticketsystem wird eingerichtet, dies kann einige Minuten dauern, bitte haben sie etwsa gedult!")
                            ], ephemeral: true
                        });

                        const thema = interaction.options.getString("ticket-thema")
                        const category = interaction.options.getChannel("new-ticket-category")
                        const channel = interaction.options.getChannel("ticket-panel-channel")
                        const maxupticket = interaction.options.getNumber("max-ticket-per-user")
                        const kontakt = interaction.options.getBoolean("kontakt-user-on-close")
                        var ticketlog = interaction.options.getChannel("ticket-log")
                        var allowfeedback = interaction.options.getChannel("allowfeedback")
                        if (!ticketlog) { ticketlog = 0 } else { ticketlog = ticketlog.id }
                        if (!allowfeedback) { allowfeedback = 0 } else { allowfeedback = allowfeedback.id }
                        consoledata.Table([
                            { type: "thema", value: thema },
                            { type: "category", value: category },
                            { type: "channel", value: channel },
                            { type: "maxupticket", value: maxupticket },
                            { type: "kontakt", value: kontakt },
                            { type: "ticketlog", value: ticketlog },
                            { type: "allowfeedback", value: allowfeedback }
                        ])
                        var ticketscount = 1;
                        const db = getdb("ticketengin")
                        if (db.get(`${interaction.guildId}`)) {
                            var allr = db.get(`${interaction.guildId}`)
                            var ticket = []
                            ticketscount = ticketscount + allr.ticketscount;
                            for (let i = 0; i < allr.tickets.length; i++) {
                                ticket.push(allr.tickets[i])
                            }
                            ticket.push({
                                thema: thema,
                                category: category.id,
                                channel: channel.id,
                                maxupticket: maxupticket,
                                kontakt: kontakt,
                                ticketlog: ticketlog,
                                allowfeedback: allowfeedback
                            })
                            db.set(`${interaction.guildId}`, {
                                ticketscount: ticketscount,
                                tickets: ticket
                            })
                        } else {
                            db.ensure(`${interaction.guildId}`, {
                                ticketscount: 1,
                                tickets: [{
                                    thema: thema,
                                    category: category.id,
                                    channel: channel.id,
                                    maxupticket: maxupticket,
                                    kontakt: kontakt,
                                    ticketlog: ticketlog,
                                    allowfeedback: allowfeedback
                                }]
                            })
                        }
                        const embed = new discord.EmbedBuilder()
                        embed.setTitle('Ticket Support')
                            .setDescription("Um ein Ticket zu öffnen mit dem Unten angegebenen Grund musst du nur unten auf den Knopf (Button) klicken.")
                            .addFields(
                                {
                                    name: "Thema / Grund",
                                    value: thema,
                                    inline: false
                                }
                            )
                            .setThumbnail("attachment://support.png")
                            .setFooter({ text: "/open thema <- Custom Ticket", iconURL: client.user.avatarURL({ dynamics: true }) })
                            .setColor("DarkGreen")

                        const btn = new discord.ButtonBuilder()
                            .setCustomId("open_" + ticketscount)
                            .setEmoji("🎟️")
                            .setStyle(discord.ButtonStyle.Success)
                            .setLabel("Ticket Öffnen")
                        const raw = new discord.ActionRowBuilder()
                            .addComponents(btn)
                        channel.send({ embeds: [embed], components: [raw], files: [support] })

                        if (allowfeedback == 0) { allowfeedback = false }
                        if (ticketlog == 0) { ticketlog = false }

                        interaction.editReply({
                            embeds: [
                                new discord.EmbedBuilder()
                                    .setTitle("🎟 Ticket - Setup ⚙")
                                    .setFooter({ text: "By Planet Zero", iconURL: client.user.avatarURL({}) })
                                    .setDescription("Das Ticketsystem wurde erfolgreich eingerichtet!\n❗ Wichtige Daten ❗:")
                                    .addFields(
                                        {
                                            name: "Thema / Grund",
                                            value: thema,
                                            inline: false
                                        }, {
                                        name: "Categorie Channel",
                                        value: "<#" + category.id + ">",
                                        inline: false
                                    }, {
                                        name: "Ticket Panel Channel",
                                        value: "<#" + channel.id + ">",
                                        inline: false
                                    }, {
                                        name: "Maximale Tickets Pro Nutzer",
                                        value: "" + maxupticket,
                                        inline: false
                                    }, {
                                        name: "Kontakt beim Schließen",
                                        value: kontakt ? "Ja" : "Nein",
                                        inline: false
                                    }, {
                                        name: "Ticketlog",
                                        value: ticketlog ? "<#" + ticketlog + ">" : "Deaktiviert",
                                        inline: false
                                    }, {
                                        name: "Feedback",
                                        value: allowfeedback ? "<#" + ticketlog + ">" : "Deaktiviert",
                                        inline: false
                                    }
                                    )
                            ], ephemeral: true
                        })
                    } catch (e) {
                        consoledata.log(JSON.stringify(e))
                    }
                    break;

                case "":
                    break;
            }

        }
        if (interaction.isButton()) {
            if (interaction.customId.startsWith("open_")) {
                var opn = interaction.customId.replace("open_", "").toString()
                opn = opn - 1;
                var db = getdb("ticketengin")
                if (!db.get(`${interaction.guildId}`) || !db.get(`${interaction.guildId}`).tickets) {
                    return interaction.reply({
                        embeds: [
                            new discord.EmbedBuilder()
                                .setTitle("Error 401")
                                .setDescription("Bitte Melde dich im [Support](https://discord.gg/vbtxpv47w7)")
                                .addFields({
                                    name: "Fehler",
                                    value: db.get(`${interaction.guildId}`) ? "Unknown Tickets" : "Unknown Guild",
                                    inline: true
                                }, {
                                    name: "Daten",
                                    value: "Open - " + opn + ", G - " + interaction.guildId,
                                    inline: true
                                })
                                .setThumbnail("attachment://error.png")

                        ],
                        ephemeral: true,
                        files: [error]
                    })
                }
                var data = db.get(`${interaction.guildId}`).tickets[opn]
                consoledata.log(JSON.stringify(data))
                createticket(data.thema, data.category, interaction.user, rname, ndata, interaction.guild).send()
            }
        }
    })
    /**
     * 
     * @param {*} tname Ticket Thema
     * @param {*} tcat Ticket Categorie
     * @param {discord.User} tuser Ticket Ersteller
     * @param {*} rdata Ticket Rollen Daten 
     * @param {*} ndata fs => Ticketnamestring
     * @param {discord.Guild} g guild
     * @returns {discord.Channel}
     */
    function createticket(tname, tcat, tuser, rdata, ndata, g) {
        if (!tname) return new TypeError("Kein Ticket Name angegeben")
        if (!tcat) return new TypeError("Kein Ticket Categorie angegeben")
        if (!tuser) return new TypeError("Kein Ticket Ersteller angegeben")
        if (!rdata) return new TypeError("Kein Rollen Daten angegeben")
        if (!ndata) return new TypeError("Kein Namen Daten angegeben")
        if (!g) return new TypeError("Keine Guild angegeben")

        const id = (Math.floor(Math.random() * 9999999999) + 1000000000).toString(16);

        if (ndata.fs.includes("?thema?")) {
            ndata.fs.replace("?thema?", tname)
        }
        if (ndata.fs.includes("?id?")) {
            ndata.fs.replace("?id?", id)
        }
        if (ndata.fs.includes("?uname?")) {
            ndata.fs.replace("?uname?", tuser.username)
        }

        g.channels.create(`🟡-` + ndata.fs, {
            type: discord.ChannelType.GuildText,
            topic: "Ticket von " + tuser.username + " mit dem Thema **" + tname + "**",
            parent: tcat,
            _permissionOverwrites: [
                {
                    id: g.roles.everyone,
                    deny: [discord.PermissionFlagsBits.ViewChannel]
                }, {
                    id: tuser.id,
                    allow: [discord.PermissionFlagsBits.ViewChannel, discord.PermissionFlagsBits.SendMessages, discord.PermissionFlagsBits.EmbedLinks, discord.PermissionFlagsBits.AttachFiles, discord.PermissionFlagsBits.ReadMessageHistory, discord.PermissionFlagsBits.UseApplicationCommands]
                },{
                    id: g.roles.cache.get(rdata.support).id,
                    allow:[discord.PermissionFlagsBits.ViewChannel, discord.PermissionFlagsBits.SendMessages, discord.PermissionFlagsBits.EmbedLinks, discord.PermissionFlagsBits.AttachFiles, discord.PermissionFlagsBits.ReadMessageHistory, discord.PermissionFlagsBits.UseApplicationCommands, discord.PermissionFlagsBits.ManageMessages, discord.PermissionFlagsBits.MentionEveryone]
                },{
                    id: g.roles.cache.get(rdata.admin).id,
                    allow:[discord.PermissionFlagsBits.ViewChannel, discord.PermissionFlagsBits.SendMessages, discord.PermissionFlagsBits.EmbedLinks, discord.PermissionFlagsBits.AttachFiles, discord.PermissionFlagsBits.ReadMessageHistory, discord.PermissionFlagsBits.UseApplicationCommands, discord.PermissionFlagsBits.ManageMessages, discord.PermissionFlagsBits.MentionEveryone, discord.PermissionFlagsBits.ManageChannels]
                },{
                    id: g.roles.cache.get(rdata.support).id,
                    allow:[discord.PermissionFlagsBits.ViewChannel, discord.PermissionFlagsBits.SendMessages, discord.PermissionFlagsBits.EmbedLinks, discord.PermissionFlagsBits.AttachFiles, discord.PermissionFlagsBits.ReadMessageHistory, discord.PermissionFlagsBits.ManageMessages, discord.PermissionFlagsBits.MentionEveryone, discord.PermissionFlagsBits.ManageChannels]
                }
            ],
            get permissionOverwrites() {
                return this._permissionOverwrites;
            },
            set permissionOverwrites(value) {
                this._permissionOverwrites = value;
            },
        })
    }
}
