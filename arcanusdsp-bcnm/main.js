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
        var menuItems = [
            {
                alias: 'bcnms',
                href: '/db/bcnms',
                icon: 'fa-fort-awesome',
                title: 'BCNM Tool',
            }
        ];
        menuService.appendMenuItems('main', menuItems, 'database');

        // Register the navigation routers..
        pluginService.registerRouter('arcanusdsp-bcnm', '/ajax', ajaxRouter);
        pluginService.registerRouter('arcanusdsp-bcnm', '/db', dbRouter);

        done(null, true);
    };

    /**
     * GET - /bcnms
     * Gets a list of bcnms.
     *
     * @param {object} req                      The request object.
     * @param {object} res                      The response object.
     * @param {function} next                   The callback function to continue the request chain.
     */
    ajaxRouter.get('/bcnms', function (req, res, next) {
        // Determine if the request is by an admin..
        var isAdmin = false;
        if (req.user && req.user.priv > 1)
            isAdmin = true;

        // Check the cache..
        var cacheValue = arcanus.cache.get(isAdmin ? 'bcnmlist-admin' : 'bcnmlist');
        if (cacheValue != undefined) {
            return res.status(200).send(cacheValue);
        }

        arcanus.services.get('darkstarservice').Bcnms.getBcnmList(isAdmin, function (err, bcnms) {
            var status = (err) ? 400 : 200;

            if (status === 200) {
                arcanus.cache.set(isAdmin ? 'bcnmlist-admin' : 'bcnmlist', bcnms, 600);
            }

            res.status(status).send(bcnms);
        });
    });

    /**
     * GET - /bcnm?id={bcnmid}
     * Gets a bcnm by its id.
     *
     * @param {object} req                      The request object.
     * @param {object} res                      The response object.
     * @param {function} next                   The callback function to continue the request chain.
     */
    ajaxRouter.get('/bcnm', function (req, res, next) {
        var bcnmid = parseInt(req.query.id) || 0;

        // Ensure a bcnmid was given..
        if (!bcnmid)
            return res.status(204).send(null);

        // Determine if the request is by an admin..
        var isAdmin = false;
        if (req.user && req.user.priv > 1)
            isAdmin = true;

        // Check the cache..
        var cacheValue = arcanus.cache.get(isAdmin ? 'bcnm-' + bcnmid.toString() + isAdmin : 'bcnm-' + bcnmid.toString());
        if (cacheValue != undefined) {
            return res.status(200).send(cacheValue);
        }

        // Obtain the bcnm by its bcnmid..
        arcanus.services.get('darkstarservice').Bcnms.getBcnmById(bcnmid, isAdmin, function (err, bcnm) {
            var status = (err) ? 400 : 200;

            if (status === 200) {
                arcanus.cache.set(isAdmin ? 'bcnm-' + bcnmid.toString() + isAdmin : 'bcnm-' + bcnmid.toString(), bcnm, 600);
            }

            res.status(status).send(bcnm);
        });
    });

    /**
     * GET - /bcnms
     * Gets bcnm lookup page.
     *
     * @param {object} req                      The request object.
     * @param {object} res                      The response object.
     * @param {function} next                   The callback function to continue the request chain.
     */
    dbRouter.get('/bcnms', function (req, res, next) {
        res.model.site.meta.setTitle('Find A BCNM');
        res.model.site.meta.description = 'Lookup a BCNM instance information.';

        // Render the page..
        res.render('db/bcnm/bcnms.html', res.model);
    });

    /**
     * GET - /bcnms/{bcnmid}/{bcnmname}
     * Gets a BCNM by its id.
     *
     * @param {object} req                      The request object.
     * @param {object} res                      The response object.
     * @param {function} next                   The callback function to continue the request chain.
     */
    dbRouter.get('/bcnms/:bcnmid/:bcnmname?', function (req, res, next) {
        res.model.site.meta.setTitle('Loading BCNM...');
        res.model.site.meta.description = 'Viewing a BCNM.';

        // Obtain and validate the bcnm id..
        var bcnmid = parseInt(req.params.bcnmid) || 0;
        if (bcnmid === 0) {
            req.flash('error', 'Invalid bcnm id given.');
            res.redirect('/db/bcnms');
        } else {
            res.model.bcnmid = bcnmid;
            res.render('db/bcnm/bcnm', res.model);
        }
    });

    // Return the plugin instance..
    return Plugin;
};