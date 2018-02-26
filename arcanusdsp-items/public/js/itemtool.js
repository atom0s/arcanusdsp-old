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

// Obtain the arcanusdsp angular module..
var arcanusdsp = angular.module('arcanusdsp');

/**
 * Item Tool Controller
 *
 * Angular controller used to interact with the various item specific pages that
 * are added to the arcanusdsp website via the arcanusdsp-items plugin.
 *
 * @author atom0s <atom0s@live.com>
 * @copyright Copyright (C) 2015-2016 atom0s [atom0s@live.com]
 */
arcanusdsp.controller('itemToolController', ['$filter', '$http', '$sce', '$scope', '$window', function ($filter, $http, $sce, $scope, $window) {
    $scope.itemResultsPage = 0;
    $scope.itemsLookupEnabled = true;
    $scope.items = null;
    $scope.itemLoading = false;
    $scope.item = null;

    /**
     * Gets a list of items with the partial matching name.
     *
     * @param {string} name             The partial name to match.
     */
    $scope.getItemsByName = function (name) {
        var opts = { method: 'GET', url: '/ajax/items', params: { name: name } };

        $scope.itemResultsPage = 0;
        $scope.itemsLookupEnabled = false;
        $scope.makeAjaxQuery(opts, function (err, result) {
            $scope.items = (err) ? [] : result;
            $scope.itemsLookupEnabled = true;
        });
    };

    /**
     * Gets an item by their item id.
     *
     * @param {number} itemid           The item id of the item to obtain.
     */
    $scope.getItemById = function (itemid) {
        var opts = { method: 'GET', url: '/ajax/item', params: { id: itemid } };

        $scope.itemLoading = true;
        $scope.makeAjaxQuery(opts, function (err, result) {
            $scope.item = (err) ? null : result;
            $scope.itemLoading = false;

            // Update the page title..
            document.querySelector('title').innerHTML = (err) ? 'Failed To Load Item!' : $filter('cleanNameTitleCase')($scope.item.name) + ' &bull; Viewing Item';
        });
    };
}]);

/**
 * pageCount (filter) - Determines the number of pages it would take to display the given data.
 *
 * @param {object} input            The input array to splice.
 * @param {number} pageSize         The item count to display on each page.
 * @returns {number}                The number of pages of the data.
 */
arcanusdsp.filter('pageCount', function () {
    return function (input, pageSize) {
        if (!Array.isArray(input))
            return input;

        var count = Math.ceil(input.length / pageSize);
        if (count == 0)
            count++;

        return count;
    };
});

/**
 * itemDamageType (filter) - Converts the given item dmg type to its string value.
 *
 * @param {object} val              The value to convert.
 * @returns {string}                The converted value.
 */
arcanusdsp.filter('itemDamageType', function () {
    return function (val) {
        const dmgType = ['None', 'Piercing', 'Slashing', 'Blunt', 'Hand-to-Hand', 'Crossbow', 'Gun'];
        return dmgType[val] || 'Unknown';
    };
});

/**
 * itemFlags (filter) - Converts the given item flags to its string value.
 *
 * @param {object} val              The value to convert.
 * @returns {string}                The converted value.
 */
arcanusdsp.filter('itemFlags', function () {
    return function (val) {
        var flags = [];

        if (val & 0x0001)
            flags.push('Wall Hanging');
        if (val & 0x0010)
            flags.push('Delivery Inner');
        if (val & 0x0020)
            flags.push('Inscribe');
        if (val & 0x0040)
            flags.push('No Auction');
        if (val & 0x0080)
            flags.push('Scroll');
        if (val & 0x0100)
            flags.push('Unknown');
        if (val & 0x0200)
            flags.push('Can Use');
        if (val & 0x0400)
            flags.push('Can Trade NPC');
        if (val & 0x0800)
            flags.push('Can Equip');
        if (val & 0x1000)
            flags.push('No Sale');
        if (val & 0x2000)
            flags.push('No Delivery');
        if (val & 0x4000)
            flags.push('Ex');
        if (val & 0x8000)
            flags.push('Rare');

        if (flags.length === 0)
            return 'None';

        return flags.join(', ');
    };
});

/**
 * itemSkillType (filter) - Converts the given item skill type to its string value.
 *
 * @param {object} val              The value to convert.
 * @returns {string}                The converted value.
 */
arcanusdsp.filter('itemSkillType', function () {
    return function (val) {
        const skillType = ['None', 'Hand-to-Hand', 'Dagger', 'Sword', 'Great Sword', 'Axe', 'Great Axe', 'Scythe', 'Polearm', 'Katana', 'Great Katana', 'Club', 'Staff'];
        return skillType[val] || 'Unknown';
    };
});

/**
 * itemSkillSubType (filter) - Converts the given item skill sub type to its string value.
 *
 * @param {object} val              The value to convert.
 * @returns {string}                The converted value.
 */
