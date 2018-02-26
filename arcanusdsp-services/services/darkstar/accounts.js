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

/**
 * Exposes functions related to DarkStar accounts.
 *
 * @param {object} arcanus                          The arcanus application instance.
 */
module.exports = function (arcanus) {
    var AccountModule = {};

    /**
     * Validates an account password.
     *
     * @param {number} accid                    The account id to check the password of.
     * @param {string} password                 The password to compare against.
     * @param {function} done                   The callback to invoke when the function has completed.
     */
    AccountModule.validatePassword = function (accid, password, done) {
        arcanus.db.query('SELECT * FROM accounts WHERE id = ? AND password = PASSWORD(?);', [accid, password], function (err, rows) {
            if (err)
                return done(err, false);
            if (rows.length === 0)
                return done(new Error('Invalid password given.'), false);
            return done(null, true);
        });
    };

    /**
     * Updates an accounts email.
     *
     * @param {number} accid                    The account id to update the email of.
     * @param {string} email                    The new email address to set for the account.
     * @param {function} done                   The callback to invoke when the function has completed.
     */
    AccountModule.updateEmail = function (accid, email, done) {
        arcanus.db.query('UPDATE accounts SET email = ? WHERE id = ?;', [email, accid], function (err, result) {
            if (err)
                return done(err, false);
            if (result.affectedRows === 0)
                return done(new Error('There was an internal error trying to update your email.'), false);
            return done(null, true);
        });
    };

    /**
     * Updates an accounts password.
     *
     * @param {number} accid                    The account id to update the password of.
     * @param {string} password                 The new password to set for the account.
     * @param {function} done                   The callback to invoke when the function has completed.
     */
    AccountModule.updatePassword = function (accid, password, done) {
        arcanus.db.query('UPDATE accounts SET password = PASSWORD(?) WHERE id = ?;', [password, accid], function (err, result) {
            if (err)
                return done(err, false);
            if (result.affectedRows === 0)
                return done(new Error('There was an internal error trying to update your password.'), false);
            return done(null, true);
        });
    };

    // Return the account module..
    return AccountModule;
};