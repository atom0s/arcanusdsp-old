/**
 * arcanus - Copyright (c) 2015-2016 atom0s [atom0s@live.com]
 *
 * This work is licensed under the Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-nc-nd/4.0/ or send a letter to
 * Creative Commons, PO Box 1866, Mountain View, CA 94042, USA.
 *
 * By using arcanus, you agree to the above license and its terms.
 *
 *      Attribution - You must give appropriate credit, provide a link to the license and indicate if changes were
 *                    made. You must do so in any reasonable manner, but not in any way that suggests the licensor
 *                    endorses you or your use.
 *
 *   Non-Commercial - You may not use the material (arcanus) for commercial purposes.
 *
 *   No-Derivatives - If you remix, transform, or build upon the material (arcanus), you may not distribute the
 *                    modified material. You are, however, allowed to submit the modified works back to the original
 *                    arcanus project in attempt to have it added to the original project.
 *
 * You may not apply legal terms or technological measures that legally restrict others
 * from doing anything the license permits.
 *
 * You may contact me, atom0s, at atom0s@live.com for more information or if you are seeking commercial use.
 *
 * No warranties are given.
 */

"use strict";

var mysql = require('mysql');

module.exports = function (arcanus) {

    function Plugin() { }

    /**
     * Initializes the MySQL database connection.
     *
     * @param {function} done                       The callback to invoke when finished.
     */
    Plugin.Initialize = function (done) {
        // Obtain the database configuration block from the root config..
        var dbconn = arcanus.config.database || null;
        if (!dbconn) {
            return done(null, false);
        }

        // Create the connection..
        arcanus.db = mysql.createConnection(dbconn);

        /**
         * Ensures that the sql client will reconnect on errors.
         */
        function keepSqlAlive() {
            arcanus.db.on('error', function (err) {
                // Log the error..
                arcanus.log.error(err);

                // Ignore non-fatal errors (these do not kill the connection)..
                if (!err.fatal)
                    return;

                // Recreate the connection..
                arcanus.db = mysql.createConnection(dbconn);
                keepSqlAlive();

                // Reconnect to the database..
                arcanus.db.connect(function (err) {
                    if (err) {
                        arcanus.log.error(err);
                        process.exit(1);
                    }
                });
            });
        }

        // Activate the connection..
        keepSqlAlive();

        // Return successful..
        done(null, true);
    };

    // Return the plugin instance..
    return Plugin;
};