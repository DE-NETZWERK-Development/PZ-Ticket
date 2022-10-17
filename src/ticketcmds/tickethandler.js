const discord = require('discord.js');
const discordTranscripts = require('discord-html-transcripts');

/**
 * 
 * @param {discord.Client} client 
 * @param {object} consoledata
 * @param {object} rname
 * @param {object} nsdata
 * @param {function getname(name) {return enmap.default}} getdb
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

module.exports.run = (client, consoledata, getdb, rname, nsdata) => {
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
                                        value: allowfeedback ? "<#" + allowfeedback + ">" : "Deaktiviert",
                                        inline: false
                                    }
                                    )
                            ], ephemeral: true
                        })
                    } catch (e) {
                        consoledata.log(JSON.stringify(e))
                    }
                    break;

                case "ticketclose":
                    var reason = interaction.options.getString("grund");
                    if (!reason) { reason = [true, "Kein Grund Angegeben"] } else { reason = [true, reason] }
                    interaction.reply({ content: "Ticket wird geschlossen", ephemeral: true })
                    var t;
                    var tdb = getdb(`tickets`)
                    tdb.indexes.forEach(td => {
                        if (tdb.get(`${td}`).channelid == interaction.channelId) {
                            t = td;
                        }
                    })

                    if (t == undefined) return interaction.editReply({ content: `Du bist nicht in einem Ticket!`, ephemeral: true })

                    if (getdb(`tickets`).get(`${t}`).claimed == false) {
                        tdb.set(`${t}`, "Support Team", "claimed")
                    }
                    var tuser = client.users.cache.get(tdb.get(`${t}`).owner)

                    var udb = getdb(`member`)
                    var user = udb.get(`${interaction.guildId}-${tuser.id}`)
                    for (const key in user.ticketopn) {
                        if (user.ticketopn[key].opn == opn) {
                            user.ticketopn[key].o = user.ticketopn[key].o - 1;
                            udb.set(`${interaction.guildId}-${tuser.id}`, user)
                        }
                    }

                    tdb.set(`${t}`, reason, "closed")
                    var dclose = true
                    const kontembed = new discord.EmbedBuilder()
                    const feedembed = new discord.EmbedBuilder()
                    if (getdb(`ticketengin`).get(`${interaction.guildId}`).tickets[tdb.get(`${t}`).opn].kontakt != false) {
                        kontembed
                            .setTitle("🎟 Ticket Geschlossen 🎟")
                            .setDescription("Hallo <@" + tuser.id + ">\nDein Ticket auf " + interaction.guild.name + " wurde geschlossen.")
                            .setColor("Aqua")
                            .setFooter({ text: "By Planet Zero" })


                        if (reason[1] != "Kein Grund Angegeben") { kontembed.addFields({ name: "Grund", value: "" + reason[1] }) }
                        if (getdb(`ticketengin`).get(`${interaction.guildId}`).tickets[tdb.get(`${t}`).opn].allowfeedback != 0) { kontembed.addFields({ name: "Feedback", value: "Bitte gebe dein Feedback in <#" + interaction.channelId + "> ab :)" }) }
                        try {
                            (await tuser.createDM(true)).send({ embeds: [kontembed] })
                        } catch (e) { }
                    }
                    if (getdb(`ticketengin`).get(`${interaction.guildId}`).tickets[tdb.get(`${t}`).opn].allowfeedback != 0) {
                        dclose = false;
                        feedembed
                            .setTitle('🎟 Ticket Close 🎟')
                            .setDescription('Hiermit wurde das Ticket von unserem Support Team beendet.\nSie können ihr Ticket nun mit den Beiden Buttons unter dieser Nachricht schließen.\nButton Beschreibung\n\n``🎟 Feedback`` -> Gebe dem Teammitglied welches ihr Ticket bearbeitet hat eine Rückmeldung.\n``❌ Schließen`` -> Schließt das Ticket ohne das eine Feedback für das Team abgegeben wird.')
                            .setFooter({ text: "GL | Tickets", iconURL: client.user.avatarURL() })
                        if (reason[2] != "Kein Grund Angegeben") { feedembed.addFields({ name: "Grund", value: "" + reason[1] }) }
                        interaction.channel.send({
                            embeds: [feedembed], components: [
                                new discord.ActionRowBuilder()
                                    .addComponents(
                                        new discord.ButtonBuilder()
                                            .setCustomId("btn-close-feedback-" + getdb(`tickets`).get(`${t}`).claimed)
                                            .setStyle(discord.ButtonStyle.Success)
                                            .setLabel('Feedback')
                                            .setEmoji('🎟'),
                                        new discord.ButtonBuilder()
                                            .setCustomId("btn-close-without-feedback")
                                            .setStyle(discord.ButtonStyle.Danger)
                                            .setLabel('Close')
                                            .setEmoji('❌')
                                    )]
                        })
                    }
                    if (getdb(`ticketengin`).get(`${interaction.guildId}`).tickets[tdb.get(`${t}`).opn].ticketlog != 0) {
                        client.channels.cache.get(getdb(`ticketengin`).get(`${interaction.guildId}`).tickets[tdb.get(`${t}`).opn].ticketlog).send({
                            files: [await discordTranscripts.createTranscript(interaction.channel, { filename: `${interaction.channel.name}.html`, saveImages: true })]
                        })
                    }
                    interaction.channel.permissionOverwrites.set([
                        {
                            id: interaction.guild.roles.everyone,
                            deny: [discord.PermissionFlagsBits.ViewChannel]
                        }, {
                            id: tuser.id,
                            allow: [discord.PermissionFlagsBits.ViewChannel, discord.PermissionFlagsBits.EmbedLinks, discord.PermissionFlagsBits.AttachFiles, discord.PermissionFlagsBits.ReadMessageHistory, discord.PermissionFlagsBits.UseApplicationCommands]
                        }, {
                            id: interaction.guild.roles.cache.find(r => r.name == rname.support).id,
                            allow: [discord.PermissionFlagsBits.ViewChannel, discord.PermissionFlagsBits.EmbedLinks, discord.PermissionFlagsBits.AttachFiles, discord.PermissionFlagsBits.ReadMessageHistory, discord.PermissionFlagsBits.UseApplicationCommands, discord.PermissionFlagsBits.ManageMessages, discord.PermissionFlagsBits.MentionEveryone]
                        }, {
                            id: interaction.guild.roles.cache.find(r => r.name == rname.admin).id,
                            allow: [discord.PermissionFlagsBits.ViewChannel, discord.PermissionFlagsBits.EmbedLinks, discord.PermissionFlagsBits.AttachFiles, discord.PermissionFlagsBits.ReadMessageHistory, discord.PermissionFlagsBits.UseApplicationCommands, discord.PermissionFlagsBits.ManageMessages, discord.PermissionFlagsBits.MentionEveryone, discord.PermissionFlagsBits.ManageChannels]
                        }, {
                            id: tuser.id,
                            deny: [discord.PermissionFlagsBits.SendMessages]
                        }, {
                            id: interaction.guild.roles.cache.find(r => r.name == rname.support).id,
                            deny: [discord.PermissionFlagsBits.SendMessages]
                        }, {
                            id: interaction.guild.roles.cache.find(r => r.name == rname.admin).id,
                            deny: [discord.PermissionFlagsBits.SendMessages]
                        }
                    ])
                    if (dclose == true) {
                        setTimeout(() => {
                            interaction.channel.delete({ reason: "Ticket Geschlossen" })
                        }, 10000)
                    }
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

                /*
                !-----------------------------------------------------------------!
                TODO: Prüfen ob ein Nutzer bestimmte anzahl an Tickets geöffnet hat
                !-----------------------------------------------------------------!
                */

                var udb = getdb(`member`)
                var user = udb.get(`${interaction.guildId}-${interaction.user.id}`)
                if (!user) {
                    udb.set(`${interaction.guildId}-${interaction.user.id}`, {
                        ticketopn: [
                            { o: 1, opn: opn }
                        ]
                    })
                    return createticket(data.thema, data.category, interaction.user, rname, nsdata, interaction.guild, interaction, opn)
                }
                var isin = false;
                for (const key in user.ticketopn) {
                    if (user.ticketopn[key].opn == opn) {
                        isin = true;
                        if (user.ticketopn[key].o == data.maxupticket) {
                            return interaction.reply({ content: "Du hast bereits zu viele Tickets zu dem Thema offen", ephemeral: true })
                        }
                        user.ticketopn[key].o = user.ticketopn[key].o + 1;
                        udb.set(`${interaction.guildId}-${interaction.user.id}`, user)
                        return createticket(data.thema, data.category, interaction.user, rname, nsdata, interaction.guild, interaction, opn)
                    }
                }
                if (isin == false) {
                    user.ticketopn.push({ o: 1, opn: opn })
                    udb.set(`${interaction.guildId}-${interaction.user.id}`, user)
                    return createticket(data.thema, data.category, interaction.user, rname, nsdata, interaction.guild, interaction, opn)
                }
            }
            if (interaction.customId.startsWith("claim-")) {
                const ticketid = interaction.customId.replace("claim-", "")
                const ticket = getdb(`tickets`).get(`${ticketid}`)

                if (ticket.claimed == false) {
                    if (!interaction.member.roles.cache.has(interaction.guild.roles.cache.find(r => r.name == rname.support).id)) {
                        return interaction.reply({ content: "Du bist nicht dazu berechtigt" })
                    }

                }
            }
            if (interaction.customId.startsWith("btn-close-feedback-")) {
                var bearbeiter = interaction.customId.replace("btn-close-feedback-", "")
                if (bearbeiter != "Support Team") {
                    bearbeiter = client.users.cache.get(bearbeiter).tag
                }
                const modal = new discord.ModalBuilder()
                    .setCustomId("feedback-" + bearbeiter)
                    .setTitle(bearbeiter + ' | Feedback')
                    .addComponents(
                        new discord.ActionRowBuilder()
                            .addComponents(
                                new discord.TextInputBuilder()
                                    .setStyle(discord.TextInputStyle.Short)
                                    .setMinLength(1)
                                    .setMaxLength(2)
                                    .setRequired(true)
                                    .setPlaceholder('1')
                                    .setCustomId("bewertung-by-number")
                                    .setLabel("Skala von 1-10 (10 = Beste)")
                            ),
                        new discord.ActionRowBuilder()
                            .addComponents(
                                new discord.TextInputBuilder()
                                    .setStyle(discord.TextInputStyle.Paragraph)
                                    .setMinLength(20)
                                    .setMaxLength(2000)
                                    .setRequired(true)
                                    .setPlaceholder('Deine Bewertung')
                                    .setCustomId("bewertung-by-message")
                                    .setLabel("Bewertung (gut? schlecht? warum?)")
                            )
                    )

                interaction.showModal(modal)
            }
            if (interaction.customId.startsWith("btn-close-without-feedback")) {
                interaction.reply({ content: "Dein Ticket wird in 5 Sekunden geschlossen!" })
                setTimeout(() => {
                    interaction.channel.delete()
                }, 5000)
            }
        }
        if (interaction.isModalSubmit()) {
            if (interaction.customId.startsWith("feedback-")) {
                const nb = interaction.components[0].components[0].value;
                const ms = interaction.components[1].components[0].value;
                const bb = interaction.customId.replace("feedback-", "")

                const embed = new discord.EmbedBuilder()
                    .setTitle(bb + ' | Feedback')
                    .addFields({ name: 'Bewertung auf einer Skala von 1 bis 10', value: nb + "" }, { name: 'Bewertung Message', value: ms + "" })
                    .setFooter({ text: "By Planet Zero" })

                const tengin = getdb(`ticketengin`).get(`${interaction.guildId}`)
                var t;
                var tdb = getdb(`tickets`)
                tdb.indexes.forEach(td => {
                    if (tdb.get(`${td}`).channelid = interaction.channelId) {
                        t = td;
                    }
                })
                interaction.guild.channels.cache.get(`${tengin.tickets[tdb.get(`${t}`).opn].allowfeedback}`).send({embeds:[embed]})

                interaction.reply({ content: 'Danke für den Feedback\nDein Ticket wird in 5 Sekunden geschlossen!' });
                setTimeout(() => {
                    interaction.channel.delete()
                }, 5000)
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
     */
    async function createticket(tname, tcat, tuser, rdata, ndata, g, i, opn) {
        if (!tname) return new TypeError("Kein Ticket Name angegeben")
        if (!tcat) return new TypeError("Kein Ticket Categorie angegeben")
        if (!tuser) return new TypeError("Kein Ticket Ersteller angegeben")
        if (!rdata) return new TypeError("Kein Rollen Daten angegeben")
        if (!ndata) return new TypeError("Kein Namen Daten angegeben")
        if (!g) return new TypeError("Keine Guild angegeben")
        var lndata = { fs: ndata.fs }
        const id = (Math.floor(Math.random() * 9999999999) + 1000000000).toString(16);

        if (ndata.fs.includes("?thema?")) {
            lndata.fs = lndata.fs.replace("?thema?", tname)
        }
        if (ndata.fs.includes("?id?")) {
            lndata.fs = lndata.fs.replace("?id?", id)
        }
        if (ndata.fs.includes("?uname?")) {
            lndata.fs = lndata.fs.replace("?uname?", tuser.username)
        }

        g.channels.create({
            name: `🟡-` + lndata.fs,
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
                }, {
                    id: g.roles.cache.find(r => r.name == rdata.support).id,
                    allow: [discord.PermissionFlagsBits.ViewChannel, discord.PermissionFlagsBits.SendMessages, discord.PermissionFlagsBits.EmbedLinks, discord.PermissionFlagsBits.AttachFiles, discord.PermissionFlagsBits.ReadMessageHistory, discord.PermissionFlagsBits.UseApplicationCommands, discord.PermissionFlagsBits.ManageMessages, discord.PermissionFlagsBits.MentionEveryone]
                }, {
                    id: g.roles.cache.find(r => r.name == rdata.admin).id,
                    allow: [discord.PermissionFlagsBits.ViewChannel, discord.PermissionFlagsBits.SendMessages, discord.PermissionFlagsBits.EmbedLinks, discord.PermissionFlagsBits.AttachFiles, discord.PermissionFlagsBits.ReadMessageHistory, discord.PermissionFlagsBits.UseApplicationCommands, discord.PermissionFlagsBits.ManageMessages, discord.PermissionFlagsBits.MentionEveryone, discord.PermissionFlagsBits.ManageChannels]
                }, {
                    id: client.user.id,
                    allow: [discord.PermissionFlagsBits.ViewChannel, discord.PermissionFlagsBits.SendMessages, discord.PermissionFlagsBits.EmbedLinks, discord.PermissionFlagsBits.AttachFiles, discord.PermissionFlagsBits.ReadMessageHistory, discord.PermissionFlagsBits.ManageMessages, discord.PermissionFlagsBits.MentionEveryone, discord.PermissionFlagsBits.ManageChannels]
                }
            ],
            get permissionOverwrites() {
                return this._permissionOverwrites;
            },
            set permissionOverwrites(value) {
                this._permissionOverwrites = value;
            },
        }).then(async c => {
            getdb(`tickets`).set(`${id}`, {
                owner: tuser.id,
                thema: tname,
                claimed: false,
                channelid: c.id,
                closed: false,
                guild: g.id,
                opn: opn
            })
            const embeddata = new discord.EmbedBuilder()
                .setTitle('🎟 Ticket 🎟')
                .setDescription('Hallo <@' + tuser.id + ">\nBitte habe etwas Gedult bis sich ein Supporter bei dir meldet. Daweile kannst du gerne schon einmal ein Problem hier Beschrieben.")
                .addFields({ name: "Thema:", value: tname })
                .setFooter({ text: "Ticket kann über die Slashcommands bearbeitet werden" })

            const raw = new discord.ActionRowBuilder()
                .addComponents(
                    new discord.ButtonBuilder()
                        .setStyle(discord.ButtonStyle.Danger)
                        .setLabel("Ticket Claimen")
                        .setCustomId("claim-" + id)
                )
            const editmessage = await c.send({ content: "<@&" + g.roles.cache.find(r => r.name == rdata.support).id + ">" })
            editmessage.edit({ content: " ", embeds: [embeddata], components: [raw] })
            i.reply({ content: "Dein Ticket wurde erstellt, schau mal in <#" + c.id + "> vorbei um deine Anliegen geklärt zu bekommen", ephemeral: true })
            return;
        })
    }
}
