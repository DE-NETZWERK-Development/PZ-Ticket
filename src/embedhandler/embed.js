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
 * 
 * @return {discord.EmbedBuilder} 
 */

module.exports.run = (type, data) => {

    if (type == "reportids") {
        if(!data.title) data.title = emddata.reports.title
        if(!data.color) data.color = emddata.reports.color
        if(!data.footer) data.title = emddata.reports.footer
        if (data.reports.tar == false) {
            if(!data.fields) data.fields = emddata.reports.fields.nreports
            /**
             * TODO: Author -> if ! not in embed
             * TODO: Image -> if ! not in embed
             * TODO: Thumbnaul -> if ! not in embed
             */
        }
        if(!data.fields) data.fields = emddata.reports.fields
        if(!data.description) data.description = emddata.reports.description
    }
}
