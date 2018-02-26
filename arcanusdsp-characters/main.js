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

var express = require('express');
var ajaxRouter = express.Router();
var dbRouter = express.Router();

module.exports = function (arcanus) {
    /**
     * Default Constructor
     *
     * @constructor
     */
    function Plugin() { }

    /**
     * Initializes the plugin.
     *
     * @param {function} done                       The callback to invoke when finished.
     */
    Plugin.Initialize = function (done) {
        var menuService = arcanus.services.get('menuservice');
        var pluginService = arcanus.services.get('pluginservice');

        // Ensure the database tools menu exists..
        var databaseMenu = {
            alias: 'database',
            href: '',
            icon: 'fa-database',
            title: 'Database Tools',
            children: []
        };
        menuService.appendMenuItem('main', databaseMenu);

        // Add the characters menu item..
        var characterMenuItem = [
            {
                alias: 'characterstool',
                href: '/db/characters',
                icon: 'fa-users',
                title: 'Character Tool',
            }
        ];
        menuService.appendMenuItems('main', characterMenuItem, 'database');

        // Register the navigation routers..
        pluginService.registerRouter('arcanusdsp-characters', '/ajax', ajaxRouter);
        pluginService.registerRouter('arcanusdsp-characters', '/db', dbRouter);

        done(null, true);
    };

    /**
     * GET - /characters?name={name}
     * Gets a list of characters with the matching partial name.
     *
     * @param {object} req                      The request object.
     * @param {object} res                      The response object.
     * @param {function} next                   The callback function to continue the request chain.
     */
    ajaxRouter.get('/characters', function (req, res, next) {
        var name = req.query.name || null;

        // Ensure a name was given..
        if (!arcanus.utils.isNonEmptyString(name))
            return res.status(400).send([]);

        // Obtain a list of characters with the partial name..
        arcanus.services.get('darkstarservice').Characters.getCharactersByName(name, function (err, characters) {
            var status = (err) ? 400 : 200;
            res.status(status).send(characters);
        });
    });

    /**
     * GET - /character?id={charid}
     * Gets a characters profile by their id.
     *
     * @param {object} req                      The request object.
     * @param {object} res                      The response object.
     * @param {function} next                   The callback function to continue the request chain.
     */
    ajaxRouter.get('/character', function (req, res, next) {
        var charid = parseInt(req.query.id) || 0;

        // Ensure a charid was given..
        if (!charid)
            return res.status(204).send(null);

        // Determine if the request is by an admin..
        var isAdmin = false;
        if (req.user && req.user.priv > 1)
            isAdmin = true;

        // Check the cache..
        var cacheString = isAdmin ? 'character-profile-' + charid.toString() + '-admin' : 'character-profile-' + charid.toString();
        var cacheValue = arcanus.cache.get(cacheString);
        if (cacheValue != undefined) {
            return res.status(200).send(cacheValue);
        }

        // Obtain the character by their charid..
        arcanus.services.get('darkstarservice').Characters.getCharacterById(charid, isAdmin, function (err, character) {
            var status = (err) ? 400 : 200;

            if (status === 200) {
                arcanus.cache.set(cacheString, character, 600);
            }

            res.status(status).send(character);
        });
    });

    /**
     * GET - /characters
     * Gets the character lookup page.
     *
     * @param {object} req                      The request object.
     * @param {object} res                      The response object.
     * @param {function} next                   The callback function to continue the request chain.
     */
    dbRouter.get('/characters', function (req, res, next) {
        res.model.site.meta.setTitle('Find A Character');
        res.model.site.meta.description = 'Lookup a characters profile.';

        // Render the page..
        res.render('db/characters/characterlookup', res.model);
    });

    /**
     * GET - /characters/{charid}/{charname}
     * Gets a characters profile.
     *
     * @param {object} req                      The request object.
     * @param {object} res                      The response object.
     * @param {function} next                   The callback function to continue the request chain.
     */
    dbRouter.get('/characters/:charid/:charname?', function (req, res, next) {
        res.model.site.meta.setTitle('Loading Profile...');
        res.model.site.meta.description = 'Viewing a characters profile.';

        // Obtain and validate the character id..
        var charid = parseInt(req.params.charid) || 0;
        if (charid === 0) {
            req.flash('error', 'Invalid character id given.');
            res.redirect('/db/characters');
        } else {
            res.model.charid = charid;
            res.render('db/characters/character', res.model);
        }
    });

    // Return the plugin instance..
    return Plugin;
};