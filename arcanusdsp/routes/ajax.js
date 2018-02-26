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
var fs = require('fs');
var path = require('path');
var socket = require('net');

/**
 * Exposes route endpoints for the ajax callbacks of the website.
 *
 * @param {Object} arcanus                      The arcanus application instance.
 */
module.exports = function (arcanus) {
    /**
     * Gets the latest news posts from the forums.
     *
     * @param {object} req                      The request object.
     * @param {object} res                      The response object.
     * @param {function} next                   The callback function to continue the request chain.
     */
    router.get('/latestnews', function (req, res, next) {
        // Check the cache..
        var cacheValue = arcanus.cache.get('latestnews');
        if (cacheValue != undefined) {
            return res.status(200).send(cacheValue);
        }

        // Obtain the posts from the news service..
        var newsService = arcanus.services.get('newsservice');
        newsService.getNewsPosts(function (err, posts) {
            if (err || posts === null)
                return res.status(204).send('[]');

            // Set the news cache..
            arcanus.cache.set('latestnews', posts, 600);

            return res.status(200).send(posts);
        });
    });

    /**
     * Gets the servers current online status.
     *
     * @param {object} req                      The request object.
     * @param {object} res                      The response object.
     * @param {function} next                   The callback function to continue the request chain.
     */
    router.get('/serverstatus', function (req, res, next) {
        // Check the cache..
        var cacheValue = arcanus.cache.get('serverstatus');
        if (cacheValue != undefined) {
            return res.status((cacheValue == true) ? 200 : 204).send(cacheValue);
        }

        // Obtain the configurations..
        var cfg = arcanus.config.darkstar || null;
        if (!cfg)
            return res.status(204).send(false);

        // Connects to the server to determine if it's currently online..
        var client = socket.connect({
            host: cfg.host,
            port: cfg.port
        }, function () {
            arcanus.cache.set('serverstatus', true, 120);
            return res.status(200).send(true);
        });

        // Error handler..
        client.on('error', function (err) {
            arcanus.cache.set('serverstatus', false, 120);
            return res.status(204).send(false);
        });

        // Complete the connection..
        client.end();
    });

    /**
     * Gets the servers client version requirement.
     *
     * @param {object} req                      The request object.
     * @param {object} res                      The response object.
     * @param {function} next                   The callback function to continue the request chain.
     */
    router.get('/serverversion', function (req, res, next) {
        // Check the cache..
        var cacheValue = arcanus.cache.get('serverversion');
        if (cacheValue != undefined) {
            return res.status(200).send(cacheValue);
        }

        // Obtain the configurations..
        var cfg = arcanus.config.darkstar || null;
        if (!cfg || !cfg.path)
            return res.status(204).send('Unknown');

        var data = fs.readFileSync(path.join(cfg.path, 'version.info'));
        if (data.indexOf('CLIENT_VER:') > 0) {

            var s = data.indexOf('CLIENT_VER:');
            var e = data.indexOf('\n', s);
            var r = data.toString().substring(s + 11, e - 1).trim();

            if (r) {
                arcanus.cache.set('serverversion', r, 60 * 5);
                return res.status(200).send(r);
            }

            return res.status(200).send('Unknown');
        } else {
            arcanus.cache.set('serverversion', 'Unknown', 60 * 5);
            return res.status(204).send('Unknown');
        }
    });

    /**
     * Gets the current online characters.
     *
     * @param {object} req                      The request object.
     * @param {object} res                      The response object.
     * @param {function} next                   The callback function to continue the request chain.
     */
    router.get('/onlinecharacters', function (req, res, next) {
        // Check the cache..
        //var cacheValue = arcanus.cache.get('onlinecharacters');
        //if (cacheValue != undefined) {
        //    return res.status(200).send(cacheValue);
        //}

        // Obtain the characters from the DarkStar service..
        var dsService = arcanus.services.get('darkstarservice');
        dsService.Characters.getOnlineCharacters(function (err, characters, count) {
            var status = (err || characters === null) ? 500 : 200;

            //if (status === 200) {
            //    arcanus.cache.set('onlinecharacters', characters, 120);
            //}

            return res.status(status).send({
                "unique": count,
                "characters": characters
             });
        });
    });

    /**
     * Frees a stuck character.
     *
     * @param {object} req                      The request object.
     * @param {object} res                      The response object.
     * @param {function} next                   The callback function to continue the request chain.
     */
    router.get('/unstuck', function (req, res, next) {
        // Ensure the requesting user is logged in..
        if (!req.user || !req.user.id)
            return res.status(401).send(false);

        // Obtain the character id from the request..
        var charid = parseInt(req.query.charid) || 0;
        if (!charid || charid === 0)
            return res.status(400).send(false);

        // Attempt to free the stuck character..
        var dsService = arcanus.services.get('darkstarservice');
        dsService.Characters.unstuckCharacter(req.user.id, charid, function (err, result) {
            var status = (err || result === null) ? 400 : 200;
            return res.status(status).send(result);
        });
    });

    /**
     * Returns the current node version.
     * 
     * @param {object} req                      The request object.
     * @param {object} res                      The response object.
     * @param {function} next                   The callback function to continue the request chain.
     */
    router.get('/nodeversion', function (req, res, next) {
        return res.status(200).send(process.versions);
    });

    // Return the router..
    return router;
};