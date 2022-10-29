const discord = require('discord.js')
const emddata = require('./embed.json')

/**
 * Alle Angegebenen Daten werden aus der datei ./embeddata.json ausgelesen, sollten die daten geändert werden
 * 
 * @param {string} type Kann sein: "reportids", 
 * @param {object} data Die daten die geändert werden müssen oder daten die verwendet werden sollen
 * 
 * @param {string} data.title Der Title der Embed
 * @param {discord.EmbedField} data.fields Die Felder der Embed
 * @param {discord.EmbedAuthorOptions} data.author Die Autor Daten
 * @param {discord.EmbedFooterOptions} data.footer Die Footer Daten
 * @param {String} data.description Die Embed Beschreibung
 * @param {discord.ColorResolvable} data.color Die Embed Farbe
 * @param {discord.APIEmbedImage} data.image Das Embed Bild
 * @param {discord.APIEmbedThumbnail} data.thumbnail Das Embed Thumbnail
 * @param {object} data.reports Die Report Daten
 * 
 * @param {boolean} data.reports.tar If Reports founded
 * @param {Array} data.reports.rids Die Report daten
 * 
 * @return {discord.Embed} 
 */

module.exports.embedh = async (type, data) => {

    if (type == "reportids") {
        if (!data.title) data.title = emddata.reports.title
        if (!data.color) data.color = emddata.reports.color
        if (!data.footer) data.footer = emddata.reports.footer
        console.log(data)
        if (data.reports.tar == false) {
            if (!data.fields) data.fields = emddata.reports.fields.nreports

            const embed = new discord.EmbedBuilder()
                .setTitle(data.title)
                .setColor(data.color)
                .setFooter(data.footer)
                .setFields(data.fields)
            if (!data.author) { } else { embed.setAuthor(data.author) }
            if (!data.image) { } else { embed.setImage(data.image) }
            if (!data.thumbnail) { } else { embed.setThumbnail(data.thumbnail) }
            return embed
        }

        if (data.reports.rids.length == 0) {
            return interaction.reply({ embeds: [await this.embedh("reportids", { reports: { tar: false } })] })
        }

        var rids = "";
        for (let i = 0; i < data.reports.rids.length; i++) {
            var t = rids;
            rids = rids + data.reports.rids[i] + "\n"
            if (rids >= 4000) {
                rids = t
            }
        }

        if (!data.description) data.description = emddata.reports.description
        if (!data.fields) data.fields = emddata.reports.fields.reports

        if (data.description.includes("${rids}")) data.description = data.description.replace("${rids}", rids)
        if (data.fields.value.includes("${rlength}")) data.fields.value = data.fields.value.replace("${rlength}", data.reports.rids.length)

        const embed = new discord.EmbedBuilder()
            .setTitle(data.title)
            .setColor(data.color)
            .setFooter(data.footer)
            .setFields(data.fields)
            .setDescription(data.description)
        if (!data.author) { } else { embed.setAuthor(data.author) }
        if (!data.image) { } else { embed.setImage(data.image) }
        if (!data.thumbnail) { } else { embed.setThumbnail(data.thumbnail) }

        return embed;
    }
}