arcanusdsp.filter('itemSkillSubType', function () {
    return function (val) {
        const skillType = ['None / Bolt', 'Gun', 'Cannon'];
        return skillType[val] || 'Unknown';
    };
});

/**
 * itemSlots (filter) - Converts the given items slots to its string value.
 *
 * @param {object} val              The value to convert.
 * @returns {string}                The converted value.
 */
arcanusdsp.filter('itemSlots', function () {
    return function (val) {
        if (val === 0)
            return 'None';

        const slots = ['None', 'Main', 'Shield', 'Range', 'Ammo', 'Head', 'Body', 'Hands', 'Legs', 'Feet', 'Neck', 'Waist', 'L.Ear', 'R.Ear', 'L.Ring', 'R.Ring', 'Back'];
        var uslots = [];

        for (var x = 0; x < 16; x++) {
            if (val & (1 << (x - 1)))
                uslots.push(slots[x]);
        }

        if (uslots.length === 0)
            return 'None';

        return uslots.join(', ');
    };
});

/**
 * itemUsableJobs (filter) - Converts the given item jobs to its string value.
 *
 * @param {object} val              The value to convert.
 * @returns {string}                The converted value.
 */
arcanusdsp.filter('itemUsableJobs', function () {
    return function (val) {
        const jobs = ['', 'WAR', 'MNK', 'WHM', 'BLM', 'RDM', 'THF', 'PLD', 'DRK', 'BST', 'BRD', 'RNG', 'SAM', 'NIN', 'DRG', 'SMN', 'BLU', 'COR', 'PUP', 'DNC', 'SCH', 'GEO', 'RUN'];

        var ujobs = [];
        for (var x = 1; x < 23; x++) {
            if (val & (1 << (x - 1)))
                ujobs.push(jobs[x]);
        }

        if (ujobs.length === 0)
            return 'None';
        if (ujobs.length === 22)
            return 'All Jobs';

        return ujobs.join(', ');
    };
});

/**
 * itemValidTargets (filter) - Converts the given item valid targets to its string value.
 *
 * @param {object} val              The value to convert.
 * @returns {string}                The converted value.
 */
arcanusdsp.filter('itemValidTargets', function () {
    return function (val) {
        var targets = [];

        if (val & 0x0001)
            targets.push('Self');
        if (val & 0x0002)
            targets.push('Party');
        if (val & 0x0004)
            targets.push('Enemy');
        if (val & 0x0008)
            targets.push('Alliance');
        if (val & 0x0010)
            targets.push('Players');
        if (val & 0x0020)
            targets.push('Dead Players');
        if (val & 0x0040)
            targets.push('NPCs');

        if (targets.length === 0)
            return 'None';

        return targets.join(', ');
    };
});

/**
 * itemMod (filter) - Converts the given mod data to its string value.
 *
 * @param {object} val              The value to convert.
 * @returns {string}                The converted value.
 */
