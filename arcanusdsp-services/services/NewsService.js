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

var http = require('http');
var https = require('https');

/**
 * News Service
 *
 * Exposes functions related to obtaining news posts for the arcanusdsp website.
 *
 * @param {object} arcanus                          The arcanus application instance.
 */
module.exports = function NewsServiceModule(arcanus) {
    /**
     * Implements the news service.
     *
     * @constructor
     */
    function NewsService() {
        // Initialize the base service class..
        arcanus.BaseService.call(this);
    }

    // Inherit from the base service class (required!)..
    NewsService.prototype = Object.create(arcanus.BaseService.prototype);
    NewsService.constructor = arcanus.BaseService;

    /**
     * Returns the alias of the current service. (Must be overridden!)
     *
     * @returns {string}                            The alias of the current service.
     */
    NewsService.prototype.getAlias = function () {
        return 'newsservice';
    };

    /**
     * Initializes the current service. (Must be overridden!)
     *
     * @param {function} done                       The callback to invoke when finished.
     */
    NewsService.prototype.Initialize = function (done) {
        done(null, true);
    };

    /** **/
    /** **/
    /** **/

    /**
     * Returns the latest news posts for the arcanusdsp website.
     *
     * @param {function} done                       The callback to invoke when finished.
     */
    NewsService.prototype.getNewsPosts = function (done) {
        // Build the http response callback..
        var callback = function (response) {
            var str = '';

            // Append incoming data to the overall string..
            response.on('data', function (chunk) { str += chunk; });

            // Complete the request and return the string..
            response.on('end', function () {
                try {
                    JSON.parse(str);
                    return done(null, str);
                } catch (e) {
                    return done(new Error('Failed to obtain latest news posts.'), null);
                }
            });
        };

        // Obtain the news service configurations..
        var cfg = arcanus.config.newsService || null;
        if (cfg === null)
            return done(new Error('Failed to obtain latest news posts. (Missing configurations.)'), null);

        // Build the news post request url..
        var url = arcanus.utils.format('%s%s?a=news&id=%d&l=%d&p=%s', cfg.path, cfg.script, cfg.forumId, cfg.count, cfg.path);

        arcanus.log.info('NewsService Attempt: ' + url);
        

        // Make the request..
        var request = https.request(url, callback);
        request.on('error', function (err) {
            return done(new Error('Failed to obtain latest news posts.'), null);
        });

        // Complete the request..
        request.end();
    };

    // Return the news service..
    return NewsService;
};