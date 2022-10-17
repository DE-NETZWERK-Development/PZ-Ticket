const discord = require('discord.js');
const { ClientPresenceStatus } = require('discord.js')
var consoleInteraface = require('discord.js-console');
const manager = require('./src/manager')

module.exports.ticketsystem = class {

    /**
     * Das Ticketsystem
     * 
     * @param {discord.Client} client Client für den bot
     * @param {object} options
     * 
     * @param {boolean} options.customconsole
     * @param {boolean} options.logging_in_discord
     * @param {discord.GuildChannel.ID} options.discord_logging_channel
     * @param {object} options.status
     * @param {Boolean} options.inviteable Standart ist false
     * @param {String} options.adminrolename
     * @param {String} options.supporterrolename
     * @param {object} options.credits
     * 
     * @param {boolean} options.ticket
     * @param {boolean} options.modmail
     * @param {boolean} options.voice
     * 
     * @param {object} options.ticketsettings
     * @param {object} options.modmailsettings
     * @param {object} options.voicesettings
     * 
     * @param {string} options.ticketsettings.ticketname Um Strings Abzufangen: ?uname? -> Username im ticketname | ?id?    -> Ticketid im ticketname | ?thema? -> Ticketthema im ticketname | -> Ticketname spiegelt den namen des Ticketchannels wieder
     * 
     * @param {String} options.status.name
     * @param {ClientPresenceStatus} options.status.type
     * @param {Boolean} options.status.afk
     * @param {object} options.status.activities
     * 
     * @param {boolean} options.credits.enable
     * @param {object} options.credits.custom
     * 
     * @param {String} optionen.credits.custom.author
     * @param {String} optionen.credits.custom.version
     * @param {String} optionen.credits.custom.supportserver
     * 
     * @param {Number} options.status.activities.type Playing {game} = 0 | Streaming {details} = 1 | Listening to {name} = 2 | Watching {details} = 3 | Competing in {name} = 5
     * @param {URL} options.status.activities.url
     * 
     */

    constructor(client, options) {
        if (!client) { throw new TypeError("Fehlender discord.js client!") } else { this.client = client }
        if (!options) { throw new TypeError("Keine Optionen angegeben! Fehlende Optionen: status, credits, adminrolename, supporterrolename") } { this.options = options }
        if (!options.status) { throw new TypeError("Keine Status Optionen angegeben") }
        if (!options.status.name) { throw new TypeError("Keinen Status Namen angegeben") }
        if (!options.status.type) { throw new TypeError("Keinen Status Type ('online', 'idle', 'dnd') angegeben") }
        if (!options.status.activities) { throw new TypeError("Keinen Activitie Daten angegeben") }
        if (!options.adminrolename) { throw new TypeError("Keinen adminrolename angegeben") }
        if (!options.supporterrolename) { throw new TypeError("Keinen supporterrolename angegeben") }
        if (!options.credits) { throw new TypeError("keine credits optionen angegeben") }
        if (!options.ticket && !options.modmail && !options.voice) { throw new TypeError("Es muss mind. ein Argument (ticket, modmail, voice) definiert werden in den Optionen") }
        if (options.ticket == false && options.modmail == false && options.voice == false) { throw new TypeError("Es muss mind. ein Argument (ticket, modmail, voice) aktiviert werden") }
        if (!options.status.activities.type && options.status.activities.type != 0 && options.status.activities.type != 1 && options.status.activities.type != 2 && options.status.activities.type != 3 && options.status.activities.type != 5) { throw new Error("Keinen Activity Type angegeben") }
        if (!options.inviteable) { options.inviteable = true }
        if (!options.credits.custom) { options.credits.custom = manager.credits }
        if (!options.credits.custom.author) { options.credits.custom.author = manager.credits.author }
        if (!options.credits.custom.version) { options.credits.custom.author = manager.credits.version }
        if (!options.credits.custom.supportserver) { options.credits.custom.author = manager.credits.supportserver }
        if (!options.ticket) { options.ticket = false }
        if (!options.modmail) { options.modmail = false }
        if (!options.voice) { options.voice = false }
        if( options.ticket == true && (!options.ticketsettings || !options.ticketsettings.ticketname)) { throw new TypeError("Keine Ticketsettings angegeben") }
        if( options.modmail == true && !options.modmailsettings) { throw new TypeError("Keine Modmailsettings angegeben") }
        if( options.voice == true && !options.voicesettings) { throw new TypeError("Keine Voicesettings angegeben") }


        logClear()
        logInfo("Ticketsystem Startet")

        if (!options.status.afk) { options.status.afk = false }

        client.on('error', e => { logError(e/* + "\n" + e.stack + "\n\n"*/, "Fehler lässt den Bot nicht abstürzen!") })

        client.on('warn', w => { logWarning(w) })

        client.setMaxListeners(0)

        manager.invitemanager(client, options.inviteable, logInfo)

        manager.startengin({ ticket: options.ticket, modmail: options.modmail, voice: options.voice }, client, { log: log, Error: logError, Warning: logWarning, Operation: logOperation, Status: logStatus, Clear: logClear, Table: logTable, Info: logInfo }, { admin: options.adminrolename, support: options.supporterrolename }, { fs: options.ticketsettings.ticketname })

        client.on('ready', async () => {

            const guilds = await client.guilds.cache.map(g => g)

            for (let i = 0; i < guilds.length; i++) {
                const g = guilds[i]
                const roles = g.roles.cache.map(r => r.name)
                if (roles.includes(options.adminrolename)) { } else {
                    g.roles.create({ name: options.adminrolename, reason: "Für das Ticketsystem! NICHT LÖSCHEN" })
                }
                if (roles.includes(options.supporterrolename)) { } else {
                    g.roles.create({ name: options.supporterrolename, reason: "Für das Ticketsystem! NICHT LÖSCHEN" })
                }
                manager.createGuild(g)
            }


            this.updatestatus(options.status)
            logStatus("ONLINE", "Status System")
        })

        //functions
        /**
             * Logge eine einfache Nachricht
             * @param {string} message Nachricht
             * 
             * @example log("Moin")
            */
        function log(message) {
            if (!options.customconsole) {
                return new consoleInteraface.console(false, 0, false, false, 0).log(message)
            }
            return new consoleInteraface.console(options.logging_in_discord, options.discord_logging_channel, true, true, client).log(message)

        }
        /**
         * Logge einen Fehler
         * @param {string} code Fehlercode
         * @param {string} message Nachricht dazu
         * 
         * @exaple logError(error, "Alles Ok")
         */
        function logError(code, message) {
            if (!options.customconsole) {
                return new consoleInteraface.console(false, 0, false, false, 0).logError(code, message)
            }
            return new consoleInteraface.console(options.logging_in_discord, options.discord_logging_channel, true, true, client).logError(code, message)

        }
        /**
         * Logge eine Warnung
         * @param {string} message Warnung
         * 
         * @example logWarning("Moin")
        */
        function logWarning(message) {
            if (!options.customconsole) {
                return new consoleInteraface.console(false, 0, false, false, 0).logWarning(message)
            }
            return new consoleInteraface.console(options.logging_in_discord, options.discord_logging_channel, true, true, client).logWarning(message)
        }
        /**
         * Logge eine Operation
         * @param {string} type Operationstyp
         * @param {string} status Status der Operation, z.B. STILL, COMPLEATE, ERROR
         * @param {string} message Operationsnachricht
         * 
         * @example logOperation("Login","COMLPLEATE","erfolgreich")
         */
        function logOperation(type, status, message) {
            if (!options.customconsole) {
                return new consoleInteraface.console(false, 0, false, false, 0).logOperation(type, status, message)
            }
            return new consoleInteraface.console(options.logging_in_discord, options.discord_logging_channel, true, true, client).logOperation(type, status, message)
        }
        /**
         * Logge einen Status
         * @param {string} status der Status
         * @param {string} message Nachricht zum Status
         * 
         * @example logStatus("Online", "System erfolgreich gestartet")
         */
        function logStatus(status, message) {
            if (!options.customconsole) {
                return new consoleInteraface.console(false, 0, false, false, 0).logStatus(status, message)
            }
            return new consoleInteraface.console(options.logging_in_discord, options.discord_logging_channel, true, true, client).logStatus(status, message)

        }
        /**
         * Leere die Console
         * 
         * @example logclear()
         */
        function logClear() {
            if (!options.customconsole) {
                return new consoleInteraface.console(false, 0, false, false, 0).logClear()
            }
            return new consoleInteraface.console(options.logging_in_discord, options.discord_logging_channel, true, true, client).logClear()

        }
        /**
         * Stelle daten in der Console in einer Tabelle dar
         * @param {Array} input Array der Daten die in der Tabelle angezeigt werden sollen
         * @param {Array} properties Welche Argumente sollen angezeigt werden - Weck lassen oder leres Array lässt alles anzeigen - Index ausgeschlossen!
         * @param {boolean} index Wenn true wird die Spalte (index) nicht angezeigt
         * 
         * @example logTable([{ a: 1, b: 'Y' }, { a: 'Z', b: 2 }], [], false)
         * @example logTable([{ a: 1, b: 'Y' }, { a: 'Z', b: 2 }], ["a"], false)
         * @example logTable([{ a: 1, b: 'Y' }, { a: 'Z', b: 2 }], ["a"], true)
         */
        function logTable(input, properties, index) {
            if (!options.customconsole) {
                return new consoleInteraface.console(false, 0, false, false, 0).logTable(input, properties, index)
            }
            return new consoleInteraface.console(options.logging_in_discord, options.discord_logging_channel, true, true, client).logTable(input, properties, index)
        }
        /**
         * Logge eine Info
         * @param {String} message Nachricht
         * 
         * @example logInfo("Test")
         */
        function logInfo(message) {
            if (!options.customconsole) {
                return new consoleInteraface.console(false, 0, false, false, 0).logInfo(message)
            }
            return new consoleInteraface.console(options.logging_in_discord, options.discord_logging_channel, true, true, client).logInfo(message)
        }
    }

    /**
     * Update den Bot Status
     * @param {object} status
     * 
     * @param {String} status.name 
     * Um Strings Abzufangen:
     *      "?botname?" - Gibt den namen des Bots aus
     * 
     * @param {ClientPresenceStatus} status.type
     * @param {Boolean} status.afk
     * @param {object} status.activities
     * 
     * @param {Number} status.activities.type Playing {game} = 0 | Streaming {details} = 1 | Listening to {name} = 2 | Watching {details} = 3 | Competing in {name} = 5
     * @param {URL} status.activities.url
     */

    updatestatus(status) {

        if (!status) { throw new TypeError("Keine Status angaben gefunden!") }
        if (!status.name) { throw new TypeError("Keinen Status Namen angegeben") }
        if (!status.type) { throw new TypeError("Keinen Status Type ('online', 'idle', 'dnd') angegeben") }
        if (!status.activities) { throw new TypeError("Keinen Activitie Daten angegeben") }
        if (!status.activities.type && status.activities.type != 0 && status.activities.type != 1 && status.activities.type != 2 && status.activities.type != 3 && status.activities.type != 5) { throw new Error("Keinen Activity Type angegeben") }

        if (status.name.includes("?botname?")) {
            status.name.replace("?botname?", this.client.user.username)
        }
        this.logOperation("Bot Status", "UPDATE", "start")

        this.client.on('ready', () => {
            this.client.user.setPresence({
                afk: status.afk,
                status: status.type,
            })

            if (!status.activities.url) {
                this.client.user.setPresence({
                    status:status.type,
                    afk:status.afk,
                    activities:{
                        name:status.name,
                        type: status.activities.type
                    }
                })
            } else {
                this.client.user.setPresence({
                    status:status.type,
                    afk:status.afk,
                    activities:{
                        name:status.name,
                        type: status.activities.type,
                        url:status.activities.url
                    }
                })
            }
            this.logOperation("Bot Status", "UPDATE", "finished")
        })

        setTimeout(() => {this.updatestatus(status)},60000)

    }





    /**
     * Logge eine einfache Nachricht
     * @param {string} message Nachricht
     * 
     * @example log("Moin")
    */
    log(message) {
        if (!this.options.customconsole) {
            return new consoleInteraface.console(false, 0, false, false, 0).log(message)
        }
        return new consoleInteraface.console(this.options.logging_in_discord, this.options.discord_logging_channel, true, true, this.client).log(message)

    }
    /**
     * Logge einen Fehler
     * @param {string} code Fehlercode
     * @param {string} message Nachricht dazu
     * 
     * @exaple logError(error, "Alles Ok")
     */
    logError(code, message) {
        if (!this.options.customconsole) {
            return new consoleInteraface.console(false, 0, false, false, 0).logError(code, message)
        }
        return new consoleInteraface.console(this.options.logging_in_discord, this.options.discord_logging_channel, true, true, this.client).logError(code, message)

    }
    /**
     * Logge eine Warnung
     * @param {string} message Warnung
     * 
     * @example logWarning("Moin")
    */
    logWarning(message) {
        if (!this.options.customconsole) {
            return new consoleInteraface.console(false, 0, false, false, 0).logWarning(message)
        }
        return new consoleInteraface.console(this.options.logging_in_discord, this.options.discord_logging_channel, true, true, this.client).logWarning(message)
    }
    /**
     * Logge eine Operation
     * @param {string} type Operationstyp
     * @param {string} status Status der Operation, z.B. STILL, COMPLEATE, ERROR
     * @param {string} message Operationsnachricht
     * 
     * @example logOperation("Login","COMLPLEATE","erfolgreich")
     */
    logOperation(type, status, message) {
        if (!this.options.customconsole) {
            return new consoleInteraface.console(false, 0, false, false, 0).logOperation(type, status, message)
        }
        return new consoleInteraface.console(this.options.logging_in_discord, this.options.discord_logging_channel, true, true, this.client).logOperation(type, status, message)
    }
    /**
     * Logge einen Status
     * @param {string} status der Status
     * @param {string} message Nachricht zum Status
     * 
     * @example logStatus("Online", "System erfolgreich gestartet")
     */
    logStatus(status, message) {
        if (!this.options.customconsole) {
            return new consoleInteraface.console(false, 0, false, false, 0).logStatus(status, message)
        }
        return new consoleInteraface.console(this.options.logging_in_discord, this.options.discord_logging_channel, true, true, this.client).logStatus(status, message)

    }
    /**
     * Leere die Console
     * 
     * @example logclear()
     */
    logClear() {
        if (!this.options.customconsole) {
            return new consoleInteraface.console(false, 0, false, false, 0).logClear()
        }
        return new consoleInteraface.console(this.options.logging_in_discord, this.options.discord_logging_channel, true, true, this.client).logClear()

    }
    /**
     * Stelle daten in der Console in einer Tabelle dar
     * @param {Array} input Array der Daten die in der Tabelle angezeigt werden sollen
     * @param {Array} properties Welche Argumente sollen angezeigt werden - Weck lassen oder leres Array lässt alles anzeigen - Index ausgeschlossen!
     * @param {boolean} index Wenn true wird die Spalte (index) nicht angezeigt
     * 
     * @example logTable([{ a: 1, b: 'Y' }, { a: 'Z', b: 2 }], [], false)
     * @example logTable([{ a: 1, b: 'Y' }, { a: 'Z', b: 2 }], ["a"], false)
     * @example logTable([{ a: 1, b: 'Y' }, { a: 'Z', b: 2 }], ["a"], true)
     */
    logTable(input, properties, index) {
        if (!this.options.customconsole) {
            return new consoleInteraface.console(false, 0, false, false, 0).logTable(input, properties, index)
        }
        return new consoleInteraface.console(this.options.logging_in_discord, this.options.discord_logging_channel, true, true, this.client).logTable(input, properties, index)
    }
    /**
     * Logge eine Info
     * @param {String} message Nachricht
     * 
     * @example logInfo("Test")
     */
    logInfo(message) {
        if (!this.options.customconsole) {
            return new consoleInteraface.console(false, 0, false, false, 0).logInfo(message)
        }
        return new consoleInteraface.console(this.options.logging_in_discord, this.options.discord_logging_channel, true, true, this.client).logInfo(message)
    }
}