arcanusdsp.filter('itemMod', function () {
    return function (val) {
        const mods = {
            0: { "fmt": "Invalid item modification. (0x00)" },
            1: { "fmt": "DEF: %d" },
            2: { "fmt": "HP +%d" },
            3: { "fmt": "HP +%d%%" },
            4: { "fmt": "Converts %d MP to HP" },
            5: { "fmt": "MP +%d" },
            6: { "fmt": "MP +%d" },
            7: { "fmt": "Converts %d HP to MP" },
            8: { "fmt": "STR +%d" },
            9: { "fmt": "DEX +%d" },
            10: { "fmt": "VIT +%d" },
            11: { "fmt": "AGI +%d" },
            12: { "fmt": "INT +%d" },
            13: { "fmt": "MND +%d" },
            14: { "fmt": "CHR +%d" },
            15: { "fmt": "Fire Defense +%d" },
            16: { "fmt": "Ice Defense +%d" },
            17: { "fmt": "Wind Defense +%d" },
            18: { "fmt": "Earth Defense +%d" },
            19: { "fmt": "Lightning Defense +%d" },
            20: { "fmt": "Water Defense +%d" },
            21: { "fmt": "Light Defense +%d" },
            22: { "fmt": "Dark Defense +%d" },
            23: { "fmt": "Attack +%d" },
            24: { "fmt": "Ranged Attack +%d" },
            25: { "fmt": "Accuracy +%d" },
            26: { "fmt": "Ranged Accuracy +%d" },
            27: { "fmt": "Enmity +%d" },
            502: { "fmt": "Reduces Enmity Lost When Taking Damage +%d" },
            28: { "fmt": "Magic Attack +%d" },
            29: { "fmt": "Magic Defense +%d" },
            30: { "fmt": "Magic Accuracy +%d" },
            31: { "fmt": "Magic Evasion +%d" },
            32: { "fmt": "Fire Attack +%d" },
            33: { "fmt": "Ice Attack +%d" },
            34: { "fmt": "Wind Attack +%d" },
            35: { "fmt": "Earth Attack +%d" },
            36: { "fmt": "Lightning Attack +%d" },
            37: { "fmt": "Water Attack +%d" },
            38: { "fmt": "Light Attack +%d" },
            39: { "fmt": "Dark Attack +%d" },
            40: { "fmt": "Fire Accuracy +%d" },
            41: { "fmt": "Ice Accuracy +%d" },
            42: { "fmt": "Wind Accuracy +%d" },
            43: { "fmt": "Earth Accuracy +%d" },
            44: { "fmt": "Lightning Accuracy +%d" },
            45: { "fmt": "Water Accuracy +%d" },
            46: { "fmt": "Light Accuracy +%d" },
            47: { "fmt": "Dark Accuracy +%d" },
            48: { "fmt": "Weaponskill Accuracy +%d" },
            49: { "fmt": "Slash Resistance +%d" },
            50: { "fmt": "Pierce Resistance +%d" },
            51: { "fmt": "Impact Resistance +%d" },
            52: { "fmt": "Hand-to-Hand Resistance +%d" },
            54: { "fmt": "+%d Fire Resistance" },
            55: { "fmt": "+%d Ice Resistance" },
            56: { "fmt": "+%d Wind Resistance" },
            57: { "fmt": "+%d Earth Resistance" },
            58: { "fmt": "+%d Lightning Resistance" },
            59: { "fmt": "+%d Water Resistance" },
            60: { "fmt": "+%d Light Resistance" },
            61: { "fmt": "+%d Dark Resistance" },
            62: { "fmt": "%d%% Attack" },
            63: { "fmt": "%d%% Defense" },
            64: { "fmt": "%d%% Accuracy" },
            65: { "fmt": "%d%% Evasion" },
            66: { "fmt": "%d%% Ranged Attack" },
            67: { "fmt": "%d%% Ranged Attack Accuracy" },
            68: { "fmt": "Evasion +%d" },
            69: { "fmt": "Ranged Defense +%d" },
            70: { "fmt": "Ranged Evasion +%d" },
            71: { "fmt": "MP Recovered While Healing +%d" },
            72: { "fmt": "HP Recovered While Healing +%d" },
            73: { "fmt": "Increases TP Gain +%d" },
            486: { "fmt": "Tactical Parry TP Bonus +%d" },
            487: { "fmt": "Magic Burst Bonus +%d" },
            488: { "fmt": "Inhibits TP Gain +%d%%" },
            80: { "fmt": "Hand-to-Hand Skill +%d" },
            81: { "fmt": "Dagger Skill +%d" },
            82: { "fmt": "Sword Skill +%d" },
            83: { "fmt": "Great Sword Skill +%d" },
            84: { "fmt": "Axe Skill +%d" },
            85: { "fmt": "Great Axe Skill +%d" },
            86: { "fmt": "Scythe Skill +%d" },
            87: { "fmt": "Polearm Skill +%d" },
            88: { "fmt": "Katana Skill +%d" },
            89: { "fmt": "Great Katana Skill +%d" },
            90: { "fmt": "Club Skill +%d" },
            91: { "fmt": "Staff Skill +%d" },
            101: { "fmt": "Automaton Melee Skill +%d" },
            102: { "fmt": "Automaton Range Skill +%d" },
            103: { "fmt": "Automaton Magic Skill +%d" },
            104: { "fmt": "Archery Skill +%d" },
            105: { "fmt": "Marksman Skill +%d" },
            106: { "fmt": "Throw Skill +%d" },
            107: { "fmt": "Guard Skill +%d" },
            108: { "fmt": "Evasion Skill +%d" },
            109: { "fmt": "Shield Skill +%d" },
            110: { "fmt": "Parry Skill +%d" },
            111: { "fmt": "Divine Magic Skill +%d" },
            112: { "fmt": "Healing Magic Skill +%d" },
            113: { "fmt": "Enhancing Magic Skill +%d" },
            114: { "fmt": "Enfeebling Magic Skill +%d" },
            115: { "fmt": "Elemental Magic Skill +%d" },
            116: { "fmt": "Dark Magic Skill +%d" },
            117: { "fmt": "Summoning Magic Skill +%d" },
            118: { "fmt": "Ninjutsu Magic Skill +%d" },
            119: { "fmt": "Singing Magic Skill +%d" },
            120: { "fmt": "String Magic Skill +%d" },
            121: { "fmt": "Wind Magic Skill +%d" },
            122: { "fmt": "Blue Magic Skill +%d" },
            127: { "fmt": "Fishing Skill +%d" },
            128: { "fmt": "Woodworking Skill +%d" },
            129: { "fmt": "Smithing Skill +%d" },
            130: { "fmt": "Goldsmithing Skill +%d" },
            131: { "fmt": "Clothcraft Skill +%d" },
            132: { "fmt": "Leathercraft Skill +%d" },
            133: { "fmt": "Bonecraft Skill +%d" },
            134: { "fmt": "Alchemy Skill +%d" },
            135: { "fmt": "Cooking Skill +%d" },
            136: { "fmt": "Synergy Skill +%d" },
            137: { "fmt": "Riding Skill +%d" },
            144: { "fmt": "Woodworking Success Rate +%d%%" },
            145: { "fmt": "Smithing Success Rate +%d%%" },
            146: { "fmt": "Goldsmithing Success Rate +%d%%" },
            147: { "fmt": "Clothcraft Success Rate +%d%%" },
            148: { "fmt": "Leathercraft Success Rate +%d%%" },
            149: { "fmt": "Bonecraft Success Rate +%d%%" },
            150: { "fmt": "Alchemy Success Rate +%d%%" },
            151: { "fmt": "Cooking Success Rate +%d%%" },
            160: { "fmt": "Damage Taken +%d%%" },
            161: { "fmt": "Physical Damage Taken +%d%%" },
            162: { "fmt": "Breath Damage Taken +%d%%" },
            163: { "fmt": "Magic Damage Taken +%d%%" },
            164: { "fmt": "Range Damage Taken +%d%%" },
            387: { "fmt": "Uncapped Physical Damage Multiplier +%d" },
            388: { "fmt": "Uncapped Breath Damage Multiplier +%d" },
            389: { "fmt": "Uncapped Magic Damage Multiplier +%d" },
            390: { "fmt": "Uncapped Range Damage Multiplier +%d" },
            165: { "fmt": "Critical Hit Rate +%d" },
            421: { "fmt": "Critical Hit Damage +%d" },
            166: { "fmt": "Enemy Critical Hit Rate +%d" },
            167: { "fmt": "Haste\/Slow From Magic +%d" },
            383: { "fmt": "Haste\/Slow From Abilities +%d" },
            384: { "fmt": "Haste\/Slow From Equipment +%d" },
            168: { "fmt": "+%d%% Spell Interruption Rate" },
            169: { "fmt": "+%d%% Movement Speed" },
            170: { "fmt": "Increases Fast Cast +%d" },
            407: { "fmt": "Uncapped Fast Cast +%d" },
            171: { "fmt": "Delay +%d" },
            172: { "fmt": "Ranged Delay +%d" },
            173: { "fmt": "Hand-to-Hand Delay +%d" },
            174: { "fmt": "Skill Chain Bonus Damage +%d" },
            175: { "fmt": "Skill Chain Bonus Damage +%d" },
            311: { "fmt": "Increases Spell Damage +%d" },
            176: { "fmt": "(Food) HPP +%d" },
            177: { "fmt": "(Food) HP Cap +%d" },
            178: { "fmt": "(Food) MPP +%d" },
            179: { "fmt": "(Food) MP Cap +%d" },
            180: { "fmt": "(Food) Attack +%d" },
            181: { "fmt": "(Food) Attack Cap +%d" },
            182: { "fmt": "(Food) Defense +%d" },
            183: { "fmt": "(Food) Defense Cap +%d" },
            184: { "fmt": "(Food) Accuracy +%d" },
            185: { "fmt": "(Food) Accuracy Cap +%d" },
            186: { "fmt": "(Food) Ranged Attack +%d" },
            187: { "fmt": "(Food) Ranged Attack Cap +%d" },
            188: { "fmt": "(Food) Ranged Accuracy +%d" },
            189: { "fmt": "(Food) Ranged Accuracy Cap +%d" },
            224: { "fmt": "Enhances \"Vermin Killer\" Effect +%d" },
            225: { "fmt": "Enhances \"Bird Killer\" Effect +%d" },
            226: { "fmt": "Enhances \"Amorph Killer\" Effect +%d" },
            227: { "fmt": "Enhances \"Lizard Killer\" Effect +%d" },
            228: { "fmt": "Enhances \"Aquan Killer\" Effect +%d" },
            229: { "fmt": "Enhances \"Plantoid Killer\" Effect +%d" },
            230: { "fmt": "Enhances \"Beast Killer\" Effect +%d" },
            231: { "fmt": "Enhances \"Undead Killer\" Effect +%d" },
            232: { "fmt": "Enhances \"Arcana Killer\" Effect +%d" },
            233: { "fmt": "Enhances \"Dragon Killer\" Effect +%d" },
            234: { "fmt": "Enhances \"Demon Killer\" Effect +%d" },
            235: { "fmt": "Enhances \"Empty Killer\" Effect +%d" },
            236: { "fmt": "Enhances \"Humanoid Killer\" Effect +%d" },
            237: { "fmt": "Enhances \"Lumorian Killer\" Effect +%d" },
            238: { "fmt": "Enhances \"Luminion Killer\" Effect +%d" },
            240: { "fmt": "Enhances \"Resist Sleep\" Effect +%d" },
            241: { "fmt": "Enhances \"Resist Poison\" Effect +%d" },
            242: { "fmt": "Enhances \"Resist Paralyze\" Effect +%d" },
            243: { "fmt": "Enhances \"Resist Blind\" Effect +%d" },
            244: { "fmt": "Enhances \"Resist Silence\" Effect +%d" },
            245: { "fmt": "Enhances \"Resist Virus\" Effect +%d" },
            246: { "fmt": "Enhances \"Resist Petrify\" Effect +%d" },
            247: { "fmt": "Enhances \"Resist Bind\" Effect +%d" },
            248: { "fmt": "Enhances \"Resist Curse\" Effect +%d" },
            249: { "fmt": "Enhances \"Resist Gravity\" Effect +%d" },
            250: { "fmt": "Enhances \"Resist Slow\" Effect +%d" },
            251: { "fmt": "Enhances \"Resist Stun\" Effect +%d" },
            252: { "fmt": "Enhances \"Resist Charm\" Effect +%d" },
            253: { "fmt": "Enhances \"Resist Amnesia\" Effect +%d" },
            254: { "fmt": "(Placeholder) ModId: 0xFE, Value: %d" },
            255: { "fmt": "Enhances \"Resist KO\" Effect +%d" },
            257: { "fmt": "Paralyze Proc Rate +%d" },
            258: { "fmt": "Mijin Gakure Death Modification %d" },
            259: { "fmt": "Enhances \"Dual Wield\" Effect %d" },
            288: { "fmt": "(WAR) Enhances \"Double Attack\" Effect %d" },
            483: { "fmt": "(WAR) Enhances \"Warcry\" Effect %d" },
            289: { "fmt": "(MNK) Enhances \"Subtle Blow\" Effect %d" },
            291: { "fmt": "(MNK) Counter +%d" },
            292: { "fmt": "(MNK) Kick +%d" },
            428: { "fmt": "(MNK) Perfect Counter Attack +%d" },
            429: { "fmt": "(MNK) Footwork Attack Bonus +%d" },
            293: { "fmt": "(WHM) Afflatus Solace HP +%d" },
            294: { "fmt": "(WHM) Afflatus Misery HP +%d" },
            484: { "fmt": "(WHM) Enhances \"Auspice\" Effect %d" },
            295: { "fmt": "(BLM) Enhances \"Clear Mind\" %d" },
            296: { "fmt": "(BLM) Enhances \"Conserve MP\" %d" },
            299: { "fmt": "(RDM) Blink Shadow Tracking %d" },
            300: { "fmt": "(RDM) Stoneskin HP Pool %d" },
            301: { "fmt": "(RDM) Damage Reduction %d" },
            298: { "fmt": "(THF) Steal Success Chance %d" },
            302: { "fmt": "(THF) Enhances \"Triple Attack\" Effect %d" },
            303: { "fmt": "(THF) Treasure Hunter +%d" },
            426: { "fmt": "(PLD) Converts Damage to MP %d" },
            427: { "fmt": "(PLD) Reduce Enmity Decrease While Taking Physical Damage %d" },
            485: { "fmt": "(PLD) Shield Mastery (TP Bonus) While Blocking %d" },
            304: { "fmt": "(BST) Enhances \"Charm\" Effect (Tame) %d" },
            360: { "fmt": "(BST) Extends Charm Time %d" },
            364: { "fmt": "(BST) +%d%% Reward Bonus" },
            391: { "fmt": "(BST) Enhances \"Charm\" Effect %d" },
            503: { "fmt": "(BST) Increases Feral Howl Duration %d" },
            433: { "fmt": "(BRD) Enhances \"Minne\" Effect %d" },
            434: { "fmt": "(BRD) Enhances \"Minuet\" Effect %d" },
            435: { "fmt": "(BRD) Enhances \"Paeon\" Effect %d" },
            436: { "fmt": "(BRD) Enhances \"Requiem\" Effect %d" },
            437: { "fmt": "(BRD) Enhances \"Threnody\" Effect %d" },
            438: { "fmt": "(BRD) Enhances \"Madrigal\" Effect %d" },
            439: { "fmt": "(BRD) Enhances \"Mambo\" Effect %d" },
            440: { "fmt": "(BRD) Enhances \"Lullaby\" Effect %d" },
            441: { "fmt": "(BRD) Enhances \"Etude\" Effect %d" },
            442: { "fmt": "(BRD) Enhances \"Ballad\" Effect %d" },
            443: { "fmt": "(BRD) Enhances \"March\" Effect %d" },
            444: { "fmt": "(BRD) Enhances \"Finale\" Effect %d" },
            445: { "fmt": "(BRD) Enhances \"Carol\" Effect %d" },
            446: { "fmt": "(BRD) Enhances \"Mazurka\" Effect %d" },
            447: { "fmt": "(BRD) Enhances \"Elegy\" Effect %d" },
            448: { "fmt": "(BRD) Enhances \"Prelude\" Effect %d" },
            449: { "fmt": "(BRD) Enhances \"Hymnus\" Effect %d" },
            450: { "fmt": "(BRD) Enhances \"Virelai\" Effect %d" },
            451: { "fmt": "(BRD) Enhances \"Scherzo\" Effect %d" },
            452: { "fmt": "(BRD) Enhances \"All Songs\" Effect %d" },
            453: { "fmt": "(BRD) Increases Maximum Songs +%d" },
            454: { "fmt": "(BRD) Song Duration Bonus +%d" },
            455: { "fmt": "(BRD) Song Spellcasting Time %d" },
            305: { "fmt": "(RNG) Enhances \"Recycle\" Effect %d" },
            365: { "fmt": "(RNG) Enhances \"Snapshot\" Effect %d" },
            359: { "fmt": "(RNG) Enhances \"Rapid Shot\" Effect %d" },
            340: { "fmt": "(RNG) Widescan %d" },
            420: { "fmt": "(RNG) Increases Barrage Accuracy +%d" },
            422: { "fmt": "(RNG) Enhances \"Double Shot\" Effect %d" },
            423: { "fmt": "(RNG) Increases Snapshot While Velocity Shot Is Active %d" },
            424: { "fmt": "(RNG) Increases Ranged Attack While Velocity Shot Is Active %d" },
            425: { "fmt": "(RNG) Enhances \"Shadowbind\" Effect %d" },
            306: { "fmt": "(SAM) Enhances \"Zanshin\" EFfect %d" },
            307: { "fmt": "(NIN) Tracks Shadows %d" },
            308: { "fmt": "(NIN) Ninja Tool Expertise %d" },
            361: { "fmt": "(DRG) Increases TP Bonus While Jumping +%d" },
            362: { "fmt": "(DRG) Attack Bonus While Jumping +%d%%" },
            363: { "fmt": "(DRG) Increases Enmity Reduction While Jumping +%d" },
            371: { "fmt": "(SMN) Avatar Perpetuation %d" },
            372: { "fmt": "(SMN) Perpetuation Reduction (Weather) %d" },
            373: { "fmt": "(SMN) Perpetuation Reduction (Day) %d" },
            346: { "fmt": "(SMN) Perpetuation Reduction (Gear) %d" },
            357: { "fmt": "(SMN) Blood Pact Delay Reduction %d" },
            309: { "fmt": "(BLU) Tracks Blue Points %d" },
            382: { "fmt": "(COR) Experience Bonus %d" },
            316: { "fmt": "(COR) Tracks Total Reflect Damage %d" },
            317: { "fmt": "(COR) Tracks Total Roll (Rogues) %d" },
            318: { "fmt": "(COR) Tracks Total Roll (Gallants) %d" },
            319: { "fmt": "(COR) Tracks Total Roll (Chaos) %d" },
            320: { "fmt": "(COR) Tracks Total Roll (Beast) %d" },
            321: { "fmt": "(COR) Tracks Total Roll (Choral) %d" },
            322: { "fmt": "(COR) Tracks Total Roll (Hunters) %d" },
            323: { "fmt": "(COR) Tracks Total Roll (Samurai) %d" },
            324: { "fmt": "(COR) Tracks Total Roll (Ninja) %d" },
            325: { "fmt": "(COR) Tracks Total Roll (Drachen) %d" },
            326: { "fmt": "(COR) Tracks Total Roll (Evokers) %d" },
            327: { "fmt": "(COR) Tracks Total Roll (Magus) %d" },
            328: { "fmt": "(COR) Tracks Total Roll (Corsairs) %d" },
            329: { "fmt": "(COR) Tracks Total Roll (Puppet) %d" },
            330: { "fmt": "(COR) Tracks Total Roll (Dancers) %d" },
            331: { "fmt": "(COR) Tracks Total Roll (Scholars) %d" },
            332: { "fmt": "(COR) Tracks Number of Busts %d" },
            411: { "fmt": "(COR) Quick Draw Damage %d" },
            504: { "fmt": "(PUP) Puppet Maneuver Stat Bonus %d" },
            505: { "fmt": "(PUP) Overload Threshold Bonus %d" },
            333: { "fmt": "(DNC) Tracks Finishing Moves %d" },
            490: { "fmt": "(DNC) Samba Duration Bonus %d" },
            491: { "fmt": "(DNC) Waltz Potentcy Bonus %d" },
            492: { "fmt": "(DNC) Jig Duration Bonus %d" },
            493: { "fmt": "(DNC) Violent Flourish Accuracy Bonus %d" },
            494: { "fmt": "(DNC) Bonus Finishing Moves From Steps %d" },
            403: { "fmt": "(DNC) Bonus Accuracy For Steps %d" },
            495: { "fmt": "(DNC) Spectral Jig Duration Modification %d" },
            497: { "fmt": "(DNC) Waltz Recast Modifier %d" },
            498: { "fmt": "(DNC) Samba Duration Bonus %d" },
            393: { "fmt": "(SCH) MP Cost (Black Magic) %d" },
            394: { "fmt": "(SCH) MP Cost (White Magic) %d" },
            395: { "fmt": "(SCH) Cast Time (Black Magic) %d" },
            396: { "fmt": "(SCH) Cast Time (White Magic) %d" },
            397: { "fmt": "(SCH) Recast Time (Black Magic) %d" },
            398: { "fmt": "(SCH) Recast Time (White Magic) %d" },
            399: { "fmt": "(SCH) Celerity\/Alacrity Effect Bonus %d" },
            334: { "fmt": "(SCH) Enhances \"Light Arts\" Effect %d" },
            335: { "fmt": "(SCH) Enhances \"Dark Arts\" Effect %d" },
            336: { "fmt": "(SCH) Light Arts Skill +%d" },
            337: { "fmt": "(SCH) Dark Arts Skill +%d" },
            338: { "fmt": "(SCH) Regen Effect %d" },
            339: { "fmt": "(SCH) Regen Duration %d" },
            478: { "fmt": "(SCH) Helix Effect %d" },
            477: { "fmt": "(SCH) Helix Duration %d" },
            400: { "fmt": "(SCH) Stormsurge Effect %d" },
            401: { "fmt": "(SCH) Sublimation Bonus %d" },
            489: { "fmt": "(SCH) Grimoire: Reduces Spellcasting Time %d" },
            341: { "fmt": "Tracks Active Enspell %d" },
            343: { "fmt": "Tracks Enspell Base Damage %d" },
            432: { "fmt": "Tracks Enspell Damage Bonus %d" },
            342: { "fmt": "Tracks Active Spike Spell %d" },
            344: { "fmt": "Tracks Spike Base Damage" },
            345: { "fmt": "TP Bonus %d" },
            347: { "fmt": "Tracks Fire Element Affinity %d" },
            348: { "fmt": "Tracks Earth Element Affinity %d" },
            349: { "fmt": "Tracks Water Element Affinity %d" },
            350: { "fmt": "Tracks Ice Element Affinity %d" },
            351: { "fmt": "Tracks Lightning Element Affinity %d" },
            352: { "fmt": "Tracks Wind Element Affinity %d" },
            353: { "fmt": "Tracks Light Element Affinity %d" },
            354: { "fmt": "Tracks Dark Element Affinity %d" },
            355: { "fmt": "Adds Weaponskill %d" },
            356: { "fmt": "Adds Weaponskill In Dynamis %d" },
            358: { "fmt": "Stealth %d" },
            366: { "fmt": "Bonus Damage Rating (Main) %d" },
            367: { "fmt": "Bonus Damage Rating (Sub) %d" },
            368: { "fmt": "Regain %d" },
            406: { "fmt": "Regain (Down \/ Plague) %d" },
            369: { "fmt": "Refresh %d" },
            405: { "fmt": "Refresh (Down \/ Plague) %d" },
            370: { "fmt": "Regen %d" },
            404: { "fmt": "Regen (Down \/ Poison) %d" },
            374: { "fmt": "%d%% Cure Potency" },
            375: { "fmt": "%d%% Cure Potency Received" },
            376: { "fmt": "Bonus Damage Rating (Ranged) %d" },
            377: { "fmt": "Weapon Rank (Main) %d" },
            378: { "fmt": "Weapon Rank (Sub) %d" },
            379: { "fmt": "Weapon Rank (Ranged) %d" },
            380: { "fmt": "Additional Delay +%d%%" },
            381: { "fmt": "Additional Delay (Ranged) +%d%%" },
            385: { "fmt": "Enhances \"Shield Bash\" Effect %d" },
            386: { "fmt": "Increases \"Kick\" Damage %d" },
            392: { "fmt": "Enhances \"Weapon Bash\" Effect %d" },
            402: { "fmt": "Enhances \"Wyvern Breath\" Effect %d" },
            408: { "fmt": "+%d%% Double Attack Damage Chance" },
            409: { "fmt": "+%d%% Triple Attack Damage Chance" },
            410: { "fmt": "+%d%% Zanshin Double Damage Chance" },
            479: { "fmt": "+%d%% Rapid Shot Double Damage Chance" },
            480: { "fmt": "+%d%% Chance To Absorb Damage" },
            481: { "fmt": "+%d%% Chance To Land Extra Attack (Dual Wield)" },
            482: { "fmt": "+%d%% Chance To Land Extra Kick Attack" },
            415: { "fmt": "+%d%% Double Damage Chance (Samba)" },
            416: { "fmt": "+%d%% Chance To NULL Physical Damage" },
            417: { "fmt": "+%d%% Chance To Triple Damage (Quick Draw)" },
            418: { "fmt": "+%d%% Chance Bar Spell NULL Damage Of Same Element" },
            419: { "fmt": "+%d%% Chance To Instant Cast Spell (SCH Arts)" },
            430: { "fmt": "+%d%% Quadruple Attack Chance" },
            456: { "fmt": "Reraise" },
            457: { "fmt": "Reraise II" },
            458: { "fmt": "Reraise III" },
            459: { "fmt": "+%d%% Chance To Absorb Fire Damage" },
            460: { "fmt": "+%d%% Chance To Absorb Earth Damage" },
            461: { "fmt": "+%d%% Chance To Absorb Water Damage" },
            462: { "fmt": "+%d%% Chance To Absorb Wind Damage" },
            463: { "fmt": "+%d%% Chance To Absorb Ice Damage" },
            464: { "fmt": "+%d%% Chance To Absorb Lightning Damage" },
            465: { "fmt": "+%d%% Chance To Absorb Light Damage" },
            466: { "fmt": "+%d%% Chance To Absorb Dark Damage" },
            467: { "fmt": "+%d%% Chance To NULL Fire Damage" },
            468: { "fmt": "+%d%% Chance To NULL Earth Damage" },
            469: { "fmt": "+%d%% Chance To NULL Water Damage" },
            470: { "fmt": "+%d%% Chance To NULL Wind Damage" },
            471: { "fmt": "+%d%% Chance To NULL Ice Damage" },
            472: { "fmt": "+%d%% Chance To NULL Lightning Damage" },
            473: { "fmt": "+%d%% Chance To NULL Light Damage" },
            474: { "fmt": "+%d%% Chance To NULL Dark Damage" },
            475: { "fmt": "Magic Absorb %d" },
            476: { "fmt": "Magic NULL %d" },
            512: { "fmt": "Physical Absorb %d" },
            516: { "fmt": "Converts %d%% of Damage Taken To MP" },
            431: { "fmt": "Additional Effect %d" },
            499: { "fmt": "Spikes Effect (Type) %d" },
            500: { "fmt": "Spikes Effect (Damage) %d" },
            501: { "fmt": "Spikes Effect (Chance) %d" },
            496: { "fmt": "GoV Clears Bonus %d" },
            506: { "fmt": "Proc Rate (Occ. Extra Damage) %d" },
            507: { "fmt": "Multiplier (Occ. Extra Damage) %d" },
            412: { "fmt": "Eat Raw Fish" },
            413: { "fmt": "Eat Raw Meat" },
            310: { "fmt": "Enhances Cursna: %d" },
            414: { "fmt": "Increases Retaliation damage: %d" },
            508: { "fmt": "Augments Third Eye: %d" },
            509: { "fmt": "Improves clamming results: %d" },
            510: { "fmt": "Reduces clamming incidents: %d" },
            511: { "fmt": "Increases chocobo riding time: %d" },
            513: { "fmt": "Improves harvesting results: %d" },
            514: { "fmt": "Improves logging results: %d" },
            515: { "fmt": "Improves mining results: %d" },
            517: { "fmt": "Egghelm: %d" }
        };

        for (var k in mods) {
            if (mods.hasOwnProperty(k) && k == val.modid) {
                return '(' + val.modid + '): ' + sprintf(mods[k].fmt, val.value).replace(/\+-/, '-');
            }
        }

        return 'Unknown Mod (' + val.modid + ') ' + val.value;
    };
});

