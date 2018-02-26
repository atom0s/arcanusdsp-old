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

        // Add the menu items..
        var bluespellsMenuItem = [
            {
                alias: 'bluespells-sep00',
                separator: true
            },
            {
                alias: 'bluespells',
                href: '/db/bluespells',
                icon: 'fa-magic',
                title: 'Bluemage Tool',
            }
        ];
        menuService.appendMenuItems('main', bluespellsMenuItem, 'database');

        // Register the navigation routers..
        pluginService.registerRouter('arcanusdsp-bluespells', '/ajax', ajaxRouter);
        pluginService.registerRouter('arcanusdsp-bluespells', '/db', dbRouter);

        done(null, true);
    };

    /**
     * GET - /bluespells
     * Gets a list of blue magic spells to view information about.
     *
     * @param {object} req                      The request object.
     * @param {object} res                      The response object.
     * @param {function} next                   The callback function to continue the request chain.
     */
    ajaxRouter.get('/bluespells', function (req, res, next) {
        arcanus.services.get('darkstarservice').Spells.getBlueSpells(function (err, spells) {
            var status = (err) ? 400 : 200;
            res.status(status).send(spells);
        });
    });

    /**
     * GET - /bluespell?id={spellid}
     * Gets a blue spell by its spell id.
     *
     * @param {object} req                      The request object.
     * @param {object} res                      The response object.
     * @param {function} next                   The callback function to continue the request chain.
     */
    ajaxRouter.get('/bluespell', function (req, res, next) {
        var spellid = parseInt(req.query.id) || 0;

        // Ensure a spellid was given..
        if (!spellid)
            return res.status(204).send(null);

        // Obtain the spell by its spellid..
        arcanus.services.get('darkstarservice').Spells.getBlueSpellById(spellid, function (err, spell) {
            var status = (err) ? 400 : 200;
            res.status(status).send(spell);
        });
    });

    /**
     * GET - /bluespells
     * Gets blue magic lookup page.
     *
     * @param {object} req                      The request object.
     * @param {object} res                      The response object.
     * @param {function} next                   The callback function to continue the request chain.
     */
    dbRouter.get('/bluespells', function (req, res, next) {
        res.model.site.meta.setTitle('Find A Blue Spell');
        res.model.site.meta.description = 'Lookup a blue mages spell information.';

        // Render the page..
        res.render('db/bluespells/bluespells.html', res.model);
    });

    /**
     * GET - /bluespells/{spellid}/{spellname}
     * Gets a characters profile.
     *
     * @param {object} req                      The request object.
     * @param {object} res                      The response object.
     * @param {function} next                   The callback function to continue the request chain.
     */
    dbRouter.get('/bluespells/:spellid/:spellname?', function (req, res, next) {
        res.model.site.meta.setTitle('Loading Spell...');
        res.model.site.meta.description = 'Viewing a blue magic spell.';

        // Obtain and validate the character id..
        var spellid = parseInt(req.params.spellid) || 0;
        if (spellid === 0) {
            req.flash('error', 'Invalid spell id given.');
            res.redirect('/db/bluespells');
        } else {
            res.model.spellid = spellid;
            res.render('db/bluespells/bluespell', res.model);
        }
    });

    // Return the plugin instance..
    return Plugin;
};