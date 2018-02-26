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

/**
 * Exposes route endpoints for the root of the website.
 *
 * @param {Object} arcanus                      The arcanus application instance.
 */
module.exports = function (arcanus) {
    /**
     * Gets the main index of the website.
     *
     * @param {object} req                      The request object.
     * @param {object} res                      The response object.
     * @param {function} next                   The callback function to continue the request chain.
     */
    router.get('/', function (req, res, next) {
        res.model.site.meta.setTitle('Index');
        res.model.site.meta.description = 'Welcome to the Kupo private server website!';

        // Render the page..
        res.render('index', res.model);
    });

    /**
     * Gets the irc chat page.
     *
     * @param {object} req                      The request object.
     * @param {object} res                      The response object.
     * @param {function} next                   The callback function to continue the request chain.
     */
    router.get('/chat', function (req, res, next) {
        res.model.site.meta.setTitle('Chat (IRC)');
        res.model.site.meta.description = 'Chat with fellow community members online!';

        // Render the page..
        res.render('chat', res.model);
    });

    /**
     * Gets the online list for mobile users.
     *
     * @param {object} req                      The request object.
     * @param {object} res                      The response object.
     * @param {function} next                   The callback function to continue the request chain.
     */
    router.get('/whosonline', function (req, res, next) {
        res.model.site.meta.setTitle('Whos Online');
        res.model.site.meta.description = 'Displays a list of currently online players.';

        // Render the page..
        res.render('whosonline', res.model);
    });

    /**
     * Gets the donate page.
     *
     * @param {object} req                      The request object.
     * @param {object} res                      The response object.
     * @param {function} next                   The callback function to continue the request chain.
     */
    router.get('/donate', function (req, res, next) {
        res.model.site.meta.setTitle('Donations');
        res.model.site.meta.description = 'Say thanks, with money!';

        // Render the page..
        res.render('donate', res.model);
    });

    // Return the router..
    return router;
};