/**
 * craftRequirements (filter) - Converts the craft requirements to a comma separated list.
 *
 * @param {object} val              The value to convert.
 * @returns {string}                The converted value.
 */
arcanusdsp.filter('craftRequirements', function () {
    return function (val) {
        var ret = '';
        val.forEach(function (r) {
            ret += r.name + ' (' + r.level + '), ';
        });

        return ret.trim().replace(/(^,)|(,$)/g, "");
    };
});

/**
 * Custom JavaScript to collapse tables.
 */
$(document).ready(function () {
    // Change the mouse cursor when over collapsible headers..
    $('.collapsible thead').on({
        mouseenter: function () {
            $('html,body').css('cursor', 'pointer');
        },
        mouseleave: function () {
            $('html,body').css('cursor', 'default');
        }
    });

    // Toggle the collapse state of body elements..
    $('.collapsible').on('click', 'thead', function () {

        // Ensure this is a parent that can collaspe..
        if ($(this).parent()[0].className.indexOf('collapsible') === -1)
            return;

        // Obtain the tbody of the table being collapsed..
        var $body = $(this).parent().children('tbody');

        // Check if we are currently closed..
        if ($(this).hasClass("collapsed")) {
            $(this).removeClass("collapsed");

            // Toggle the open/close buttons..
            $(this).find('th .open').show(0);
            $(this).find('th .close').hide(0);

            // Show the tbody block..
            $body.show(0, function () {
                $body.removeClass('collapse');
            });
        } else {
            $(this).addClass("collapsed");

            // Toggle the open/close buttons..
            $(this).find('th .open').hide(0);
            $(this).find('th .close').show(0);

            // Hide the tbody block..
            $body.hide(0, function () {
                $body.addClass('collapse');
            });
        }
    });

    // Start objects collapsed..
    $('.collapsible').children('thead').addClass('collapsed');
    $('.collapsible').children('tbody').addClass('collapse');

    // Prepare the open/close buttons..
    $('.collapsible .open').hide();
    $('.collapsible .close').show();
});