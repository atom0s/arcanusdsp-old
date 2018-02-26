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
 * Exposes functions related to DarkStar monsters.
 *
 * @param {object} arcanus                      The arcanus application instance.
 */
module.exports = function (arcanus) {
    var MonsterModule = {};

    /**
     * (Internal) Obtains a monsters health value based on the database information.
     *
     * @param lvl
     * @param hp
     * @param familyhp
     * @param isNM
     * @param scaleModAmount
     * @returns {number}
     */
    var getMonstersHealth = function (lvl, hp, familyhp, isNM, scaleModAmount) {
        var maxhp = 0;

        var map_config_nm_multiplier = 1.1;
        var map_config_mob_multiplier = 1.0;

        // If the monster has no health, calculate it..
        if (hp == 0) {
            var base = 18.0;
            var growth = 1.06;
            var scale = familyhp / 100.0;

            // TODO: Handle the scaleModAmount here!
            // hpScale = getMobMod(MOBMOD_HP_SCALE) / 100.0f

            if (lvl > 75)
                growth = 1.28;
            else if (lvl > 65)
                growth = 1.27;
            else if (lvl > 55)
                growth = 1.25;
            else if (lvl > 50)
                growth = 1.21;
            else if (lvl > 45)
                growth = 1.17;
            else if (lvl > 35)
                growth = 1.14;
            else if (lvl > 25)
                growth = 1.1;

            maxhp = Math.floor(base * Math.pow(lvl, growth) * scale);

            if (isNM) {
                maxhp *= 2.0;
                if (lvl > 75)
                    maxhp *= 2.5;
            }
        } else {
            maxhp = hp;
        }

        if (isNM)
            maxhp *= map_config_nm_multiplier;
        else
            maxhp *= map_config_mob_multiplier;

        return Math.floor(maxhp);
    };

    /**
     * Obtains a list of monsters that match the partial name.
     *
     * @param {string} name                     The name to lookup.
     * @param {function} done                   The callback function to continue the request chain.
     */
    MonsterModule.getMonstersByName = function (name, done) {
        // Clean the name for database searching..
        name = name.replace(/ /g, '_');
        name = name.replace(/'/g, '');
        name = name.replace(/"/g, '');

        // Ensure we have a 4 char length name..
        if (name.length < 3) {
            return done(new Error('Monster name must be longer than 3 characters.'), null, 'test');
        }

        var tasks = [];
        var monsters = [];

        // Query for a list of monsters with the matching name.
        tasks.push(function (callback) {
            const sql = `SELECT mobid, mobname, polutils_name, zs.name AS zonename FROM mob_spawn_points AS sp
                         INNER JOIN mob_groups AS mg ON sp.groupid = mg.groupid
                         INNER JOIN zone_settings AS zs ON mg.zoneid = zs.zoneid
                         WHERE mobname LIKE ? ORDER BY mobname ASC;`;

            arcanus.db.query(sql, ['%' + name + '%'], function (err, rows) {
                if (err)
                    return callback(err);

                rows.forEach(function (mob) {
                    monsters.push(mob);
                });

                return callback();
            });
        });

        async.series(tasks, function (err) {
            return done(err ? 'Failed to obtain monster list.' : null, err ? null : monsters);
        });
    };

    /**
     * Obtains a monster by their id.
     *
     * @param {number} mobid                    The monster id to obtain data for.
     * @param {boolean} isAdmin                 Boolean if the request was made by an admin.
     * @param {function} done                   The callback function to continue the request chain.
     */
    MonsterModule.getMonsterById = function (mobid, isAdmin, done) {
        var monster = {};
        var tasks = [];

        // Query the base monster to obtain their basic stats.
        tasks.push(function (callback) {
            const sql = `SELECT sp.*, mg.*, mfs.HP as familyHP, mp.mobType, zs.zoneid AS zoneid, zs.name AS zonename FROM mob_spawn_points AS sp
                         INNER JOIN mob_groups AS mg ON sp.groupid = mg.groupid
                         INNER JOIN zone_settings AS zs ON mg.zoneid = zs.zoneid
                         INNER JOIN mob_pools AS mp ON mp.poolid = mg.poolid
                         INNER JOIN mob_family_system AS mfs ON mfs.familyid = mp.familyid
                         WHERE mobid = ? LIMIT 1;`;

            arcanus.db.query(sql, [mobid], function (err, row) {
                if (err)
                    return callback(err);
                if (row.length === 0 || row[0].mobid == null)
                    return callback(new Error('Invalid monster id given.'));

                // Set the base monster..
                monster = {
                    mobid: row[0].mobid,
                    dropid: row[0].dropid,
                    groupid: row[0].groupid,
                    name: row[0].polutils_name,
                    familyhp: row[0].familyHP,
                    hp: row[0].HP,
                    mp: row[0].MP,
                    minlevel: row[0].minLevel,
                    maxlevel: row[0].maxLevel,
                    mobtype: row[0].mobType,
                    poolid: row[0].poolid,
                    pos_x: row[0].pos_x,
                    pos_y: row[0].pos_y,
                    pos_z: row[0].pos_z,
                    respawntime: row[0].respawntime,
                    spawntype: row[0].spawntype,
                    zoneid: row[0].zoneid,
                    zonename: row[0].zonename
                };

                return callback();
            });
        });

        // Query for the monsters drops.
        tasks.push(function (callback) {
            const sql = `SELECT dl.itemid, dl.itemrate, COALESCE(ita.name, itb.name, itf.name, itp.name, itw.name) AS itemname FROM mob_droplist AS dl
                         LEFT JOIN item_armor AS ita ON dl.itemid = ita.itemid
                         LEFT JOIN item_basic AS itb ON dl.itemid = itb.itemid
                         LEFT JOIN item_furnishing AS itf ON dl.itemid = itf.itemid
                         LEFT JOIN item_puppet AS itp ON dl.itemid = itp.itemid
                         LEFT JOIN item_weapon AS itw ON dl.itemid = itw.itemid
                         WHERE dropid = ?;`;

            arcanus.db.query(sql, [monster.dropid], function (err, rows) {
                // Handle errors..
                if (err)
                    return callback(err);

                // Build the drop list..
                monster.drops = [];
                rows.forEach(function (drop) {
                    monster.drops.push(drop);
                });

                return callback();
            });
        });

        // Query for the monsters drops (scripted).
        tasks.push(function (callback) {
            const sql = `SELECT dl.itemid, dl.itemrate, COALESCE(ita.name, itb.name, itf.name, itp.name, itw.name) AS itemname FROM mob_droplist_scripted AS dl
                         LEFT JOIN item_armor AS ita ON dl.itemid = ita.itemid
                         LEFT JOIN item_basic AS itb ON dl.itemid = itb.itemid
                         LEFT JOIN item_furnishing AS itf ON dl.itemid = itf.itemid
                         LEFT JOIN item_puppet AS itp ON dl.itemid = itp.itemid
                         LEFT JOIN item_weapon AS itw ON dl.itemid = itw.itemid
                         WHERE dropid = ?;`;

            arcanus.db.query(sql, [monster.dropid], function (err, rows) {
                // Handle errors..
                if (err)
                    return callback(err);

                // Build the drop list..
                rows.forEach(function (drop) {
                    monster.drops.push(drop);
                });

                return callback();
            });
        });

        // Calculate the monsters true health value.
        tasks.push(function (callback) {
            // Calculate the health..
            var isNM = (monster.mobtype & 0x02) == 0x02;
            var minhp = getMonstersHealth(monster.minlevel, monster.hp, monster.familyhp, monster.mobtype, 0);
            var maxhp = getMonstersHealth(monster.maxlevel, monster.hp, monster.familyhp, monster.mobtype, 0);

            // Store the health ranges into the monster data..
            monster.minhp = minhp;
            monster.maxhp = maxhp;

            return callback();
        });

        // Block monsters that are blacklisted from showing important information.
        tasks.push(function (callback) {
            var cfg = arcanus.config.monsterService || null;
            if (cfg === null || !(cfg.blocked instanceof Array))
                return callback();

            // Invalidate the monsters information..
            if (cfg.blocked.indexOf(mobid) !== -1 && !isAdmin) {
                monster.minlevel = 'super hard bro';
                monster.maxlevel = 'wtfhax';
                monster.pos_x = 'not';
                monster.pos_y = 'telling';
                monster.pos_z = 'you';
                monster.hp = '999999999';
                monster.mp = '999999999';
                monster.respawntime = 0;
                monster.drops = [];
            }

            return callback();
        });

        // Perform the queries to build the monster profile..
        async.series(tasks, function (err) {
            done(err ? new Error('Failed to obtain monster.') : null, err ? null : monster);
        });
    };

    // Return the monster module..
    return MonsterModule;
};