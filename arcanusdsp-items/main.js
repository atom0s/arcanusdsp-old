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

        // Add the items menu item..
        var itemMenuItem = [
            {
                alias: 'itemstool',
                href: '/db/items',
                icon: 'fa-diamond',
                title: 'Item Tool',
            }
        ];
        menuService.appendMenuItems('main', itemMenuItem, 'database');

        // Register the navigation routers..
        pluginService.registerRouter('arcanusdsp-items', '/ajax', ajaxRouter);
        pluginService.registerRouter('arcanusdsp-items', '/db', dbRouter);

        done(null, true);
    };

    /**
     * GET - /items?name={name}
     * Gets a list of items with the matching partial name.
     *
     * @param {object} req                      The request object.
     * @param {object} res                      The response object.
     * @param {function} next                   The callback function to continue the request chain.
     */
    ajaxRouter.get('/items', function (req, res, next) {
        var name = req.query.name || null;

        // Ensure a name was given..
        if (!arcanus.utils.isNonEmptyString(name))
            return res.status(400).send([]);

        // Obtain a list of items with the partial name..
        arcanus.services.get('darkstarservice').Items.getItemsByName(name, function (err, items) {
            var status = (err) ? 400 : 200;
            res.status(status).send(items);
        });
    });

    /**
     * GET - /item?id={id}
     * Gets an items information by its id.
     *
     * @param {object} req                      The request object.
     * @param {object} res                      The response object.
     * @param {function} next                   The callback function to continue the request chain.
     */
    ajaxRouter.get('/item', function (req, res, next) {
        var itemid = parseInt(req.query.id) || 0;

        // Ensure an itemid was given..
        if (!itemid)
            return res.status(204).send(null);

        // Determine if the request is by an admin..
        var isAdmin = false;
        if (req.user && req.user.priv > 1)
            isAdmin = true;

        // Check the cache..
        var cacheValue = arcanus.cache.get(isAdmin ? 'item-' + itemid.toString() + isAdmin : 'item-' + itemid.toString());
        if (cacheValue != undefined) {
            return res.status(200).send(cacheValue);
        }

        // Obtain the character by their charid..
        arcanus.services.get('darkstarservice').Items.getItemById(itemid, isAdmin, function (err, item) {
            var status = (err) ? 400 : 200;

            if (status === 200) {
                arcanus.cache.set(isAdmin ? 'item-' + itemid.toString() + isAdmin : 'item-' + itemid.toString(), item, 600);
            }

            res.status(status).send(item);
        });
    });

    /**
     * GET - /items
     * Gets the item lookup page.
     *
     * @param {object} req                      The request object.
     * @param {object} res                      The response object.
     * @param {function} next                   The callback function to continue the request chain.
     */
    dbRouter.get('/items', function (req, res, next) {
        res.model.site.meta.setTitle('Find An Item');
        res.model.site.meta.description = 'Lookup an items information.';

        // Render the page..
        res.render('db/items/itemlookup', res.model);
    });

    /**
     * GET - /items/{itemid}/{itemname}
     * Gets a characters profile.
     *
     * @param {object} req                      The request object.
     * @param {object} res                      The response object.
     * @param {function} next                   The callback function to continue the request chain.
     */
    dbRouter.get('/items/:itemid/:itemname?', function (req, res, next) {
        res.model.site.meta.setTitle('Loading Item...');
        res.model.site.meta.description = 'Viewing an items information.';

        // Obtain and validate the item id..
        var itemid = parseInt(req.params.itemid) || 0;
        if (itemid === 0) {
            req.flash('error', 'Invalid item id given.');
            res.redirect('/db/items');
        } else {
            res.model.itemid = itemid;
            res.render('db/items/item', res.model);
        }
    });

    // Return the plugin instance..
    return Plugin;
};