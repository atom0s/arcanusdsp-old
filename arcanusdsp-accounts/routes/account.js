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

var express = require('express');
var router = express.Router();
var async = require('async');
var passport = require('passport');
var accountUtils = require('../utils/accountUtils');

/**
 * Exposes route endpoints for the account portions of the website.
 *
 * @param {Object} arcanus                      The arcanus application instance.
 */
module.exports = function (arcanus) {
    /**
     * GET - /login
     * Gets the main login page of the website.
     *
     * @param {object} req                      The request object.
     * @param {object} res                      The response object.
     * @param {function} next                   The callback function to continue the request chain.
     */
    router.get('/login', function (req, res, next) {
        res.model.site.meta.setTitle('Login');
        res.model.site.meta.description = 'Log into your account to access more features.';

        // Render the page..
        res.render('account/login', res.model);
    });

    /**
     * POST - /login
     * Attempts to login the requesting user.
     *
     * @param {object} req                      The request object.
     * @param {object} res                      The response object.
     * @param {function} next                   The callback function to continue the request chain.
     */
    router.post('/login', passport.authenticate('local-login', {
        successRedirect: '/account/profile',
        failureRedirect: '/account/login',
        failureFlash: true
    }), function (req, res, next) {
        res.redirect('/');
    });

    /**
     * GET - /logout
     * Logs the requesting user out.
     *
     * @param {object} req                      The request object.
     * @param {object} res                      The response object.
     * @param {function} next                   The callback function to continue the request chain.
     */
    router.get('/logout', function (req, res, next) {
        req.logout();
        res.redirect('/');
    });

    /**
     * GET - /profile
     * Gets the users profile page.
     *
     * @param {object} req                      The request object.
     * @param {object} res                      The response object.
     * @param {function} next                   The callback function to continue the request chain.
     */
    router.get('/profile', accountUtils.isUserAuthorized, function (req, res, next) {
        res.model.site.meta.setTitle('Profile');
        res.model.site.meta.description = 'View and manager your account.';

        // Prepare the account object..
        var account = {
            id: req.user.id,
            name: req.user.login,
            email1: req.user.email,
            email2: req.user.email2,
            priv: req.user.priv,
            status: req.user.status,
            content_ids: req.user.content_ids,
            timelastmodify: req.user.timelastmodify
        };

        var tasks = [];

        // Obtain the accounts characters..
        tasks.push(function (callback) {
            var dsService = arcanus.services.get('darkstarservice');
            dsService.Characters.getCharactersByAccountId(req.user.id, function (err, chars) {
                account.characters = chars;
                return err ? callback(err) : callback();
            });
        });

        // Run the tasks to build the profile page..
        async.series(tasks, function (err) {
            if (err)
                res.model.errorMessage = 'Failed to obtain critical account information! Please try again later.';
            else
                res.model.account = JSON.stringify(account);

            // Render the page..
            res.render('account/profile', res.model);
        });
    });

    /**
     * GET - /changeemail
     * Gets the change email page.
     *
     * @param {object} req                      The request object.
     * @param {object} res                      The response object.
     * @param {function} next                   The callback function to continue the request chain.
     */
    router.get('/changeemail', accountUtils.isUserAuthorized, function (req, res, next) {
        res.model.site.meta.setTitle('Change Email');
        res.model.site.meta.description = 'Change your account email address.';

        // Render the page..
        res.render('account/changeemail', res.model);
    });

    /**
     * POST - /changeemail
     * Changes the users account email.
     *
     * @param {object} req                      The request object.
     * @param {object} res                      The response object.
     * @param {function} next                   The callback function to continue the request chain.
     */
    router.post('/changeemail', accountUtils.isUserAuthorized, function (req, res, next) {
        var tasks = [];
        var errors = [];
        var dsService = arcanus.services.get('darkstarservice');

        // Ensure the emails have values..
        tasks.push(function (callback) {
            if (!req.body.newemail || !arcanus.utils.isNonEmptyString(req.body.newemail)) {
                errors.push('You must enter a new email address.');
                return callback('Error');
            }
            if (!req.body.repeatemail || !arcanus.utils.isNonEmptyString(req.body.repeatemail)) {
                errors.push('You must enter a new email address. (repeat)');
                return callback('Error');
            }

            return callback();
        });

        // Ensure the emails match..
        tasks.push(function (callback) {
            if (req.body.newemail !== req.body.repeatemail) {
                errors.push('New emails do not match.');
                return callback('Error');
            }

            return callback();
        });

        // Ensure the new email is valid..
        tasks.push(function (callback) {
            if (!arcanus.utils.isValidEmail(req.body.newemail)) {
                errors.push('The given email is not a valid email address.');
                return callback('Error');
            }

            return callback();
        });

        // Ensure the users password is correct..
        tasks.push(function (callback) {
            dsService.Accounts.validatePassword(req.user.id, req.body.currentpassword, function (err, result) {
                if (err || result === false) {
                    errors.push('Invalid account password.');
                    return callback('Error');
                }

                return callback();
            });
        });

        // Change the accounts email address..
        tasks.push(function (callback) {
            dsService.Accounts.updateEmail(req.user.id, req.body.newemail, function (err, result) {
                if (err || result === false) {
                    errors.push('Failed to change the account email address.');
                    return callback('Error');
                }

                return callback();
            });
        });

        // Run the tasks to change the account email..
        async.series(tasks, function (err) {
            if (err)
                req.flash('error', 'Failed to change the email address: <br> &bull; ' + errors.join('<br> &bull; '));
            else
                req.flash('success', 'Your email address is now changed.');

            res.redirect('/account/changeemail');
        });
    });

    /**
     * GET - /changepassword
     * Gets the change password page.
     *
     * @param {object} req                      The request object.
     * @param {object} res                      The response object.
     * @param {function} next                   The callback function to continue the request chain.
     */
    router.get('/changepassword', accountUtils.isUserAuthorized, function (req, res, next) {
        res.model.site.meta.setTitle('Change Password');
        res.model.site.meta.description = 'Change your account password.';

        // Render the page..
        res.render('account/changepassword', res.model);
    });

    /**
     * POST - /changepassword
     * Changes the users account password.
     *
     * @param {object} req                      The request object.
     * @param {object} res                      The response object.
     * @param {function} next                   The callback function to continue the request chain.
     */
    router.post('/changepassword', accountUtils.isUserAuthorized, function (req, res, next) {
        var tasks = [];
        var errors = [];
        var dsService = arcanus.services.get('darkstarservice');

        // Ensure the passwords have values..
        tasks.push(function (callback) {
            if (!req.body.currentpassword || !arcanus.utils.isNonEmptyString(req.body.currentpassword)) {
                errors.push('You must your current password.');
                return callback('Error');
            }
            if (!req.body.newpassword || !arcanus.utils.isNonEmptyString(req.body.newpassword)) {
                errors.push('You must enter a new password.');
                return callback('Error');
            }
            if (!req.body.repeatpassword || !arcanus.utils.isNonEmptyString(req.body.repeatpassword)) {
                errors.push('You must enter a new password. (repeat)');
                return callback('Error');
            }

            return callback();
        });

        // Ensure the passwords match..
        tasks.push(function (callback) {
            if (req.body.newpassword !== req.body.repeatpassword) {
                errors.push('New passwords do not match.');
                return callback('Error');
            }

            return callback();
        });

        // Ensure the new password is DSP safe..
        tasks.push(function (callback) {
            if (req.body.newpassword.length <= 3) {
                errors.push('New password is too short!');
                return callback('Error');
            }
            if (req.body.newpassword.length > 15) {
                errors.push('New password is too long!');
                return callback('Error');
            }

            var isAscii = /^[ -~\t\n\r]+$/;
            if (!isAscii.test(req.body.newpassword)) {
                errors.push('New password contains invalid characters.');
                return callback('Error');
            }

            return callback();
        });

        // Ensure the users password is correct..
        tasks.push(function (callback) {
            dsService.Accounts.validatePassword(req.user.id, req.body.currentpassword, function (err, result) {
                if (err || result === false) {
                    errors.push('Invalid account password.');
                    return callback('Error');
                }

                return callback();
            });
        });

        // Change the accounts password..
        tasks.push(function (callback) {
            dsService.Accounts.updatePassword(req.user.id, req.body.newpassword, function (err, result) {
                if (err || result === false) {
                    errors.push('Failed to change the account password.');
                    return callback('Error');
                }

                return callback();
            });
        });

        // Run the tasks to change the account password..
        async.series(tasks, function (err) {
            if (err)
                req.flash('error', 'Failed to change the account password: <br> &bull; ' + errors.join('<br> &bull; '));
            else
                req.flash('success', 'Your account password is now changed.');

            res.redirect('/account/changepassword');
        });
    });

    // Return the router..
    return router;
};