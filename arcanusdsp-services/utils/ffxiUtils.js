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

var sprintf = require('sprintf-js').sprintf;

/**
 * Converts the given job abbreviation to its id.
 *
 * @param {String} abbr                 The job abbreviation to convert.
 * @returns {Number}                    The job id.
 */
module.exports.getJobIdByAbbr = function (abbr) {
    const jobs = {
        '': 0,
        'war': 1,
        'mnk': 2,
        'whm': 3,
        'blm': 4,
        'rdm': 5,
        'thf': 6,
        'pld': 7,
        'drk': 8,
        'bst': 9,
        'brd': 10,
        'rng': 11,
        'sam': 12,
        'nin': 13,
        'drg': 14,
        'smn': 15,
        'blu': 16,
        'cor': 17,
        'pup': 18,
        'dnc': 19,
        'sch': 20,
        'geo': 21,
        'run': 22
    };
    return jobs[abbr];
};

/**
 * Converts the given job id to its abbreviation.
 *
 * @param {Number} id                   The job id to convert.
 * @returns {String}                    The job abbreviation.
 */
module.exports.getJobAbbrById = function (id) {
    const jobs = {
        0: '',
        1: 'war',
        2: 'mnk',
        3: 'whm',
        4: 'blm',
        5: 'rdm',
        6: 'thf',
        7: 'pld',
        8: 'drk',
        9: 'bst',
        10: 'brd',
        11: 'rng',
        12: 'sam',
        13: 'nin',
        14: 'drg',
        15: 'smn',
        16: 'blu',
        17: 'cor',
        18: 'pup',
        19: 'dnc',
        20: 'sch',
        21: 'geo',
        22: 'run'
    };
    return jobs[id] || '';
};

/**
 * Converts the linkshell color to a valid Html color code.
 *
 * @private
 * @static
 * @param {Number} color                The color code to convert.
 * @returns {String}                    The converted color code.
 */
module.exports.getLinkshellHtmlColor = function (color) {
    if (!color || color === 0) {
        return 'transparent';
    }

    // Convert the given color to proper Html color (rgb)..
    const c = parseInt(color);
    const r = (((c & 0x0F) << 4) + 0x0F);
    const g = (((c >> 0x04) & 0x0F) << 0x04) + 0x0F;
    const b = (((c >> 0x08) & 0x0F) << 0x04) + 0x0F;
    return sprintf('#%02X%02X%02X', r, g, b);
};

/**
 * Converts the itemid to the linkshell rank.
 *
 * @param {Number} itemid               The item id.
 * @returns {Number}                    The linkshell rank based on the item id.
 */
module.exports.getLinkshellRankByItemId = function (itemid) {
    switch (itemid) {
        case 513: // Linkshell
            return 1;
        case 514: // Linksack
            return 2;
        case 515: // Linkpearl
            return 3;
    }
    return 0;
};