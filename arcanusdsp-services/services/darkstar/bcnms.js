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
 * Exposes functions related to DarkStar BCNMs.
 *
 * @param {object} arcanus                      The arcanus application instance.
 */
module.exports = function (arcanus) {
    var BcnmModule = {};

    /**
     * Gets a list of BCNMs.
     *
     * @param {boolean} isAdmin                 Boolean if the request was made by an admin.
     * @param {function} done                   The callback to invoke when the function has completed.
     */
    BcnmModule.getBcnmList = function (isAdmin, done) {
        const sql = `SELECT bcnmid, name, levelcap FROM bcnm_info
	                 ORDER BY name ASC;`;

        var cfg = arcanus.config.bcnmService || null;
        if (cfg === null || !(cfg.blocked instanceof Array))
            return done(new Error('Missing required bcnmService configurations!'));

        // Query the database for the BCNM list..
        arcanus.db.query(sql, [], function (err, rows) {
            if (err)
                return done(err, null);

            var bcnms = [];
            rows.forEach(function (r) {

                if (cfg.blocked.indexOf(r.bcnmid) !== -1) {
                    if (isAdmin)
                        bcnms.push(r);
                } else {
                    bcnms.push(r);
                }
            });

            return done(null, bcnms);
        });
    };

    /**
     * Gets a BCNM by its id.
     *
     * @param {number} bcnmid                   The id of the BCNM to obtain.
     * @param {boolean} isAdmin                 Boolean if the request was made by an admin.
     * @param {function} done                   The callback to invoke when the function has completed.
     */
    BcnmModule.getBcnmById = function (bcnmid, isAdmin, done) {
        var tasks = [];
        var bcnm = null;

        // Query for the bcnm's base information..
        tasks.push(function (callback) {
            const sql = `SELECT bc.*, zs.zoneid AS zoneid, zs.name AS zonename FROM bcnm_info AS bc
                         INNER JOIN zone_settings AS zs ON bc.zoneid = zs.zoneid
	                     WHERE bcnmid = ?`;

            // Check if this BCNM is blocked..
            var cfg = arcanus.config.bcnmService || null;
            if (cfg === null || !(cfg.blocked instanceof Array))
                return callback(new Error('Blocked BCNM was attempted to be loaded.'));

            // Block this bcnm from showing..
            if (cfg.blocked.indexOf(bcnmid) !== -1 && !isAdmin)
                return callback(new Error('Blocked BCNM was attempted to be loaded.'));

            arcanus.db.query(sql, [bcnmid], function (err, row) {
                if (err)
                    return callback(err);
                if (row == null || !row[0].bcnmId)
                    return callback(new Error('Invalid bcnm id; could not find the bcnm.'));

                // Construct the base bcnm object..
                bcnm = {
                    id: row[0].bcnmId,
                    name: row[0].name,
                    fastestName: row[0].fastestName,
                    fastestTime: row[0].fastestTime,
                    levelcap: row[0].levelCap,
                    lootid: row[0].lootDropId,
                    partysize: row[0].partySize,
                    rules: row[0].rules,
                    timelimit: row[0].timeLimit,
                    zoneid: row[0].zoneId,
                    zonename: row[0].zonename
                };

                return callback();
            });
        });

        // Query for the bcnm monsters list..
        tasks.push(function (callback) {
            const sql = `SELECT bf.*, msp.*, mg.*  FROM bcnm_battlefield AS bf
                         LEFT JOIN mob_spawn_points AS msp ON msp.mobid = bf.monsterId
                         LEFT JOIN mob_groups AS mg ON mg.groupid = msp.groupid
                         WHERE bcnmId = ?;`;

            arcanus.db.query(sql, [bcnm.id], function (err, rows) {
                if (err)
                    return callback(err);

                bcnm.monsters = [];
                rows.forEach(function (r) {
                    if (!bcnm.monsters[r.battlefieldNumber])
                        bcnm.monsters[r.battlefieldNumber] = [];
                    bcnm.monsters[r.battlefieldNumber].push(r);
                });

                return callback();
            });
        });

        // Query for the bcnm drop list..
        tasks.push(function (callback) {
            const sql = `SELECT bl.lootgroupid, bl.itemid AS itemid, bl.rolls AS rolls, COALESCE(ita.name, itb.name, itf.name, itp.name, itw.name) AS itemname FROM bcnm_loot AS bl
                         LEFT JOIN item_armor AS ita ON bl.itemid = ita.itemid
                         LEFT JOIN item_basic AS itb ON bl.itemid = itb.itemid
                         LEFT JOIN item_furnishing AS itf ON bl.itemid = itf.itemid
                         LEFT JOIN item_puppet AS itp ON bl.itemid = itp.itemid
                         LEFT JOIN item_weapon AS itw ON bl.itemid = itw.itemid
                         WHERE LootDropId = ?;`;

            arcanus.db.query(sql, [bcnm.lootid], function (err, rows) {
                if (err)
                    return callback(err);

                bcnm.drops = [];
                rows.forEach(function (r) {
                    if (!bcnm.drops[r.lootgroupid])
                        bcnm.drops[r.lootgroupid] = [];
                    bcnm.drops[r.lootgroupid].push(r);
                });

                return callback();
            });
        });

        // Run the tasks to obtain the bcnm..
        async.series(tasks, function (err) {
            if (err)
                return done(new Error('Failed to obtain the BCNM.'));
            return done(null, bcnm);
        });
    };

    // Return the bcnm module..
    return BcnmModule;
};