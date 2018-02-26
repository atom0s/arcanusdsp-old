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

var LocalStrategy = require('passport-local').Strategy;

/**
 * Creates a passport local authentication strategy using DarkStar accounts.
 *
 * @param {object} arcanus                      The arcanus application instance.
 * @param {object} passport                     The passport instance.
 */
module.exports = function (arcanus, passport) {
    /**
     * Serializes a user.
     *
     * @param {object} user                     The user object being serialized.
     * @param {function} done                   The callback to invoke when finished.
     */
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    /**
     * Deserializes a user.
     *
     * @param {number} id                       The user id to deserialize.
     * @param {function} done                   The callback to invoke when finished.
     */
    passport.deserializeUser(function (id, done) {
        arcanus.db.query("SELECT * FROM accounts WHERE id = ?;", [id], function (err, rows) {
            if (err)
                return done(err, null);
            return done(err, rows[0]);
        });
    });

    /**
     * Handles the user login through local passport strategy.
     *
     * @param {object} req                      The request object that invoked the login attempt.
     * @param {string} username                 The username being logged in with.
     * @param {string} password                 The password being logged in with.
     * @param {function} done                   The callback to invoke when finished.
     */
    passport.use('local-login', new LocalStrategy({
        usernameField: 'username', passwordField: 'password', passReqToCallback: true
    }, function (req, username, password, done) {
        arcanus.db.query('SELECT * FROM accounts WHERE login = ? AND password = PASSWORD(?);', [username, password], function (err, rows) {
            if (err)
                return done(null, false, { message: 'Failed to query database for login attempt.' });
            if (!rows.length)
                return done(null, false, { message: 'Invalid account name or password!' });
            if ((rows[0].status & 0x02) == 0x02)
                return done(null, false, { message: 'Cannot login; that account is banned.' });
            return done(null, rows[0]);
        });
    }));
};