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
var ffxi = require('../../utils/ffxiUtils');

/**
 * Exposes functions related to DarkStar characters.
 *
 * @param {object} arcanus                          The arcanus application instance.
 */
module.exports = function (arcanus) {
    var CharacterModule = {};

    /**
     * Determines if the players nameflags have a GM flag enabled.
     * 
     * @param {int} flags                       The characters nameflags to test.
     * @return {bool}                           True if a flag is present, false otherwise. 
     */
    var hasGmFlag = function(flags) {
        // GM - PlayOnline
        if ((flags & 0x00010000) == 0x00010000)
            return true;
        // GM - Standard GM
        if ((flags & 0x04000000) == 0x04000000)
            return true;
        // GM - Senior
        if ((flags & 0x05000000) == 0x05000000)
            return true;
        // GM - Lead
        if ((flags & 0x06000000) == 0x06000000)
            return true;
        // GM - Producer
        if ((flags & 0x07000000) == 0x07000000)
            return true;
        return false;
    }

    /**
     * Gets a list of current online characters.
     *
     * @param {function} done                   The callback to invoke when the function has completed.
     */
    CharacterModule.getOnlineCharacters = function (done) {
        const sql = `SELECT c.charid, c.charname, cs.nameflags, c.pos_zone, c.gmlevel, ls1.name AS ls1name, ls2.name AS ls2name, ls1.color AS ls1color, ls2.color AS ls2color, s.linkshellrank1 AS ls1rank, s.linkshellrank2 AS ls2rank, cs.mjob, cs.sjob, cs.mlvl, cs.slvl, c.isnewplayer, c.mentor, cj.*, z.name AS zonename,
                     (SELECT COUNT(*) FROM char_vars AS cv WHERE cv.charid = c.charid AND cv.varname LIKE '%gmhidden%') AS ishidden
                     FROM accounts_sessions AS s
                     LEFT JOIN chars AS c ON s.charid = c.charid
                     LEFT JOIN linkshells AS ls1 ON s.linkshellid1 = ls1.linkshellid
                     LEFT JOIN linkshells AS ls2 ON s.linkshellid2 = ls2.linkshellid
                     LEFT JOIN char_stats AS cs ON s.charid = cs.charid
                     LEFT JOIN char_jobs AS cj ON s.charid = cj.charid
                     LEFT JOIN zone_settings AS z ON c.pos_zone = z.zoneid
                     ORDER BY c.gmlevel DESC, c.charname ASC;`;

        // Query the database for the online characters..
        arcanus.db.query(sql, function (err, rows) {
            if (err)
                return done(err, null);

            // Build a character for each online character..
            var characters = [];
            rows.forEach(function (c) {
                // Skip invalid characters..
                if (!arcanus.utils.isNonEmptyString(c.charname))
                    return;

                // Skip hidden players..
                if (c.ishidden >= 1)
                    return;

                // Hide players GM status if their flag is off..
                if (!hasGmFlag(c.nameflags))
                    c.gmlevel = 0;

                // Skip GMs that are anon (/anon)..
                if (((c.nameflags & 0x00001000) === 0x00001000) && c.gmlevel > 0)
                    return;

                // Convert the linkshell colors to html colors..
                c.ls1color = ffxi.getLinkshellHtmlColor(c.ls1color);
                c.ls2color = ffxi.getLinkshellHtmlColor(c.ls2color);

                // Build the characters jobs array..
                c.jobs = [];
                for (var x = 0; x < 23; x++) {
                    c.jobs.push({
                        id: x,
                        name: ffxi.getJobAbbrById(x),
                        level: c[ffxi.getJobAbbrById(x)]
                    });

                    if (x !== 0)
                        delete c[ffxi.getJobAbbrById(x)]
                }

                if (c.gmlevel > 0) {
                    c.ls1name = '';
                    c.ls2name = '';
                    c.ls1color= 0;
                    c.ls2color= 0;
                }
                
                // Add the player to the character list..
                characters.push(c);
            });

            characters.sort(function (char1, char2) {
                var nameorder = char1.charname === char2.charname ? 0 : (char1.charname < char2.charname ? -1 : 1);
                if ((char1.gmlevel > 0 && char2.gmlevel > 0) || (char1.gmlevel === 0 && char2.gmlevel === 0))
                    return nameorder;
                else if (char1.gmlevel > 0)
                    return -1;

                return 1;
            });

            // Get unique player count..
            var count = 0;
            const sql2 = `SELECT COUNT(DISTINCT(client_addr)) AS count FROM dspdb.accounts_sessions;`;
            arcanus.db.query(sql2, function (err, rows) {
                if (err)
                    return done(err, null);

                count = rows[0].count;

                // Return the online characters..
                return done(null, characters, count);
            });
        });
    };

    /**
     * Gets an accounts list of characters.
     *
     * @param {number} accid                    The account id to obtain the characters of.
     * @param {function} done                   The callback to invoke when the function has completed.
     */
    CharacterModule.getCharactersByAccountId = function (accid, done) {
        var chars = [];
        var tasks = [];

        const sql = `SELECT c.charid, c.charname, c.pos_zone, c.isnewplayer, c.mentor, cs.nameflags, cs.mjob, cs.sjob, cs.mlvl, cs.slvl, z.name AS zonename, cl.race, cl.face,
                     (SELECT COUNT(*) FROM accounts_sessions WHERE charid = c.charid) > 0 AS isonline
                     FROM chars AS c
                     LEFT JOIN char_look AS cl ON c.charid = cl.charid
                     LEFT JOIN char_stats AS cs ON c.charid = cs.charid
                     LEFT JOIN char_jobs AS cj ON c.charid = cj.charid
                     LEFT JOIN zone_settings AS z ON c.pos_zone = z.zoneid
                     WHERE c.accid = ? ORDER BY c.charname ASC;`;

        arcanus.db.query(sql, [accid], function (err, rows) {
            if (err)
                return done(err);

            rows.forEach(function (c) {
                tasks.push(function (callback) {
                    const sql = `SELECT l.linkshellid, l.name, l.color, ci.itemid, ci.slot, ce.equipslotid FROM linkshells AS l
	                             LEFT JOIN char_inventory AS ci ON ASCII(substr(CAST(ci.extra AS CHAR),1,4)) = l.linkshellid AND ci.location = 0
	                             LEFT JOIN char_equip AS ce ON ce.charid = ci.charid AND ce.slotid = ci.slot
                                 WHERE equipslotid > 0 AND ci.charid = ?;`;

                    arcanus.db.query(sql, [c.charid], function (err, rows) {
                        if (err)
                            return callback(err, null);

                        c.linkshells = [];
                        rows.forEach(function (l) {
                            var linkshell = {
                                id: l.linkshellid,
                                color: l.color,
                                name: l.name,
                                rank: ffxi.getLinkshellRankByItemId(l.itemid)
                            };
                            c.linkshells.push(l);
                        });

                        chars.push(c);
                        return callback();
                    });
                });
            });

            // Run the tasks to obtain the account characters..
            async.series(tasks, function (err) {
                if (err)
                    return done(err, null);
                return done(null, chars);
            });
        });
    };

    /**
     * Gets a list of characters by the given name.
     *
     * @param {string} name                     The partial name to search for characters with.
     * @param {function} done                   The callback to invoke when the function has completed.
     */
    CharacterModule.getCharactersByName = function (name, done) {
        arcanus.db.query('SELECT charid, charname FROM chars WHERE charname LIKE ? ORDER BY charname;', ['%' + name + '%'], function (err, rows) {
            if (err)
                return done(err, null);

            var characters = [];
            rows.forEach(function (c) {
                if (!c.charid || c.charid === 0)
                    return;
                if (!arcanus.utils.isNonEmptyString(c.charname))
                    return;

                // Prevent blocked characters from showing..
                var cfg = arcanus.config.characterService || null;
                if (cfg === null || !(cfg.blocked instanceof Array))
                    return;
                    
                if (cfg.blocked.indexOf(c.charid) === -1)
                    characters.push(c);
            });

            return done(null, characters);
        });
    };

    /**
     * Gets a characters profile by their character id.
     *
     * @param {number} charid                   The character id to obtain the profile for.
     * @param {boolean} isAdmin                 Boolean if the request was made by an admin.
     * @param {function} done                   The callback to invoke when the function has completed.
     */
    CharacterModule.getCharacterById = function (charid, isAdmin, done) {
        var character = null;
        var tasks = [];
        var isGmHidden = false;

        // 1. Query for the character to obtain their basic stats..
        tasks.push(function (callback) {
            const sql = `SELECT c.charid, c.accid, c.charname, c.nation, c.pos_zone, c.home_zone, c.gmlevel, c.isnewplayer, c.mentor, cl.face, cl.race, cl.size, cp.rank_sandoria, cp.rank_bastok, cp.rank_windurst,
                                cs.nameflags, cs.mjob, cs.sjob, cs.title, cs.mlvl, cs.slvl, COUNT(acs.charid) AS isonline, UNIX_TIMESTAMP(act.timelastmodify) AS timelastmodify,
                         (SELECT COUNT(*) FROM char_vars AS cv WHERE cv.charid = c.charid AND cv.varname LIKE '%gmhidden%') AS ishidden
                         FROM chars AS c
                         LEFT JOIN char_look AS cl ON c.charid = cl.charid
                         LEFT JOIN char_profile AS cp ON c.charid = cp.charid
                         LEFT JOIN char_stats AS cs ON c.charid = cs.charid
                         LEFT JOIN accounts_sessions AS acs ON c.charid = acs.charid
                         LEFT JOIN linkshells AS ls1 ON acs.linkshellid1 = ls1.linkshellid
                         LEFT JOIN linkshells AS ls2 ON acs.linkshellid2 = ls2.linkshellid
                         LEFT JOIN accounts AS act ON c.accid = act.id
                         WHERE c.charid = ?
                         LIMIT 1;`;

            arcanus.db.query(sql, [charid], function (err, row) {
                if (err)
                    return callback(err);
                if (row == null || !row[0].charid)
                    return callback(new Error('Invalid character id; no found character.'));

                // Prevent blocked characters from showing..
                var cfg = arcanus.config.characterService || null;
                if (cfg === null || !(cfg.blocked instanceof Array))
                    return callback(new Error('Invalid service configuration detected.'));
                if (cfg.blocked.indexOf(row[0].charid) !== -1)
                    return callback(new Error('Invalid character id; no found character.'));

                // Prepare the character object..
                character = row[0];
                character.ahhistory = [];
                character.bazaar = [];
                character.crafts = [];
                character.equipment = {};
                character.jobs = [{ id: 0, name: '', level: 0 }];
                character.jobsrows = [];
                character.gmlevel = row[0].gmlevel;
                
                if (row[0].ishidden >= 1)
                    isGmHidden = true;
                
                delete character.ishidden;
                delete character.gmlevel;
                
                character.timelastmodify = row[0].timelastmodify * 1000;

                // Set the characters default rank..
                switch (character.nation) {
                    case 0:
                        character.rank = character.rank_sandoria;
                        break;
                    case 1:
                        character.rank = character.rank_bastok;
                        break;
                    case 2:
                        character.rank = character.rank_windurst;
                        break;
                    default:
                        character.rank = 0;
                        break;
                }

                return callback();
            });
        });

        // 2. Query for the characters equipment..
        tasks.push(function (callback) {
            const sql = `SELECT ce.equipslotid, ci.itemid, COALESCE(ita.name,itb.name,itf.name,itp.name,itw.name) AS itemname FROM char_equip AS ce
                         LEFT JOIN char_inventory AS ci ON ce.charid = ci.charid AND ce.containerid = ci.location AND ce.slotid = ci.slot
                         LEFT JOIN item_armor AS ita ON ci.itemid = ita.itemid
                         LEFT JOIN item_basic AS itb ON ci.itemid = itb.itemid
                         LEFT JOIN item_furnishing AS itf ON ci.itemid = itf.itemid
                         LEFT JOIN item_puppet AS itp ON ci.itemid = itp.itemid
                         LEFT JOIN item_weapon AS itw ON ci.itemid = itw.itemid
                         WHERE ce.charid = ? ORDER BY equipslotid ASC;`;

            arcanus.db.query(sql, [charid], function (err, rows) {
                if (err)
                    return callback(err);

                // Prepare the default equipment slots..
                for (var x = 0; x < 16; x++) {
                    character.equipment[x] = { equipslotid: x, itemid: 0 };
                }

                // Set the characters equipment..
                rows.forEach(function (e) {
                    character.equipment[e.equipslotid] = e;
                });

                return callback();
            });
        });

        // 3. Query for the characters job information..
        tasks.push(function (callback) {
            const sql = `SELECT cj.unlocked AS unlocked_jobs, cj.war, cj.mnk, cj.whm, cj.blm, cj.rdm, cj.thf, cj.pld, cj.drk, cj.bst, cj.brd, cj.rng, cj.sam, cj.nin, cj.drg, cj.smn, cj.blu, cj.cor, cj.pup, cj.dnc, cj.sch, cj.geo, cj.run
                         FROM char_jobs AS cj WHERE charid = ?;`;

            arcanus.db.query(sql, [charid], function (err, rows) {
                if (err)
                    return callback(err);

                // Build the characters jobs array..
                Object.keys(rows[0]).forEach(function (r) {
                    if (r === 'unlocked_jobs')
                        return;
                    character.jobs.push({ id: ffxi.getJobIdByAbbr(r), name: r, level: rows[0][r] });
                });

                // Build the display rows for html viewing..
                var row;
                for (var x = 1, y = character.jobs.length; x < y; x++) {
                    if (x === 0)
                        continue;

                    if ((x - 1) % 2 === 0) {
                        if (row) {
                            character.jobsrows.push(row);
                        }
                        row = [];
                    }

                    if (row)
                        row.push(character.jobs[x]);
                }

                // Push left-over rows..
                if (row)
                    character.jobsrows.push(row);

                return callback();
            });
        });

        // 4. Query for the characters crafting information..
        tasks.push(function (callback) {
            const sql = `SELECT skillid AS id, CAST((value / 10) AS UNSIGNED) AS level
                         FROM char_skills
                         WHERE skillid IN (48, 49, 50, 51, 52, 53, 54, 55, 56, 57) AND charid = ?;`;

            arcanus.db.query(sql, [charid], function (err, rows) {
                if (err)
                    return callback(err);

                const crafts = {
                    48: 'Fishing',
                    49: 'Woodworking',
                    50: 'Smithing',
                    51: 'Goldsmithing',
                    52: 'Clothcraft',
                    53: 'Leathercraft',
                    54: 'Bonecraft',
                    55: 'Alchemy',
                    56: 'Cooking',
                    57: 'Synergy'
                };

                // Set the characters crafts..
                for (var c in crafts) {
                    if (crafts.hasOwnProperty(c)) {
                        character.crafts.push({ id: parseInt(c), name: crafts[c], level: 0 });
                    }
                }

                // Fill the crafts array data..
                rows.forEach(function (c) {
                    for (var x = 0; x < character.crafts.length; x++) {
                        if (character.crafts[x].id === c.id) {
                            character.crafts[x].level = c.level;
                        }
                    }
                });

                return callback();
            });
        });

        // 5. Query for the characters auction history..
        tasks.push(function (callback) {
            const sql = `SELECT ah.itemid, ah.seller_name, ah.buyer_name, ah.sale, ah.sell_date, COALESCE(ita.name,itb.name,itf.name,itp.name,itw.name) AS itemname FROM auction_house AS ah
                         LEFT JOIN item_armor AS ita ON ah.itemid = ita.itemid
                         LEFT JOIN item_basic AS itb ON ah.itemid = itb.itemid
                         LEFT JOIN item_furnishing AS itf ON ah.itemid = itf.itemid
                         LEFT JOIN item_puppet AS itp ON ah.itemid = itp.itemid
                         LEFT JOIN item_weapon AS itw ON ah.itemid = itw.itemid
                         WHERE ah.seller = ? OR ah.buyer_name = ? AND ah.sell_date != 0
                         ORDER BY ah.sell_date DESC LIMIT ?;`;

            // Allow admins to see extended history..
            var amount = 10;
            if (isAdmin) {
                amount = 75;
            }

            arcanus.db.query(sql, [charid, character.charname, amount], function (err, rows) {
                if (err)
                    return callback(err);

                // Set the characters auction history..
                rows.forEach(function (r) {
                    character.ahhistory.push(r);
                });

                return callback();
            });
        });

        // 6. Query for the characters bazaar information..
        tasks.push(function (callback) {
            const sql = `SELECT ci.itemid, ci.quantity, ci.bazaar, COALESCE(ita.name,itb.name,itf.name,itp.name,itw.name) AS itemname FROM char_inventory AS ci
                         LEFT JOIN item_armor AS ita ON ci.itemid = ita.itemid
                         LEFT JOIN item_basic AS itb ON ci.itemid = itb.itemid
                         LEFT JOIN item_furnishing AS itf ON ci.itemid = itf.itemid
                         LEFT JOIN item_puppet AS itp ON ci.itemid = itp.itemid
                         LEFT JOIN item_weapon AS itw ON ci.itemid = itw.itemid
                         WHERE ci.charid = ? AND bazaar > 0
                         ORDER BY ci.slot;`;

            arcanus.db.query(sql, [charid], function (err, rows) {
                if (err)
                    return callback(err);

                // Set the characters bazaar items..
                rows.forEach(function (r) {
                    character.bazaar.push(r);
                });

                return callback();
            });
        });

        // 7. Query for the characters linkshells..
        tasks.push(function (callback) {
            const sql = `SELECT l.linkshellid, l.name, l.color, ci.itemid, ci.slot, ce.equipslotid FROM linkshells AS l
                         LEFT JOIN char_inventory AS ci ON CONV(HEX(REVERSE(SUBSTRING(ci.extra, 1, 4))), 16, 10) = l.linkshellid AND ci.location = 0
                         LEFT JOIN char_equip AS ce ON ce.charid = ci.charid AND ce.slotid = ci.slot AND ce.containerid = 0
                         WHERE ce.equipslotid > 0 AND ci.itemid IN (513,514,515) AND ci.charid = ?;`;
            arcanus.db.query(sql, [charid], function (err, rows) {
                if (err)
                    return callback(err, null);

                character.linkshells = [];
                rows.forEach(function (l) {
                    var linkshell = {
                        id: l.linkshellid,
                        color: ffxi.getLinkshellHtmlColor(l.color),
                        name: l.name,
                        rank: ffxi.getLinkshellRankByItemId(l.itemid)
                    };

                    character.linkshells.push(linkshell);
                });

                if (isGmHidden == true) {
                    character.linkshells = [];
                }
                
                return callback();
            });
        });
        
        // Run the queries to build the character profile..
        async.series(tasks, function (err) {
            return done(err ? new Error('Failed to obtain character profile.') : null, err ? null : character);
        });
    };

    /**
     * Frees a stuck character.
     * @param {number} accid                    The account id of the character to free.
     * @param {number} charid                   The character id of the character to free.
     * @param {function} done                   The callback to invoke when the function has completed.
     */
    CharacterModule.unstuckCharacter = function (accid, charid, done) {
        const sql = `SELECT c.accid, c.charid, c.charname, c.home_zone, c.pos_zone, c.pos_prevzone, c.pos_rot, c.pos_x, c.pos_y, c.pos_z, c.home_rot, c.home_x, c.home_y, c.home_z, COUNT(ab.accid) AS bans FROM chars AS c
	                 LEFT JOIN accounts_banned AS ab ON ab.accid = c.accid
	                 WHERE c.accid = ? AND c.charid = ?;`;

        arcanus.db.query(sql, [accid, charid], function (err, rows) {
            if (err)
                return done(new Error('There was an error trying to free your character.'));
            if (rows.length === 0)
                return done(new Error('No character was found; cannot continue!'));

            // Ensure the character is not in jail..
            if (rows[0].pos_zone === 131)
                return done(new Error('Cannot free your character; you are in jail.'));

            // Void zone fix.. (loldspbug)
            var homeZone = rows[0].home_zone;
            var prevZone = rows[0].pos_prevzone;
            if (prevZone === 0)
                prevZone = homeZone;

            // Free the character..
            arcanus.db.query('UPDATE chars SET pos_zone = ?, pos_prevzone = ?, pos_rot = ?, pos_x = ?, pos_y = ?, pos_z = ? WHERE charid = ?;',
                [homeZone, prevZone, rows[0].home_rot, rows[0].home_x, rows[0].home_y, rows[0].home_z, charid], function (err, results) {
                    if (err)
                        return done(new Error('There was an error while trying to free your character.'));

                    return done(null, true);
                });
        });
    };

    // Return the character module..
    return CharacterModule;
};