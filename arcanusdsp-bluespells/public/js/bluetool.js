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
 * Blue Tool Controller
 *
 * Angular controller used to interact with the various blue spell specific pages that
 * are added to the arcanusdsp website via the arcanusdsp-bluespells plugin.
 *
 * @author atom0s <atom0s@live.com>
 * @copyright Copyright (C) 2015-2016 atom0s [atom0s@live.com]
 */
arcanusdsp.controller('blueToolController', ['$filter', '$http', '$sce', '$scope', '$window', function ($filter, $http, $sce, $scope, $window) {
    $scope.bluespell = null;
    $scope.bluespellLoading = false;
    $scope.bluespells = null;

    /**
     * Gets a list of blue spells.
     */
    $scope.getBlueSpells = function (name) {
        var opts = { method: 'GET', url: '/ajax/bluespells', params: {} };

        $scope.makeAjaxQuery(opts, function (err, result) {
            $scope.bluespells = (err) ? [] : result;
        });
    };

    /**
     * Gets a blue spell by its id.
     *
     * @param {number} spellid                  The character id of the character to obtain.
     */
    $scope.getBlueSpellById = function (spellid) {
        var opts = { method: 'GET', url: '/ajax/bluespell', params: { id: spellid } };

        $scope.bluespellLoading = true;
        $scope.makeAjaxQuery(opts, function (err, result) {
            $scope.bluespell = (err) ? null : result;
            $scope.bluespellLoading = false;

            // Update the page title..
            document.querySelector('title').innerHTML = (err) ? 'Failed To Load Blue Spell!' : 'Viewing Blue Spell';
        });
    };
}]);
