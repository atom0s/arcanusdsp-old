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
 * BCNM Tool Controller
 *
 * Angular controller used to interact with the various bcnm specific pages that
 * are added to the arcanusdsp website via the arcanusdsp-bcnm plugin.
 *
 * @author atom0s <atom0s@live.com>
 * @copyright Copyright (C) 2015-2016 atom0s [atom0s@live.com]
 */
arcanusdsp.controller('bcnmToolController', ['$filter', '$http', '$sce', '$scope', '$window', function ($filter, $http, $sce, $scope, $window) {
    $scope.bcnm = null;
    $scope.bcnmLoading = false;
    $scope.bcnms = null;

    /**
     * Gets a list of bcnms.
     */
    $scope.getBcnmList = function (name) {
        var opts = { method: 'GET', url: '/ajax/bcnms', params: {} };

        $scope.makeAjaxQuery(opts, function (err, result) {
            $scope.bcnms = (err) ? [] : result;
        });
    };

    /**
     * Gets a bcnm by its id.
     *
     * @param {number} bcnmid                   The character id of the character to obtain.
     */
    $scope.getBcnmById = function (bcnmid) {
        var opts = { method: 'GET', url: '/ajax/bcnm', params: { id: bcnmid } };

        $scope.bcnmLoading = true;
        $scope.makeAjaxQuery(opts, function (err, result) {
            $scope.bcnm = (err) ? null : result;
            $scope.bcnmLoading = false;

            // Update the page title..
            document.querySelector('title').innerHTML = (err) ? 'Failed To Load BCNM!' : 'Viewing BCNM';
        });
    };

    /**
     * Prepares tables to be foldable.
     */
    $scope.buildFoldingTables = function () {
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
    };
}]);

/**
 * bcnmLevelCap (filter) - Converts the given level cap to its string value.
 *
 * @param {object} val              The value to convert.
 * @returns {string}                The converted value.
 */
arcanusdsp.filter('bcnmLevelCap', function () {
    return function (val) {
        if (val == null)
            return 'Unknown';
        if (val == 0)
            return 'Uncapped';
        return val;
    };
});

/**
 * bcnmRules (filter) - Converts the BCNM rules to strings.
 *
 * @param {object} val              The value to convert.
 * @returns {string}                The converted value.
 */
arcanusdsp.filter('bcnmRules', function () {
    return function (val) {
        if (val == null || val === 0)
            return 'Unknown Rules';

        var ret = '';
        if (val & 0x0001)
            ret += ', Subjobs Allowed';
        if (val & 0x0002)
            ret += ', Can Lose Exp';
        if (val & 0x0004)
            ret += ', Remove 3Min';
        if (val & 0x0008)
            ret += ', Spawns Treasure On Win';
        if (val & 0x0010)
            ret += ', Maat Fight';

        return ret.replace(/(^,)|(,$)/g, "");
    };
});

