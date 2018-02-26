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

var async = require('async');

/**
 * Exposes functions related to DarkStar items.
 *
 * @param {object} arcanus                      The arcanus application instance.
 */
module.exports = function (arcanus) {
    var ItemModule = {};

    /**
     * Converts the given craft information to a bindable object.
     *
     * @param {cbject} c                        The craft information from the database.
     */
    var buildCraftInformation = function (c) {
        var cachedItems = arcanus.cache.get('items');
        var craftNames = {
            0: ['Alchemy', 'Alchemy'],
            1: ['Bonecraft', 'Bone'],
            2: ['Clothcraft', 'Cloth'],
            3: ['Cooking', 'Cook'],
            4: ['Goldsmithing', 'Gold'],
            5: ['Leathercraft', 'Leather'],
            6: ['Smithing', 'Smith'],
            7: ['Woodworking', 'Wood']
        };

        // Build the requirements..
        var requirements = [];
        for (var x = 0; x < 8; x++) {
            if (c[craftNames[x][1]] > 0)
                requirements.push({ name: craftNames[x][0], level: c[craftNames[x][1]] });
        }

        // Sort the requirements..
        requirements.sort(function (a, b) {
            return a.level < b.level;
        });

        // Build the ingredients..
        var ingredients = {};
        for (var x = 0; x < 8; x++) {
            var i = c['Ingredient' + (x + 1)];
            if (i === 0)
                continue;

            if (!ingredients[i]) {
                ingredients[i] = {
                    itemid: i,
                    count: 1,
                    name: 'Unknown Item: ' + i
                };

                // Obtain the item from the global cache..
                if (cachedItems && cachedItems[i])
                    ingredients[i].name = cachedItems[i].name;
            } else {
                ingredients[i].count++;
            }
        }

        // Build the craft results..
        var results = [];
        var resultRows = ['Result', 'ResultHQ1', 'ResultHQ2', 'ResultHQ3'];
        for (var x = 0; x < resultRows.length; x++) {

            var res = null;

            // Build the result information based on the type..
            if (c[resultRows[x]] > 0 && x === 0)
                res = {
                    type: 'Normal',
                    itemid: c[resultRows[x]],
                    name: 'Unknown Item',
                    count: c[resultRows[x] + 'Qty']
                };
            if (c[resultRows[x]] > 0 && x === 1)
                res = { type: 'HQ1', itemid: c[resultRows[x]], name: 'Unknown Item', count: c[resultRows[x] + 'Qty'] };
            if (c[resultRows[x]] > 0 && x === 2)
                res = { type: 'HQ2', itemid: c[resultRows[x]], name: 'Unknown Item', count: c[resultRows[x] + 'Qty'] };
            if (c[resultRows[x]] > 0 && x === 3)
                res = { type: 'HQ3', itemid: c[resultRows[x]], name: 'Unknown Item', count: c[resultRows[x] + 'Qty'] };

            if (res) {
                // Fill in the item name from the item cache..
                if (cachedItems && cachedItems[c[resultRows[x]]])
                    res.name = cachedItems[c[resultRows[x]]].name;

                // Add this to our result array..
                results.push(res);
            }
        }

        // Build the new craft item..
        var craft = {};
        craft.crystal = c['Crystal'];
        craft.ingredients = ingredients;
        craft.requirements = requirements;
        craft.results = results;

        return craft;
    };

    /**
     * Builds the item cache for internal usage.
     *
     * @param {function} done                   The callback to invoke when the function has completed.
     */
    ItemModule.buildItemCache = function (done) {
        var itemTables = ['item_armor', 'item_basic', 'item_furnishing', 'item_puppet', 'item_usable', 'item_weapon'];
        var items = {};
        var tasks = [];

        // Build the queries for each item table..
        itemTables.forEach(function (i) {
            tasks.push(function (callback) {
                const sql = `SELECT itemid, name FROM ${i};`;
                arcanus.db.query(sql, function (err, rows) {
                    if (err)
                        return callback(err);

                    rows.forEach(function (item) {
                        items[item.itemid] = item;
                    });

                    return callback();
                });
            });
        });

        // Perform the queries..
        async.series(tasks, function (err) {
            arcanus.cache.set('items', items);
            return done((err) ? true : null);
        });
    };

    /**
     * Obtains a list of items by their name.
     *
     * @param {string} name                     The name of the items to obtain.
     * @param {function} done                   The callback to invoke when the function has completed.
     */
    ItemModule.getItemsByName = function (name, done) {
        var tasks = [];
        var items = [];
        var seenItemId = [];

        // Clean the name for database searching..
        name = name.replace(/ /g, '_');
        name = name.replace(/'/g, '');
        name = name.replace(/"/, '');

        // Ensure we have at least 4 characters..
        if (name.length < 3)
            return done(new Error('Item name must be longer than 3 characters.'));

        // Use the item cache if it exists..
        var cachedItems = arcanus.cache.get('items');
        if (cachedItems) {

            // Loop each item in the cache and find matching names..
            Object.keys(cachedItems).forEach(function (k) {
                // Skip items we've seen already..
                if (seenItemId.indexOf(k) !== -1)
                    return;

                // Check if the cached item matches the partial name given..
                var currItem = cachedItems[k];
                if (currItem && arcanus.utils.isNonEmptyString(currItem.name)) {

                    var lower = currItem.name.toLowerCase();
                    if (lower.indexOf(name.toLowerCase()) !== -1) {
                        seenItemId.push(k);
                        items.push({ id: k, name: cachedItems[k].name });
                    }
                }
            });

            // Sort the results..
            items.sort(function (a, b) {
                if (a.name < b.name) return -1;
                if (a.name > b.name) return 1;
                return 0;
            });

            return done(null, items);
        }

        // Build a list of items from the database..
        var itemTables = ['item_armor', 'item_basic', 'item_furnishing', 'item_puppet', 'item_usable', 'item_weapon'];
        itemTables.forEach(function (i) {
            tasks.push(function (callback) {
                const sql = 'SELECT itemid, name FROM ' + i + ' WHERE name LIKE ?;';
                arcanus.db.query(sql, ['%' + name + '%'], function (err, rows) {
                    if (err)
                        return callback(err);

                    // Store the found items..
                    rows.forEach(function (item) {
                        if (seenItemId.indexOf(item.itemid) <= -1) {
                            seenItemId.push(item.itemid);
                            items.push({ id: item.itemid, name: item.name });
                        }
                    });

                    return callback();
                });
            });
        });

        // Perform the queries to obtain the items..
        async.series(tasks, function (err) {
            return done(err ? new Error('Failed to obtain items.') : null, err ? null : items);
        });
    };

    /**
     * Obtains an item by its id.
     *
     * @param {number} itemid                   The id number of the item to obtain.
     * @param {boolean} isAdmin                 Boolean if the request was made by an admin.
     * @param {function} done                   The callback to invoke when the function has completed.
     */
    ItemModule.getItemById = function (itemid, isAdmin, done) {
        var item = null;
        var items = [];
        var tasks = [];

        // Locate the item in the specific database table it will be contained in..
        var queries = [
            'SELECT itemid, name, level, jobs, shieldsize, scripttype, slot, rslot FROM item_armor WHERE itemid = ?;',
            'SELECT itemid, subid, name, sortname, stacksize, flags, ah, nosale, basesell FROM item_basic WHERE itemid = ?;',
            'SELECT itemid, name, storage, moghancement, element, aura FROM item_furnishing WHERE itemid = ?;',
            'SELECT itemid, name, slot, element FROM item_puppet WHERE itemid = ?;',
            'SELECT itemid, name, validtargets, activation, animation, animationtime, maxcharges, usedelay, reusedelay, aoe FROM item_usable WHERE itemid = ?;',
            'SELECT itemid, name, skill, subskill, dmgtype, hit, delay, dmg, unlock_points FROM item_weapon WHERE itemid = ?;'
        ];

        // Query for the items that match this item id..
        // We check every table because an item can be within multiple tables.
        queries.forEach(function (sql) {
            tasks.push(function (callback) {
                arcanus.db.query(sql, [itemid], function (err, rows) {
                    if (err)
                        return callback(err);

                    rows.forEach(function (i) {
                        items.push(i);
                    });

                    return callback();
                });
            });
        });

        // Merge the found items into a single 'super' item..
        tasks.push(function (callback) {
            items.forEach(function (i) {
                // Set the main item if we have none..
                if (item == null) {
                    item = i;
                    item.mods = [];
                } else {
                    // Merge the item together..
                    Object.keys(i).forEach(function (k) {
                        item[k] = i[k];
                    });
                }
            });

            return callback();
        });

        // Query for the item mods..
        tasks.push(function (callback) {
            if (item == null)
                return callback(new Error('Failed to obtain item.'));

            if (!isAdmin)
                return callback();

            arcanus.db.query('SELECT modid, value FROM item_mods WHERE itemid = ?;', [item.itemid], function (err, rows) {
                if (err)
                    return callback(err);

                rows.forEach(function (m) {
                    item.mods.push(m);
                });

                return callback();
            });
        });

        // Query for the item mods (pet mods)..
        tasks.push(function (callback) {
            if (item == null)
                return callback(new Error('Failed to obtain item.'));

            if (!isAdmin)
                return callback();

            arcanus.db.query('SELECT modid, value FROM item_mods_pet WHERE itemid = ?;', [item.itemid], function (err, rows) {
                if (err)
                    return callback(err);

                rows.forEach(function (m) {
                    item.mods.push(m);
                });

                return callback();
            });
        });

        // Query for the crafts this item is a result of..
        tasks.push(function (callback) {
            if (item == null)
                return callback(new Error('Failed to obtain item.'));

            arcanus.db.query('SELECT * FROM synth_recipes WHERE Result = ? OR ResultHQ1 = ? or ResultHQ2 = ? OR ResultHQ3 = ?;', [item.itemid, item.itemid, item.itemid, item.itemid], function (err, rows) {
                if (err)
                    return callback(err);

                item.crafts = [];

                // Build the crafts for this item..
                rows.forEach(function (c) {
                    var craft = buildCraftInformation(c);
                    item.crafts.push(craft);
                });

                return callback();
            });
        });

        // Query for the monsters that drop this item..
        tasks.push(function (callback) {
            const sql = `SELECT sp.mobid, dl.itemrate, g.zoneid, sp.mobname, sp.polutils_name, sp.pos_x, sp.pos_y, sp.pos_z, z.name AS zonename FROM mob_droplist as dl
                         LEFT JOIN mob_groups AS g ON dl.dropid = g.dropid
                         LEFT JOIN mob_spawn_points AS sp ON g.groupid = sp.groupid
                         LEFT JOIN zone_settings AS z ON g.zoneid = z.zoneid
                         WHERE itemid = ? ORDER BY polutils_name ASC;`;

            item.drops = [];

            arcanus.db.query(sql, [item.itemid], function (err, rows) {
                if (err)
                    return callback();

                rows.forEach(function (r) {
                    item.drops.push(r);
                });

                return callback();
            });
        });

        // Query for the monsters that drop this item (scripted)..
        tasks.push(function (callback) {
            const sql = `SELECT sp.mobid, dl.itemrate, g.zoneid, sp.mobname, sp.polutils_name, sp.pos_x, sp.pos_y, sp.pos_z, z.name AS zonename FROM mob_droplist_scripted as dl
                         LEFT JOIN mob_groups AS g ON dl.dropid = g.dropid
                         LEFT JOIN mob_spawn_points AS sp ON g.groupid = sp.groupid
                         LEFT JOIN zone_settings AS z ON g.zoneid = z.zoneid
                         WHERE itemid = ? ORDER BY polutils_name ASC;`;

            arcanus.db.query(sql, [item.itemid], function (err, rows) {
                if (err)
                    return callback();

                rows.forEach(function (r) {
                    item.drops.push(r);
                });

                return callback();
            });
        });

        // Query for players with this item in their bazaar..
        tasks.push(function (callback) {
            const sql = `SELECT c.charid, c.charname, ci.itemid, ci.bazaar, COALESCE(ita.name,itb.name,itf.name,itp.name,itw.name) AS itemname FROM char_inventory AS ci
                         LEFT JOIN item_armor AS ita ON ci.itemid = ita.itemid
                         LEFT JOIN item_basic AS itb ON ci.itemid = itb.itemid
                         LEFT JOIN item_furnishing AS itf ON ci.itemid = itf.itemid
                         LEFT JOIN item_puppet AS itp ON ci.itemid = itp.itemid
                         LEFT JOIN item_weapon AS itw ON ci.itemid = itw.itemid
                         LEFT JOIN chars AS c on c.charid = ci.charid
                         WHERE ci.bazaar > 0 AND ci.itemid = ?
                         ORDER BY ci.bazaar ASC;`

            item.bazaar = [];

            arcanus.db.query(sql, [item.itemid], function (err, rows) {
                if (err)
                    return callback();

                rows.forEach(function (r) {
                    item.bazaar.push(r);
                });

                return callback();
            });
        });

        // Allow admins to see more AH history..
        var amount = 10;
        if (isAdmin) {
            amount = 100;
        }

        // Query for auction history of this item..
        tasks.push(function (callback) {
            const sql = `SELECT ah.itemid, ah.seller_name, ah.buyer_name, ah.sale, ah.sell_date, COALESCE(ita.name,itb.name,itf.name,itp.name,itw.name) AS itemname FROM auction_house AS ah
                         LEFT JOIN item_armor AS ita ON ah.itemid = ita.itemid
                         LEFT JOIN item_basic AS itb ON ah.itemid = itb.itemid
                         LEFT JOIN item_furnishing AS itf ON ah.itemid = itf.itemid
                         LEFT JOIN item_puppet AS itp ON ah.itemid = itp.itemid
                         LEFT JOIN item_weapon AS itw ON ah.itemid = itw.itemid
                         WHERE ah.itemid = ? AND ah.sell_date != 0
                         ORDER BY ah.sell_date DESC LIMIT ?;`;

            item.ahhistory = [];

            arcanus.db.query(sql, [item.itemid, amount], function (err, rows) {
                if (err)
                    return callback(err);

                // Set the item auction history..
                rows.forEach(function (r) {
                    item.ahhistory.push(r);
                });

                return callback();
            });
        });

        // Query for auction stock amount..
        tasks.push(function (callback) {
            const sql = `SELECT COUNT(*) AS count FROM auction_house WHERE itemid = ? AND sell_date = 0;`;
            arcanus.db.query(sql, [item.itemid], function (err, rows) {
                if (err)
                    item.ahstock = 0;
                else
                    item.ahstock = rows[0]['count'];

                return callback();
            });
        });

        // Perform the queries..
        async.series(tasks, function (err) {
            return done(err ? new Error('Failed to obtain the item.') : null, err ? null : item);
        });
    };

    // Return the item module..
    return ItemModule;
};