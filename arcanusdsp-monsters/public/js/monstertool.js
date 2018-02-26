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
 * Monster Tool Controller
 *
 * Angular controller used to interact with the various monster specific pages that
 * are added to the arcanusdsp website via the arcanusdsp-monsters plugin.
 *
 * @author atom0s <atom0s@live.com>
 * @copyright Copyright (C) 2015-2016 atom0s [atom0s@live.com]
 */
arcanusdsp.controller('monsterToolController', ['$filter', '$http', '$sce', '$scope', '$window', function ($filter, $http, $sce, $scope, $window) {
    $scope.monsterResultsPage = 0;
    $scope.monstersLookupEnabled = true;
    $scope.monsters = null;
    $scope.monsterLoading = false;
    $scope.monster = null;

    /**
     * Gets a list of monsters with the partial matching name.
     *
     * @param {string} name             The partial name to match.
     */
    $scope.getMonstersByName = function (name) {
        var opts = { method: 'GET', url: '/ajax/monsters', params: { name: name } };

        $scope.monsterResultsPage = 0;
        $scope.monstersLookupEnabled = false;
        $scope.makeAjaxQuery(opts, function (err, result) {
            $scope.monsters = (err) ? [] : result;
            $scope.monstersLookupEnabled = true;
        });
    };

    /**
     * Gets a monster by their monster id.
     *
     * @param {number} mobid            The monster id of the monster to obtain.
     */
    $scope.getMonsterById = function (mobid) {
        var opts = { method: 'GET', url: '/ajax/monster', params: { id: mobid } };

        $scope.monsterLoading = true;
        $scope.makeAjaxQuery(opts, function (err, result) {
            $scope.monster = (err) ? null : result;
            $scope.monsterLoading = false;

            // Update the page title..
            document.querySelector('title').innerHTML = (err) ? 'Failed To Load Monster!' : $filter('cleanNameTitleCase')($scope.monster.name) + ' &bull; Viewing Monster';
        });
    };

    /**
     * Determines if a monsters spawn information is scripted.
     *
     * @param {number} s            The monsters spawn flags.
     * @returns {boolean}           True if scripted, false otherwise.
     */
    $scope.isScriptedMonster = function (s) {
        return !!(s == 128 || (s & 128) == 128);
    };
}]);

/**
 * pageCount (filter) - Determines the number of pages it would take to display the given data.
 *
 * @param {object} input            The input array to splice.
 * @param {number} pageSize         The monster count to display on each page.
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
 * respawnTime (filter) - Converts the given respawn time to a clean string.
 *
 * @param {object} val              The raw respawn time.
 * @returns {string}                The cleaned respawn time.
 */
arcanusdsp.filter('respawnTime', function () {
    return function (val) {
        if (val == null || val === 0)
            return '00:00:00';

        const pad = function (n) {
            return '00'.substr(n.toString().length) + n.toString();
        };

        const h = pad(Math.floor((val / (60 * 60)) % 24));
        const m = pad(Math.floor((val / 60) % 60));
        const s = pad(Math.floor(val % 60));

        return h + ':' + m + ':' + s +  ' (hh:mm:ss)';
    };
});

/**
 * spawnFlags (filter) - Converts the given spawn type id to its string flags.
 *
 * @param {object} val              The spawn type id.
 * @returns {string}                The spawn flags.
 */
arcanusdsp.filter('spawnFlags', function () {
    return function (val) {
        if (val == null || val === 0)
            return 'Normal';

        var ret = '';
        if (val & 0x0001)
            ret += ', At Night';
        if (val & 0x0002)
            ret += ', At Evening';
        if (val & 0x0004)
            ret += ', Weather';
        if (val & 0x0008)
            ret += ', Fog';
        if (val & 0x0010)
            ret += ', Moon Phase';
        if (val & 0x0020)
            ret += ', Lottery';
        if (val & 0x0040)
            ret += ', Windowed';
        if (val & 0x0080)
            ret += ', Scripted';

        return ret.replace(/(^,)|(,$)/g, "");
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