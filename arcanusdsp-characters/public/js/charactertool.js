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
 * Character Tool Controller
 *
 * Angular controller used to interact with the various character specific pages that
 * are added to the arcanusdsp website via the arcanusdsp-characters plugin.
 *
 * @author atom0s <atom0s@live.com>
 * @copyright Copyright (C) 2015-2016 atom0s [atom0s@live.com]
 */
arcanusdsp.controller('characterToolController', ['$filter', '$http', '$sce', '$scope', '$window', function ($filter, $http, $sce, $scope, $window) {
    $scope.characterResultsPage = 0;
    $scope.charactersLookupEnabled = true;
    $scope.characters = null;
    $scope.characterLoading = false;
    $scope.character = null;

    /**
     * Gets a list of characters with the partial matching name.
     *
     * @param {string} name             The partial name to match.
     */
    $scope.getCharactersByName = function (name) {
        var opts = { method: 'GET', url: '/ajax/characters', params: { name: name } };

        $scope.characterResultsPage = 0;
        $scope.charactersLookupEnabled = false;
        $scope.makeAjaxQuery(opts, function (err, result) {
            $scope.characters = (err) ? [] : result;
            $scope.charactersLookupEnabled = true;
        });
    };

    /**
     * Gets a character by their character id.
     *
     * @param {number} charid           The character id of the character to obtain.
     */
    $scope.getCharacterById = function (charid) {
        var opts = { method: 'GET', url: '/ajax/character', params: { id: charid } };

        $scope.characterLoading = true;
        $scope.makeAjaxQuery(opts, function (err, result) {
            $scope.character = (err) ? null : result;
            $scope.characterLoading = false;

            // Update the page title..
            document.querySelector('title').innerHTML = (err) ? 'Failed To Load Character!' : $scope.character.charname + ' &bull; Viewing Character';
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
 * equipmentBlock (filter) - Converts the given slot data to the players equipped item.
 *
 * @param {number} val              The slot index.
 * @param {object} p                The profile object to obtain the values from.
 * @returns {string}                The image url for the players race and hair.
 */
arcanusdsp.filter('equipmentBlock', ['$sce', function ($sce) {
    return function (val, p) {
        if (val == null || p == null)
            return '';

        // Obtain the item id for the given slot..
        var itemId = 0;
        var slotIndex = [0, 1, 2, 3, 4, 9, 11, 12, 5, 6, 13, 14, 15, 10, 7, 8];
        for (var x = 0, i = 0; x < Object.keys(p.equipment).length; ++x, i = Object.keys(p.equipment)[x]) {
            if (p.equipment[i].equipslotid === slotIndex[val]) {
                itemId = p.equipment[i].itemid;
                break;
            }
        }

        // Build the item block..
        val++;
        var img = '<div class="character-equip-slot"><img src="https://static.ffxiah.com/images/eq' + val + '.gif"></div>';
        if (itemId !== 0) {
            img = '<div class="character-equip-slot"><a href="https://www.ffxiah.com/item/' + itemId + '"><img src="https://static.ffxiah.com/images/icon/' + itemId + '.png"></a></div>';
        }

        // Return as trusted html..
        return $sce.trustAsHtml(img);
    };
}]);