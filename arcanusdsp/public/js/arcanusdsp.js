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

// Initialize the arcanusdsp angular module..
var arcanusdsp = angular.module('arcanusdsp', []);

// Configure the module..
arcanusdsp.config(['$httpProvider', function ($httpProvider) {
    // Make angular http requests seen as xhr by express.js..
    $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
}]);

/**
 * arcanusdsp Controller
 *
 * Controller that holds the main functionality of the arcanusdsp website.
 */
arcanusdsp.controller('arcanusdspController', ['$filter', '$http', '$sce', '$scope', '$window', function ($filter, $http, $sce, $scope, $window) {
    // Index page variables..
    $scope.newsposts = null;

    // Sidebar variables..
    $scope.serverstatus = null;
    $scope.serverversion = '';
    $scope.onlinecharacters = null;
    $scope.uniquecharacters = 0;

    // Modal dialog variables..
    $scope.modalDialog = {
        title: '',
        message: '',
        status: 0
    };

    /**
     * Checks if an object is empty.
     *
     * @param {object} obj                      The object to check.
     * @returns {boolean}                       True if empty, false otherwise.
     */
    $scope.isEmpty = function (obj) {
        for (var x in obj) {
            if (obj.hasOwnProperty(x))
                return false;
        }
        return true;
    };

    /**
     * Turns a table into a sortable table by its table id.
     * @param {string} id                       The table id to make sortable.
     */
    $scope.makeSortable = function (id) {
        $('#' + id).tablesorter({
            headerTemplate: '{content}{icon}',
            widgets: ["columns"]
        });
    };

    /**
     * Refreshes the FFXiAH tooltips for late-loading pages.
     */
    $scope.refreshTooltips = function () {
        if (!AH) return;

        // Reset the init state of the tooltip objects..
        AH.Tooltip.inited = false;
        AH.Tips.inited = false;

        // Reinvoke the tooltip library..
        AH.Tooltip.init();
        AH.Tips.init();
        AH.Reactor.init();
    };

    /**
     * Makes an ajax request to the local website.
     *
     * @param {object} opts                     The options for the ajax request.
     * @param {function} done                   The callback function to invoke when the request is complete.
     */
    $scope.makeAjaxQuery = function (opts, done) {
        $http(opts).then(function (response) {
            if (response && response.status === 200 && response.data != null)
                done(null, response.data);
            else
                done(true, null);
        }, function (err) {
            done(err, null);
        });
    };

    /**
     * Displays the websites modal dialog.
     *
     * @param {string} title                    The title to display on the modal.
     * @param {string} msg                      The message to display in the modal.
     * @param {number} status                   The status of the modal. (0: error, 1: success, 2: warning)
     */
    $scope.displayModal = function (title, msg, status) {
        $scope.modalDialog.title = title;
        $scope.modalDialog.message = msg;
        $scope.modalDialog.status = status;
        $('#modalDialog').modal('show');
    };

    /** **/
    /** **/
    /** **/

    /**
     * Obtains the latest news posts.
     *
     * @private
     * @static
     */
    $scope.getLatestNewsPosts = function () {
        var opts = { method: 'GET', url: '/ajax/latestnews', params: {} };

        $scope.newsposts = null;
        $scope.makeAjaxQuery(opts, function (err, res) {
            $scope.newsposts = (err || typeof res !== 'object') ? [] : res;
        });
    };

    /**
     * Obtains the servers online status.
     *
     * @private
     * @static
     */
    $scope.getServerOnlineStatus = function () {
        var opts = { method: 'GET', url: '/ajax/serverstatus', params: {} };

        $scope.serverstatus = null;
        $scope.makeAjaxQuery(opts, function (err, res) {
            $scope.serverstatus = (err) ? false : (res === true);
        });
    };

    /**
     * Obtains the expected client version number.
     *
     * @private
     * @static
     */
    $scope.getServerClientVersion = function () {
        var opts = { method: 'GET', url: '/ajax/serverversion', params: {} };

        $scope.serverversion = '';
        $scope.makeAjaxQuery(opts, function (err, res) {
            $scope.serverversion = (err) ? '' : res;
        });
    };

    /**
     * Obtains the current online characters.
     *
     * @private
     * @static
     */
    $scope.getOnlineCharacters = function () {
        var opts = { method: 'GET', url: '/ajax/onlinecharacters', params: {} };

        $scope.onlinecharacters = null;
        $scope.makeAjaxQuery(opts, function (err, res) {
            $scope.onlinecharacters = (err) ? [] : res.characters;
            $scope.uniquecharacters = (err) ? 0 : res.unique;
        });
    };

    /**
     * Frees the given stuck character.
     *
     * @private
     * @static
     * @param {object} c                        The character object to free.
     */
    $scope.unstuckCharacter = function (c) {
        // Ensure the character is offline before processing..
        if (c.isonline !== 0) {
            $scope.displayModal('Unstuck Tool', 'You must log off before using the unstuck tool.', 0);
            return;
        }

        // Free the character..
        var opts = { method: 'GET', url: '/ajax/unstuck', params: { charid: c.charid } };
        $scope.makeAjaxQuery(opts, function (err, res) {
            var title = 'Unstuck Tool';
            var message = 'Your character should be unstuck!';
            var status = 1;

            if (err) {
                message = 'There was a problem trying to free your character.';
                status = 0;
            }

            $scope.displayModal(title, message, status);
        });
    };
}]);

///////////////////////////////////////////////////////////////////////////////////////////////////
//
// Generic Angular Addons
//
///////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * repeatDone (directive) - Used to invoke a given function after an ng-repeat has completed.
 *
 * @param {object} scope                        The scope of the repeat.
 * @param {object} element                      The element being processed.
 * @param {object} attr                         The attribute being processed.
 */
arcanusdsp.directive('repeatDone', function () {
    return function (scope, element, attr) {
        if (scope.$last) {
            element.ready(function () {
                scope.$eval(attr.repeatDone);
            });
        }
    };
});

/**
 * html (filter) - Converts a value to raw html.
 *
 * @param {*}                                   The object to convert to html.
 * @returns {string}                            The converted html value.
 */
arcanusdsp.filter('html', ['$sce', function ($sce) {
    return function (val) {
        return $sce.trustAsHtml(val);
    };
}]);

///////////////////////////////////////////////////////////////////////////////////////////////////
//
// Shared Angular Addons
//
///////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * cleanName (filter) - Cleans a given name of database-safe characters.
 *
 * @param {string}                              The name to clean.
 * @returns {string}                            The cleaned name.
 */
arcanusdsp.filter('cleanName', function () {
    return function (val) {
        if (!val)
            return 'Unknown';

        val = val.replace(/_/g, ' ');
        val = val.replace(/'/g, '');
        val = val.replace(/"/g, '');
        return val;
    };
});

/**
 * cleanNameTitleCase (filter) - Cleans a given name of database-safe characters.
 *                               Converts the value to title case.
 *
 * @param {string}                              The name to clean.
 * @returns {string}                            The cleaned name.
 */
arcanusdsp.filter('cleanNameTitleCase', function () {
    return function (val) {
        if (!val)
            return 'Unknown';
        val = val.replace(/_/g, ' ');
        val = val.replace(/'/g, '');
        val = val.replace(/"/g, '');
        return val.replace(/\w\S*/g, function (txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    };
});

/**
 * jobInformation (filter) - Builds a characters job information into a string.
 *
 * @param {object} p                            The player object.
 * @returns {string}                            The players job information.
 */
arcanusdsp.filter('jobInformation', function () {
    return function (p) {
        // Check for null or anon players..
        if (!p || (p.nameflags & 0x1000) === 0x1000)
            return "?/?";

        // Jobs array..
        var jobs = ['', 'war', 'mnk', 'whm', 'blm', 'rdm', 'thf', 'pld', 'drk', 'bst', 'brd', 'rng', 'sam', 'nin', 'drg', 'smn', 'blu', 'cor', 'pup', 'dnc', 'sch', 'geo', 'run'];

        // Obtain the players main job information..
        var mjob = p.mjob;
        var mlvl = p.jobs[mjob].level;

        // Obtain the players sub job information..
        var sjob = p.sjob;
        var slvl = (sjob !== 0) ? p.jobs[sjob].level : 0;

        // Sanity checks..
        if (mjob === -1 || mjob === 0 || mlvl <= 0)
            return 'UNK00/UNK00';

        // Build the output..
        var ret = jobs[mjob].toUpperCase() + mlvl;
        if (slvl > 0) {
            slvl = Math.floor(Math.min(slvl, mlvl / 2));
            ret += '/' + jobs[sjob].toUpperCase();
            if (slvl <= 9 && slvl >= 1)
                ret += '0';
            ret += (slvl <= 0) ? 1 : slvl;
        }

        return ret;
    };
});

/**
 * linkshellRankToImage (filter) - Converts the given linkshell rank to its item image.
 *
 * @param {object} val                          The value to convert to an image
 * @returns {string}                            The converted image value.
 */
arcanusdsp.filter('linkshellRankToImage', function () {
    return function (val) {
        switch (val) {
            case 1:
                return '/public/img/ffxi/linkshell/linkshell.png';
            case 2:
                return '/public/img/ffxi/linkshell/linksack.png';
            case 3:
                return '/public/img/ffxi/linkshell/linkpearl.png';
            default:
                return '/public/img/spacer.png';
        }
    };
});

/**
 * nameflagsToImages (filter) - Converts the given players nameflags to images.
 *
 * @param {object} p                            The player object being handled.
 * @returns {string}                            The converted image values.
 */
arcanusdsp.filter('nameflagsToImages', ['$sce', function ($sce) {
    return function (p) {
        var imgs = '';

        if (!p)
            return imgs;

        // Determine the players GM level..
        var gmLevel = 0;
        if ((p.nameflags & 0x04000000) === 0x04000000)
            gmLevel = 1;
        if ((p.nameflags & 0x05000000) === 0x05000000)
            gmLevel = 2;
        if ((p.nameflags & 0x06000000) === 0x06000000)
            gmLevel = 3;
        if ((p.nameflags & 0x07000000) === 0x07000000)
            gmLevel = 4;

        switch (gmLevel) {
            case 1:
                imgs += '<img src="/public/img/ffxi/nameflags/pol.png" alt="Game Master" title="Game Master" />';
                break;
            case 2:
                imgs += '<img src="/public/img/ffxi/nameflags/sgm.png" alt="Game Master" title="Game Master" />';
                break;
            case 3:
                imgs += '<img src="/public/img/ffxi/nameflags/lgm.png" alt="Game Master" title="Game Master" />';
                break;
            case 4:
                imgs += '<img src="/public/img/ffxi/nameflags/pgm.png" alt="Game Master" title="Game Master" />';
                break;
        }

        // Determine if the player is looking for party..
        if ((p.nameflags & 0x00000800) === 0x00000800)
            imgs += '<img src="/public/img/ffxi/nameflags/partyinvite.png" alt="Looking For Party" title="Looking For Party" />';

        // Determine if the player has a bazaar..
        if ((p.nameflags & 0x80000000) === -0x80000000)
            imgs += '<img src="/public/img/ffxi/nameflags/bazaar.png" alt="Bazaar" title="Bazaar" />';

        // Determine if the player is a mentor..
        if (p.mentor === 1)
            imgs += '<img src="/public/img/ffxi/nameflags/mentor.png" alt="Mentor" title="Mentor" />';

        // Determine if the player is a new player..
        if (p.isnewplayer === 1)
            imgs += '<img src="/public/img/ffxi/nameflags/newplayer.png" alt="New Player" title="New Player" />';

        return $sce.trustAsHtml(imgs);
    };
}]);

/**
 * nationFlag (filter) - Converts the given nation id to its flag url.
 *
 * @param {object} val                          The nation id to convert.
 * @returns {string}                            The nation flag url.
 */
arcanusdsp.filter('nationFlag', function () {
    return function (val) {
        var flags = ['sandoria_flag.jpg', 'bastok_flag.jpg', 'windurst_flag.jpg'];
        return '/public/img/ffxi/nationflags/' + flags[val];
    };
});

/**
 * nationName (filter) - Converts the given nation id to its name.
 *
 * @param {object} val                          The nation id to convert.
 * @returns {string}                            The nation name.
 */
arcanusdsp.filter('nationName', function () {
    return function (val) {
        var names = ['San d\'Oria', 'Bastok', 'Windurst'];
        return names[val];
    };
});

/**
 * raceHairImage (filter) - Converts the profiles race and hair ids to an image.
 *
 * @param {object} p                            The profile object to obtain the values from.
 * @returns {string}                            The image url for the players race and hair.
 */
arcanusdsp.filter('raceHairImage', function () {
    return function (p) {
        if (!p || p.race === 0)
            return '/public/img/ffxi/hair/unknown.jpg.webp';

        var raceFileList = [
            '',
            '/public/img/ffxi/hair/hume/male/',
            '/public/img/ffxi/hair/hume/female/',
            '/public/img/ffxi/hair/elvaan/male/',
            '/public/img/ffxi/hair/elvaan/female/',
            '/public/img/ffxi/hair/tarutaru/male/',
            '/public/img/ffxi/hair/tarutaru/female/',
            '/public/img/ffxi/hair/mithra/',
            '/public/img/ffxi/hair/galka/'
        ];

        // Build the path to the file for this character..
        var img = raceFileList[p.race];
        var sex = ['', 'hm', 'hf', 'em', 'ef', 'tm', 'tf', 'm', 'g'][p.race];
        var hairType = ['a', 'b'][(p.face % 2)];
        var hairId = Math.floor((p.face + 2) / 2);
        return img + sex + hairId + hairType + '.jpg.webp';
    };
});

/**
 * titleName (filter) - Converts the given title id to its name.
 *
 * @param {object} val              The title id to convert.
 * @returns {string}                The title name.
 */
arcanusdsp.filter('titleName', function () {
    return function (val) {
        var titles =
            [
                { id: 0, name: "N/A" },
                { id: 1, name: "Fodderchief Flayer" },
                { id: 2, name: "Warchief Wrecker" },
                { id: 3, name: "Dread Dragon Slayer" },
                { id: 4, name: "Overlord Executioner" },
                { id: 5, name: "Dark Dragon Slayer" },
                { id: 6, name: "Adamantking Killer" },
                { id: 7, name: "Black Dragon Slayer" },
                { id: 8, name: "Manifest Mauler" },
                { id: 9, name: "Behemoth's Bane" },
                { id: 10, name: "Archmage Assassin" },
                { id: 11, name: "Hellsbane" },
                { id: 12, name: "Giant Killer" },
                { id: 13, name: "Lich Banisher" },
                { id: 14, name: "Jellybane" },
                { id: 15, name: "Bogeydowner" },
                { id: 16, name: "Beakbender" },
                { id: 17, name: "Skullcrusher" },
                { id: 18, name: "Morbolbane" },
                { id: 19, name: "Goliath Killer" },
                { id: 20, name: "Mary's Guide" },
                { id: 21, name: "Simurgh Poacher" },
                { id: 22, name: "Roc Star" },
                { id: 23, name: "Serket Breaker" },
                { id: 24, name: "Cassienova" },
                { id: 25, name: "The Hornsplitter" },
                { id: 26, name: "Tortoise Torturer" },
                { id: 27, name: "Mon Cherry" },
                { id: 28, name: "Behemoth Dethroner" },
                { id: 29, name: "The Vivisector" },
                { id: 30, name: "Dragon Asher" },
                { id: 31, name: "Expeditionary Trooper" },
                { id: 32, name: "Bearer of the Wisewoman's Hope" },
                { id: 33, name: "Bearer of the Eight Prayers" },
                { id: 34, name: "Lightweaver" },
                { id: 35, name: "Destroyer of Antiquity" },
                { id: 36, name: "Sealer of the Portal of the Gods" },
                { id: 37, name: "Burier of the Illusion" },
                { id: 38, name: "0" },
                { id: 39, name: "Family Counselor" },
                { id: 40, name: "0" },
                { id: 41, name: "Great Grappler Scorpio!?" },
                { id: 42, name: "Bond Fixer" },
                { id: 43, name: "Vampire Hunter D-Minus" },
                { id: 44, name: "Sheep's Milk Deliverer" },
                { id: 45, name: "Bean Cuisine Salter" },
                { id: 46, name: "Total Loser" },
                { id: 47, name: "Doctor Shantotto's Flavor of the Month" },
                { id: 48, name: "Pilgrim to Holla" },
                { id: 49, name: "Pilgrim to Dem" },
                { id: 50, name: "Pilgrim to Mea" },
                { id: 51, name: "Daybreak Gambler" },
                { id: 52, name: "The Pious One" },
                { id: 53, name: "A Moss Kind Person" },
                { id: 54, name: "Entrance Denied" },
                { id: 55, name: "Apiarist" },
                { id: 56, name: "Rabbiter" },
                { id: 57, name: "Royal Grave Keeper" },
                { id: 58, name: "Courier Extraordinaire" },
                { id: 59, name: "Ronfaurian Rescuer" },
                { id: 60, name: "Pickpocket Pincher" },
                { id: 61, name: "Fang Finder" },
                { id: 62, name: "Faith like a Candle" },
                { id: 63, name: "The Pure One" },
                { id: 64, name: "Lost Child Officer" },
                { id: 65, name: "Silencer of the Lambs" },
                { id: 66, name: "Lost & Found Officer" },
                { id: 67, name: "Green Grocer" },
                { id: 68, name: "The Benevolent One" },
                { id: 69, name: "Knight in Training" },
                { id: 70, name: "Lizard Skinner" },
                { id: 71, name: "Bug Catcher" },
                { id: 72, name: "Spelunker" },
                { id: 73, name: "Arms Trader" },
                { id: 74, name: "Traveling Medicine Man" },
                { id: 75, name: "Cat Skinner" },
                { id: 76, name: "Carp Diem" },
                { id: 77, name: "Advertising Executive" },
                { id: 78, name: "Third-rate Organizer" },
                { id: 79, name: "Second-rate Organizer" },
                { id: 80, name: "First-rate Organizer" },
                { id: 81, name: "Bastok Welcoming Committee" },
                { id: 82, name: "Shell Outer" },
                { id: 83, name: "Bucket Fisher" },
                { id: 84, name: "Pursuer of the Past" },
                { id: 85, name: "Pursuer of the Truth" },
                { id: 86, name: "Mommy's Helper" },
                { id: 87, name: "Hot Dog" },
                { id: 88, name: "Stampeder" },
                { id: 89, name: "Qiji's Friend" },
                { id: 90, name: "Qiji's Rival" },
                { id: 91, name: "Contest Rigger" },
                { id: 92, name: "Ringbearer" },
                { id: 93, name: "Kulatz Bridge Companion" },
                { id: 94, name: "Beadeaux Surveyor" },
                { id: 95, name: "Avenger" },
                { id: 96, name: "Treasure Scavenger" },
                { id: 97, name: "Airship Denouncer" },
                { id: 98, name: "Zeruhn Sweeper" },
                { id: 99, name: "Tearjerker" },
                { id: 100, name: "Crab Crusher" },
                { id: 101, name: "Star of Ifrit" },
                { id: 102, name: "Sorrow Drowner" },
                { id: 103, name: "Brygid-approved" },
                { id: 104, name: "Drachenfall Ascetic" },
                { id: 105, name: "\"Steaming Sheep\" Regular" },
                { id: 106, name: "Purple Belt" },
                { id: 107, name: "Gustaberg Tourist" },
                { id: 108, name: "Sand Blaster" },
                { id: 109, name: "Black Death" },
                { id: 110, name: "0" },
                { id: 111, name: "Fresh \"North Winds\" Recruit" },
                { id: 112, name: "New \"Best of the West\" Recruit" },
                { id: 113, name: "New \"Buuma's Boomers\" Recruit" },
                { id: 114, name: "Heavens Tower Gatehouse Recruit" },
                { id: 115, name: "Cat Burglar Groupie" },
                { id: 116, name: "Crawler Culler" },
                { id: 117, name: "Savior of Knowledge" },
                { id: 118, name: "Star-ordained Warrior" },
                { id: 119, name: "Lower than the Lowest Tunnel Worm" },
                { id: 120, name: "Star Onion Brigade Member" },
                { id: 121, name: "Star Onion Brigadier" },
                { id: 122, name: "Quick Fixer" },
                { id: 123, name: "Fake-moustached Investigator" },
                { id: 124, name: "Hakkuru-Rinkuru's Benefactor" },
                { id: 125, name: "S.O.B. Super Hero" },
                { id: 126, name: "Editor's Hatchet Man" },
                { id: 127, name: "Doctor Shantotto's Guinea Pig" },
                { id: 128, name: "Spoilsport" },
                { id: 129, name: "Super Model" },
                { id: 130, name: "Ghostie Buster" },
                { id: 131, name: "Night Sky Navigator" },
                { id: 132, name: "Fast Food Deliverer" },
                { id: 133, name: "Cupid's Florist" },
                { id: 134, name: "Tarutaru Murder Suspect" },
                { id: 135, name: "Hexer Vexer" },
                { id: 136, name: "Cardian Tutor" },
                { id: 137, name: "Deliverer of Tearful News" },
                { id: 138, name: "Fossilized Sea Farer" },
                { id: 139, name: "Down Piper Pipe-upperer" },
                { id: 140, name: "Kisser Make-upper" },
                { id: 141, name: "Timekeeper" },
                { id: 142, name: "Fortune-teller in Training" },
                { id: 143, name: "Torchbearer" },
                { id: 144, name: "Tenshodo Member" },
                { id: 145, name: "Chocobo Trainer" },
                { id: 146, name: "Bringer of Bliss" },
                { id: 147, name: "Activist for Kindness" },
                { id: 148, name: "Envoy to the North" },
                { id: 149, name: "Exorcist in Training" },
                { id: 150, name: "Professional Loafer" },
                { id: 151, name: "Clock Tower Preservationist" },
                { id: 152, name: "Life Saver" },
                { id: 153, name: "Fool's Errand Runner" },
                { id: 154, name: "Card Collector" },
                { id: 155, name: "Researcher of Classics" },
                { id: 156, name: "Street Sweeper" },
                { id: 157, name: "Mercy Errand Runner" },
                { id: 158, name: "Two's Company" },
                { id: 159, name: "Believer of Altana" },
                { id: 160, name: "Trader of Mysteries" },
                { id: 161, name: "Trader of Antiquities" },
                { id: 162, name: "Trader of Renown" },
                { id: 163, name: "Brown Belt" },
                { id: 164, name: "Horizon Breaker" },
                { id: 165, name: "Goblin's Exclusive Fashion Mannequin" },
                { id: 166, name: "Summit Breaker" },
                { id: 167, name: "Sky Breaker" },
                { id: 168, name: "Cloud Breaker" },
                { id: 169, name: "Star Breaker" },
                { id: 170, name: "Greedalox" },
                { id: 171, name: "Certified Rhinostery Venturer" },
                { id: 172, name: "Cordon Bleu Fisher" },
                { id: 173, name: "Ace Angler" },
                { id: 174, name: "Lu Shang-like Fisher King" },
                { id: 175, name: "Matchmaker" },
                { id: 176, name: "Ecologist" },
                { id: 177, name: "Li'l Cupid" },
                { id: 178, name: "The Love Doctor" },
                { id: 179, name: "Savior of Love" },
                { id: 180, name: "Honorary Citizen of Selbina" },
                { id: 181, name: "Purveyor in Training" },
                { id: 182, name: "One-star Purveyor" },
                { id: 183, name: "Two-star Purveyor" },
                { id: 184, name: "Three-star Purveyor" },
                { id: 185, name: "Four-star Purveyor" },
                { id: 186, name: "Five-star Purveyor" },
                { id: 187, name: "Doctor Yoran-Oran Supporter" },
                { id: 188, name: "Doctor Shantotto Supporter" },
                { id: 189, name: "Professor Koru-Moru Supporter" },
                { id: 190, name: "Rainbow Weaver" },
                { id: 191, name: "Shadow Walker" },
                { id: 192, name: "Heir to the Holy Crest" },
                { id: 193, name: "Bushido Blade" },
                { id: 194, name: "0" },
                { id: 195, name: "Paragon of Paladin Excellence" },
                { id: 196, name: "Paragon of Beastmaster Excellence" },
                { id: 197, name: "Paragon of Ranger Excellence" },
                { id: 198, name: "Paragon of Dark Knight Excellence" },
                { id: 199, name: "Paragon of Bard Excellence" },
                { id: 200, name: "Paragon of Samurai Excellence" },
                { id: 201, name: "Paragon of Dragoon Excellence" },
                { id: 202, name: "Paragon of Ninja Excellence" },
                { id: 203, name: "Paragon of Summoner Excellence" },
                { id: 204, name: "0" },
                { id: 205, name: "0" },
                { id: 206, name: "New Adventurer" },
                { id: 207, name: "Certified Adventurer" },
                { id: 208, name: "Shadow Banisher" },
                { id: 209, name: "Tried and Tested Knight" },
                { id: 210, name: "Dark Sider" },
                { id: 211, name: "The Fanged One" },
                { id: 212, name: "Have Wings, Will Fly" },
                { id: 213, name: "Animal Trainer" },
                { id: 214, name: "Wandering Minstrel" },
                { id: 215, name: "Mog's Master" },
                { id: 216, name: "Mog's Kind Master" },
                { id: 217, name: "Mog's Exceptionally Kind Master" },
                { id: 218, name: "Paragon of Warrior Excellence" },
                { id: 219, name: "Paragon of Monk Excellence" },
                { id: 220, name: "Paragon of Red Mage Excellence" },
                { id: 221, name: "Paragon of Thief Excellence" },
                { id: 222, name: "Paragon of Black Mage Excellence" },
                { id: 223, name: "Paragon of White Mage Excellence" },
                { id: 224, name: "Mog's Loving Master" },
                { id: 225, name: "0" },
                { id: 226, name: "Royal Archer" },
                { id: 227, name: "Royal Spearman" },
                { id: 228, name: "Royal Squire" },
                { id: 229, name: "Royal Swordsman" },
                { id: 230, name: "Royal Cavalier" },
                { id: 231, name: "Royal Guard" },
                { id: 232, name: "Grand Knight of the Realm" },
                { id: 233, name: "Grand Temple Knight" },
                { id: 234, name: "Reserve Knight Captain" },
                { id: 235, name: "Elite Royal Guard" },
                { id: 236, name: "Legionnaire" },
                { id: 237, name: "Decurion" },
                { id: 238, name: "Centurion" },
                { id: 239, name: "Junior Musketeer" },
                { id: 240, name: "Senior Musketeer" },
                { id: 241, name: "Musketeer Commander" },
                { id: 242, name: "Gold Musketeer" },
                { id: 243, name: "Praefectus" },
                { id: 244, name: "Senior Gold Musketeer" },
                { id: 245, name: "Praefectus Castrorum" },
                { id: 246, name: "Freesword" },
                { id: 247, name: "Mercenary" },
                { id: 248, name: "Mercenary Captain" },
                { id: 249, name: "Combat Caster" },
                { id: 250, name: "Tactician Magician" },
                { id: 251, name: "Wise Wizard" },
                { id: 252, name: "Patriarch Protector" },
                { id: 253, name: "Caster Captain" },
                { id: 254, name: "Master Caster" },
                { id: 255, name: "Mercenary Major" },
                { id: 256, name: "Fugitive Minister Bounty Hunter" },
                { id: 257, name: "King of the Opo-opos" },
                { id: 258, name: "Excommunicate of Kazham" },
                { id: 259, name: "Kazham Caller" },
                { id: 260, name: "Dream Dweller" },
                { id: 261, name: "Apprentice Sommelier" },
                { id: 262, name: "Desert Hunter" },
                { id: 263, name: "Seeker of Truth" },
                { id: 264, name: "Kuftal Tourist" },
                { id: 265, name: "The Immortal Fisher, Lu Shang" },
                { id: 266, name: "Looks Sublime in a Subligar" },
                { id: 267, name: "Looks Good in Leggings" },
                { id: 268, name: "Honorary Doctorate, Majoring in Tonberries" },
                { id: 269, name: "Treasure-house Ransacker" },
                { id: 270, name: "Cracker of the Secret Code" },
                { id: 271, name: "Black Marketeer" },
                { id: 272, name: "Acquirer of Ancient Arcanum" },
                { id: 273, name: "Ya Done Good" },
                { id: 274, name: "Heir of the Great Fire" },
                { id: 275, name: "Heir of the Great Earth" },
                { id: 276, name: "Heir of the Great Water" },
                { id: 277, name: "Heir of the Great Wind" },
                { id: 278, name: "Heir of the Great Ice" },
                { id: 279, name: "Heir of the Great Lightning" },
                { id: 280, name: "Guider of Souls to the Sanctuary" },
                { id: 281, name: "Bearer of Bonds Beyond Time" },
                { id: 282, name: "Friend of the Opo-opos" },
                { id: 283, name: "Hero on Behalf of Windurst" },
                { id: 284, name: "Victor of the Balga Contest" },
                { id: 285, name: "Gullible's Travels" },
                { id: 286, name: "Even More Gullible's Travels" },
                { id: 287, name: "Heir of the New Moon" },
                { id: 288, name: "Assassin Reject" },
                { id: 289, name: "Black Belt" },
                { id: 290, name: "Vermillion Venturer" },
                { id: 291, name: "Cerulean Soldier" },
                { id: 292, name: "Emerald Exterminator" },
                { id: 293, name: "Guiding Star" },
                { id: 294, name: "Vestal Chamberlain" },
                { id: 295, name: "San d'Orian Royal Heir" },
                { id: 296, name: "Hero Among Heroes" },
                { id: 297, name: "Dynamis-San d'Oria Interloper" },
                { id: 298, name: "Dynamis-Bastok Interloper" },
                { id: 299, name: "Dynamis-Windurst Interloper" },
                { id: 300, name: "Dynamis-Jeuno Interloper" },
                { id: 301, name: "Dynamis-Beaucedine Interloper" },
                { id: 302, name: "Dynamis-Xarcabard Interloper" },
                { id: 303, name: "Discerning Individual" },
                { id: 304, name: "Very Discerning Individual" },
                { id: 305, name: "Extremely Discerning Individual" },
                { id: 306, name: "Royal Wedding Planner" },
                { id: 307, name: "Consort Candidate" },
                { id: 308, name: "Obsidian Storm" },
                { id: 309, name: "Pentacide Perpetrator" },
                { id: 310, name: "Wood Worshiper" },
                { id: 311, name: "Lumber Lather" },
                { id: 312, name: "Accomplished Carpenter" },
                { id: 313, name: "Anvil Advocate" },
                { id: 314, name: "Forge Fanatic" },
                { id: 315, name: "Accomplished Blacksmith" },
                { id: 316, name: "Trinket Turner" },
                { id: 317, name: "Silver Smelter" },
                { id: 318, name: "Accomplished Goldsmith" },
                { id: 319, name: "Knitting Know-It-All" },
                { id: 320, name: "Loom Lunatic" },
                { id: 321, name: "Accomplished Weaver" },
                { id: 322, name: "Formula Fiddler" },
                { id: 323, name: "Potion Potentate" },
                { id: 324, name: "Accomplished Alchemist" },
                { id: 325, name: "Bone Beautifier" },
                { id: 326, name: "Shell Scrimshander" },
                { id: 327, name: "Accomplished Boneworker" },
                { id: 328, name: "Hide Handler" },
                { id: 329, name: "Leather Lauder" },
                { id: 330, name: "Accomplished Tanner" },
                { id: 331, name: "Fastriver Fisher" },
                { id: 332, name: "Coastline Caster" },
                { id: 333, name: "Accomplished Angler" },
                { id: 334, name: "Gourmand Gratifier" },
                { id: 335, name: "Banquet Bestower" },
                { id: 336, name: "Accomplished Chef" },
                { id: 337, name: "Fine Tuner" },
                { id: 338, name: "Friend of the Helmed" },
                { id: 339, name: "Tavnazian Squire" },
                { id: 340, name: "Ducal Dupe" },
                { id: 341, name: "Hyper Ultra Sonic Adventurer" },
                { id: 342, name: "Rod Retriever" },
                { id: 343, name: "Deed Verifier" },
                { id: 344, name: "Chocobo Love Guru" },
                { id: 345, name: "Pick-up Artist" },
                { id: 346, name: "Trash Collector" },
                { id: 347, name: "Ancient Flame Follower" },
                { id: 348, name: "Tavnazian Traveler" },
                { id: 349, name: "Transient Dreamer" },
                { id: 350, name: "The Lost One" },
                { id: 351, name: "Treader of an Icy Past" },
                { id: 352, name: "Branded by Lightning" },
                { id: 353, name: "Seeker of the Light" },
                { id: 354, name: "Dead Body" },
                { id: 355, name: "Frozen Dead Body" },
                { id: 356, name: "Dreambreaker" },
                { id: 357, name: "Mist Melter" },
                { id: 358, name: "Delta Enforcer" },
                { id: 359, name: "Omega Ostracizer" },
                { id: 360, name: "Ultima Undertaker" },
                { id: 361, name: "Ulmia's Soulmate" },
                { id: 362, name: "Tenzen's Ally" },
                { id: 363, name: "Companion of Louverance" },
                { id: 364, name: "True Companion of Louverance" },
                { id: 365, name: "Prishe's Buddy" },
                { id: 366, name: "Nag'molada's Underling" },
                { id: 367, name: "Esha'ntarl's Comrade in Arms" },
                { id: 368, name: "The Chebukkis' Worst Nightmare" },
                { id: 369, name: "Brown Mage Guinea Pig" },
                { id: 370, name: "Brown Magic By-Product" },
                { id: 371, name: "Bastok's Second Best Dressed" },
                { id: 372, name: "Rookie Hero Instructor" },
                { id: 373, name: "Goblin in Disguise" },
                { id: 374, name: "Apostate for Hire" },
                { id: 375, name: "Talks with Tonberries" },
                { id: 376, name: "Rook Buster" },
                { id: 377, name: "Banneret" },
                { id: 378, name: "Gold Balli☆☆☆☆star" },
                { id: 379, name: "Mythril Balli☆☆☆star" },
                { id: 380, name: "Silver Balli☆☆star" },
                { id: 381, name: "Bronze Balli☆star" },
                { id: 382, name: "Searing★Star" },
                { id: 383, name: "Striking★Star" },
                { id: 384, name: "Soothing★Star" },
                { id: 385, name: "Sable★Star" },
                { id: 386, name: "Scarlet★Star" },
                { id: 387, name: "Sonic★Star" },
                { id: 388, name: "Saintly★Star" },
                { id: 389, name: "Shadowy★Star" },
                { id: 390, name: "Savage★Star" },
                { id: 391, name: "Singing★Star" },
                { id: 392, name: "Sniping★Star" },
                { id: 393, name: "Slicing★Star" },
                { id: 394, name: "Sneaking★Star" },
                { id: 395, name: "Spearing★Star" },
                { id: 396, name: "Summoning★Star" },
                { id: 397, name: "Putrid Purveyor of Pungent Petals" },
                { id: 398, name: "Unquenchable Light" },
                { id: 399, name: "Ballistager" },
                { id: 400, name: "Ultimate Champion of the World" },
                { id: 401, name: "Warrior of the Crystal" },
                { id: 402, name: "Indomitable Fisher" },
                { id: 403, name: "Averter of the Apocalypse" },
                { id: 404, name: "Banisher of Emptiness" },
                { id: 405, name: "Random Adventurer" },
                { id: 406, name: "Irresponsible Adventurer" },
                { id: 407, name: "Odorous Adventurer" },
                { id: 408, name: "Insignificant Adventurer" },
                { id: 409, name: "Final Balli☆☆☆☆star" },
                { id: 410, name: "Balli☆☆☆☆star Royale" },
                { id: 411, name: "Destined Fellow" },
                { id: 412, name: "Orcish Serjeant" },
                { id: 413, name: "Bronze Quadav" },
                { id: 414, name: "Yagudo Initiate" },
                { id: 415, name: "Moblin Kinsman" },
                { id: 416, name: "Sin Hunter Hunter" },
                { id: 417, name: "Disciple of Justice" },
                { id: 418, name: "Monarch Linn Patrol Guard" },
                { id: 419, name: "Team Player" },
                { id: 420, name: "Worthy of Trust" },
                { id: 421, name: "Conqueror of Fate" },
                { id: 422, name: "Breaker of the Chains" },
                { id: 423, name: "A Friend Indeed" },
                { id: 424, name: "Heir to the Realm of Dreams" },
                { id: 425, name: "Gold Hook" },
                { id: 426, name: "Mythril Hook" },
                { id: 427, name: "Silver Hook" },
                { id: 428, name: "Copper Hook" },
                { id: 429, name: "0" },
                { id: 430, name: "Dynamis-Valkurm Interloper" },
                { id: 431, name: "Dynamis-Buburimu Interloper" },
                { id: 432, name: "Dynamis-Qufim Interloper" },
                { id: 433, name: "Dynamis-Tavnazia Interloper" },
                { id: 434, name: "Confronter of Nightmares" },
                { id: 435, name: "Disturber of Slumber" },
                { id: 436, name: "Interrupter of Dreams" },
                { id: 437, name: "Sapphire★Star" },
                { id: 438, name: "Surging★Star" },
                { id: 439, name: "Swaying★Star" },
                { id: 440, name: "Dark Resistant" },
                { id: 441, name: "Bearer of the Mark of Zahak" },
                { id: 442, name: "Seagull Phratrie Crew Member" },
                { id: 443, name: "Proud Automaton Owner" },
                { id: 444, name: "Private Second Class" },
                { id: 445, name: "Private First Class" },
                { id: 446, name: "Superior Private" },
                { id: 447, name: "Wildcat Publicist" },
                { id: 448, name: "Adamantking Usurper" },
                { id: 449, name: "Overlord Overthrower" },
                { id: 450, name: "Deity Debunker" },
                { id: 451, name: "Fafnir Slayer" },
                { id: 452, name: "Aspidochelone Sinker" },
                { id: 453, name: "Nidhogg Slayer" },
                { id: 454, name: "Maat Masher" },
                { id: 455, name: "Kirin Captivator" },
                { id: 456, name: "Cactrot Desacelerador" },
                { id: 457, name: "Lifter of Shadows" },
                { id: 458, name: "Tiamat Trouncer" },
                { id: 459, name: "Vrtra Vanquisher" },
                { id: 460, name: "World Serpent Slayer" },
                { id: 461, name: "Xolotl Xtrapolator" },
                { id: 462, name: "Boroka Beleaguerer" },
                { id: 463, name: "Ouryu Overwhelmer" },
                { id: 464, name: "Vinegar Evaporator" },
                { id: 465, name: "Virtuous Saint" },
                { id: 466, name: "Bye-bye, Taisai" },
                { id: 467, name: "Temenos Liberator" },
                { id: 468, name: "Apollyon Ravager" },
                { id: 469, name: "Wyrm Astonisher" },
                { id: 470, name: "Nightmare Awakener" },
                { id: 471, name: "Cerberus Muzzler" },
                { id: 472, name: "Hydra Headhunter" },
                { id: 473, name: "Shining Scale Rifler" },
                { id: 474, name: "Troll Subjugator" },
                { id: 475, name: "Gorgonstone Sunderer" },
                { id: 476, name: "Khimaira Carver" },
                { id: 477, name: "Elite Einherjar" },
                { id: 478, name: "Star Charioteer" },
                { id: 479, name: "Sun Charioteer" },
                { id: 480, name: "Subduer of the Mamool Ja" },
                { id: 481, name: "Subduer of the Trolls" },
                { id: 482, name: "Subduer of the Undead Swarm" },
                { id: 483, name: "Agent of the Allied Forces" },
                { id: 484, name: "Scenic Snapshotter" },
                { id: 485, name: "Branded by the Five Serpents" },
                { id: 486, name: "Immortal Lion" },
                { id: 487, name: "Paragon of Blue Mage Excellence" },
                { id: 488, name: "Paragon of Corsair Excellence" },
                { id: 489, name: "Paragon of Puppetmaster Excellence" },
                { id: 490, name: "Lance Corporal" },
                { id: 491, name: "Corporal" },
                { id: 492, name: "Master of Ambition" },
                { id: 493, name: "Master of Chance" },
                { id: 494, name: "Master of Manipulation" },
                { id: 495, name: "Ovjang's Errand Runner" },
                { id: 496, name: "Sergeant" },
                { id: 497, name: "Sergeant Major" },
                { id: 498, name: "Karababa's Tour Guide" },
                { id: 499, name: "Karababa's Bodyguard" },
                { id: 500, name: "Karababa's Secret Agent" },
                { id: 501, name: "Skyserpent Aggrandizer" },
                { id: 502, name: "Chief Sergeant" },
                { id: 503, name: "Aphmau's Mercenary" },
                { id: 504, name: "Nashmeira's Mercenary" },
                { id: 505, name: "Chocorookie" },
                { id: 506, name: "Second Lieutenant" },
                { id: 507, name: "Galeserpent Guardian" },
                { id: 508, name: "Stoneserpent Shocktrooper" },
                { id: 509, name: "Photopticator Operator" },
                { id: 510, name: "Salaheem's Risk Assessor" },
                { id: 511, name: "Treasure Trove Tender" },
                { id: 512, name: "Gessho's Mercy" },
                { id: 513, name: "Emissary of the Empress" },
                { id: 514, name: "Endymion Paratrooper" },
                { id: 515, name: "Naja's Comrade-In-Arms" },
                { id: 516, name: "Nashmeira's Loyalist" },
                { id: 517, name: "Preventer of Ragnarok" },
                { id: 518, name: "Champion of Aht Urhgan" },
                { id: 519, name: "First Lieutenant" },
                { id: 520, name: "Captain" },
                { id: 521, name: "Crystal Stakes Cupholder" },
                { id: 522, name: "Winning Owner" },
                { id: 523, name: "Victorious Owner" },
                { id: 524, name: "Triumphant Owner" },
                { id: 525, name: "High Roller" },
                { id: 526, name: "Fortune's Favorite" },
                { id: 527, name: "Superhero" },
                { id: 528, name: "Superheroine" },
                { id: 529, name: "Bloody Berserker" },
                { id: 530, name: "The Sixth Serpent" },
                { id: 531, name: "Eternal Mercenary" },
                { id: 532, name: "Springserpent Sentry" },
                { id: 533, name: "Sprightly★Star" },
                { id: 534, name: "Sagacious★Star" },
                { id: 535, name: "Schultz Scholar" },
                { id: 536, name: "Knight of the Iron Ram" },
                { id: 537, name: "Fourth Division Soldier" },
                { id: 538, name: "Cobra Unit Mercenary" },
                { id: 539, name: "Windtalker" },
                { id: 540, name: "Lady Killer" },
                { id: 541, name: "Troupe Brilioth Dancer" },
                { id: 542, name: "Cait Sith's Assistant" },
                { id: 543, name: "Ajido-Marujido's Minder" },
                { id: 544, name: "Comet Charioteer" },
                { id: 545, name: "Moon Charioteer" },
                { id: 546, name: "Sandworm Wrangler" },
                { id: 547, name: "Ixion Hornbreaker" },
                { id: 548, name: "Lambton Worm Desegmenter" },
                { id: 549, name: "Pandemonium Queller" },
                { id: 550, name: "Debaser of Dynasties" },
                { id: 551, name: "Disperser of Darkness" },
                { id: 552, name: "Ender of Idolatry" },
                { id: 553, name: "Lugh Exorcist" },
                { id: 554, name: "Elatha Exorcist" },
                { id: 555, name: "Ethniu Exorcist" },
                { id: 556, name: "Tethra Exorcist" },
                { id: 557, name: "Buarainech Exorcist" },
                { id: 558, name: "Oupire Impaler" },
                { id: 559, name: "Scylla Skinner" },
                { id: 560, name: "Zirnitra Wingclipper" },
                { id: 561, name: "Dawon Trapper" },
                { id: 562, name: "Krabkatoa Steamer" },
                { id: 563, name: "Orcus Trophy Hunter" },
                { id: 564, name: "Blobdingnag Burster" },
                { id: 565, name: "Verthandi Ensnarer" },
                { id: 566, name: "Ruthven Entomber" },
                { id: 567, name: "Yilbegan Hideflayer" },
                { id: 568, name: "Torchbearer of the 1st Walk" },
                { id: 569, name: "Torchbearer of the 2nd Walk" },
                { id: 570, name: "Torchbearer of the 3rd Walk" },
                { id: 571, name: "Torchbearer of the 4th Walk" },
                { id: 572, name: "Torchbearer of the 5th Walk" },
                { id: 573, name: "Torchbearer of the 6th Walk" },
                { id: 574, name: "Torchbearer of the 7th Walk" },
                { id: 575, name: "Torchbearer of the 8th Walk" },
                { id: 576, name: "Furniture Store Owner" },
                { id: 577, name: "Armory Owner" },
                { id: 578, name: "Jewelry Store Owner" },
                { id: 579, name: "Boutique Owner" },
                { id: 580, name: "Apothecary Owner" },
                { id: 581, name: "Curiosity Shop Owner" },
                { id: 582, name: "Shoeshop Owner" },
                { id: 583, name: "Fishmonger Owner" },
                { id: 584, name: "Restaurant Owner" },
                { id: 585, name: "Assistant Detective" },
                { id: 586, name: "Promising Dancer" },
                { id: 587, name: "Stardust Dancer" },
                { id: 588, name: "Elegant Dancer" },
                { id: 589, name: "Dazzling Dance Diva" },
                { id: 590, name: "Friend of Lehko Habhoka" },
                { id: 591, name: "Summa Cum Laude" },
                { id: 592, name: "Grimoire Bearer" },
                { id: 593, name: "Seasoning Connoisseur" },
                { id: 594, name: "Fine Young Griffon" },
                { id: 595, name: "Babban's Traveling Companion" },
                { id: 596, name: "Fellow Fortifier" },
                { id: 597, name: "Chocochampion" },
                { id: 598, name: "Traverser of Time" },
                { id: 599, name: "Mythril Musketeer No. 6" },
                { id: 600, name: "Jewel of the Cobra Unit" },
                { id: 601, name: "Knight of the Swiftwing Griffin" },
                { id: 602, name: "Wyrmsworn Protector" },
                { id: 603, name: "Flameserpent Facilitator" },
                { id: 604, name: "Maze Wanderer" },
                { id: 605, name: "Maze Navigator" },
                { id: 606, name: "Maze Scholar" },
                { id: 607, name: "Maze Artisan" },
                { id: 608, name: "Maze Overlord" },
                { id: 609, name: "Swarminator" },
                { id: 610, name: "Battle of Jeuno Veteran" },
                { id: 611, name: "Grand Greedalox" },
                { id: 612, name: "Karaha-Baruha's Research Assistant" },
                { id: 613, name: "Honorary Knight of the Cardinal Stag" },
                { id: 614, name: "Detector of Deception" },
                { id: 615, name: "Silencer of the Echo" },
                { id: 616, name: "Bestrider of Futures" },
                { id: 617, name: "Mog House Handyperson" },
                { id: 618, name: "Presidential Protector" },
                { id: 619, name: "The Moon's Companion" },
                { id: 620, name: "Arrester of the Ascension" },
                { id: 621, name: "House Aurchiat Retainer" },
                { id: 622, name: "Wanderer of Time" },
                { id: 623, name: "Smiter of the Shadow" },
                { id: 624, name: "Heir of the Blessed Radiance" },
                { id: 625, name: "Heir of the Blighted Gloom" },
                { id: 626, name: "Sworn to the Dark Divinity" },
                { id: 627, name: "Temperer of Mythril" },
                { id: 628, name: "Star in the Azure Sky" },
                { id: 629, name: "Fangmonger Forestaller" },
                { id: 630, name: "Visitor to Abyssea" },
                { id: 631, name: "Friend of Abyssea" },
                { id: 632, name: "Warrior of Abyssea" },
                { id: 633, name: "Stormer of Abyssea" },
                { id: 634, name: "Devastator of Abyssea" },
                { id: 635, name: "Hero of Abyssea" },
                { id: 636, name: "Champion of Abyssea" },
                { id: 637, name: "Conqueror of Abyssea" },
                { id: 638, name: "Savior of Abyssea" },
                { id: 639, name: "Vanquisher of Spite" },
                { id: 640, name: "Hadhayosh Halterer" },
                { id: 641, name: "Briareus Feller" },
                { id: 642, name: "Karkinos Clawcrusher" },
                { id: 643, name: "Carabosse Quasher" },
                { id: 644, name: "Ovni Obliterator" },
                { id: 645, name: "Ruminator Confounder" },
                { id: 646, name: "Eccentricity Expunger" },
                { id: 647, name: "Fistule Drainer" },
                { id: 648, name: "Kukulkan Defanger" },
                { id: 649, name: "Turul Grounder" },
                { id: 650, name: "Bloodeye Banisher" },
                { id: 651, name: "Satiator Depriver" },
                { id: 652, name: "Iratham Capturer" },
                { id: 653, name: "Lacovie Capsizer" },
                { id: 654, name: "Chloris Uprooter" },
                { id: 655, name: "Myrmecoleon Tamer" },
                { id: 656, name: "Glavoid Stampeder" },
                { id: 657, name: "Usurper Deposer" },
                { id: 658, name: "Yaanei Crasher" },
                { id: 659, name: "Kutharei Unhorser" },
                { id: 660, name: "Sippoy Capturer" },
                { id: 661, name: "Titlacauan Dismemberer" },
                { id: 662, name: "Smok Defogger" },
                { id: 663, name: "Amhuluk Inundater" },
                { id: 664, name: "Pulverizer Dismantler" },
                { id: 665, name: "Durinn Deceiver" },
                { id: 666, name: "Karkadann Exoculator" },
                { id: 667, name: "Ulhuadshi Desiccator" },
                { id: 668, name: "Itzpapalotl Declawer" },
                { id: 669, name: "Sobek Mummifier" },
                { id: 670, name: "Cirein-croin Harpooner" },
                { id: 671, name: "Bukhis Tetherer" },
                { id: 672, name: "Sedna Tuskbreaker" },
                { id: 673, name: "Cleaver Dismantler" },
                { id: 674, name: "Executioner Dismantler" },
                { id: 675, name: "Severer Dismantler" },
                { id: 676, name: "Lusca Debunker" },
                { id: 677, name: "Tristitia Deliverer" },
                { id: 678, name: "Ketea Beacher" },
                { id: 679, name: "Rani Decrowner" },
                { id: 680, name: "Orthrus Decapitator" },
                { id: 681, name: "Dragua Slayer" },
                { id: 682, name: "Bennu Deplumer" },
                { id: 683, name: "Hedjedjet Destinger" },
                { id: 684, name: "Cuijatender Desiccator" },
                { id: 685, name: "Brulo Extinguisher" },
                { id: 686, name: "Pantokrator Disprover" },
                { id: 687, name: "Apademak Annihilator" },
                { id: 688, name: "Isgebind Defroster" },
                { id: 689, name: "Resheph Eradicator" },
                { id: 690, name: "Empousa Expurgator" },
                { id: 691, name: "Indrik Immolator" },
                { id: 692, name: "Ogopogo Overturner" },
                { id: 693, name: "Raja Regicide" },
                { id: 694, name: "Alfard Detoxifier" },
                { id: 695, name: "Azdaja Abolisher" },
                { id: 696, name: "Amphitrite Shucker" },
                { id: 697, name: "Fuath Purifier" },
                { id: 698, name: "Killakriq Excoriator" },
                { id: 699, name: "Maere Bestirrer" },
                { id: 700, name: "Wyrm God Defier" },
                { id: 701, name: "Hahava Condemner" },
                { id: 702, name: "Celaeno Silencer" },
                { id: 703, name: "Voidwrought Deconstructor" },
                { id: 704, name: "Devourer of Shadows" },
                { id: 705, name: "Kaggen Clobberer" },
                { id: 706, name: "Akvan Absterger" },
                { id: 707, name: "Pil Unfrocker" },
                { id: 708, name: "Qilin Contravener" },
                { id: 709, name: "Uptala Reprobator" },
                { id: 710, name: "Aello Abator" },
                { id: 711, name: "Torchbearer of the 9th Walk" },
                { id: 712, name: "Torchbearer of the 10th Walk" },
                { id: 713, name: "Torchbearer of the 11th Walk" },
                { id: 714, name: "Nightmare Illuminator" },
                { id: 715, name: "Gaunab Gutter" },
                { id: 716, name: "Kalasutrax Cremator" },
                { id: 717, name: "Ocythoe Overrider" },
                { id: 718, name: "Ig-Alima Inhumer" },
                { id: 719, name: "Botulus Rex Engorger" },
                { id: 720, name: "Torchbearer of the 12th Walk" },
                { id: 721, name: "Torchbearer of the 13th Walk" },
                { id: 722, name: "Torchbearer of the 14th Walk" },
                { id: 723, name: "Torchbearer of the 15th Walk" },
                { id: 724, name: "Delver of the Depths" },
                { id: 725, name: "Subjugator of the Lofty" },
                { id: 726, name: "Subjugator of the Mired" },
                { id: 727, name: "Subjugator of the Soaring" },
                { id: 728, name: "Subjugator of the Veiled" },
                { id: 729, name: "Legendary Legionnaire" },
                { id: 730, name: "Witness to Provenance" },
                { id: 731, name: "Bismarck Flenser" },
                { id: 732, name: "Morta Extirpator" },
                { id: 733, name: "Unsung Heroine" },
                { id: 734, name: "Epic Heroine" },
                { id: 735, name: "Epic Einherjar" },
                { id: 736, name: "Mender of Wings" },
                { id: 737, name: "Champion of the Dawn" },
                { id: 738, name: "Bushin Aspirant" },
                { id: 739, name: "Bushin-Ryu Inheritor" },
                { id: 740, name: "Temenos Emancipator" },
                { id: 741, name: "Apollyon Razer" },
                { id: 742, name: "Goldwing Squasher" },
                { id: 743, name: "Silagilith Detonator" },
                { id: 744, name: "Surtr Smotherer" },
                { id: 745, name: "Dreyruk Predominator" },
                { id: 746, name: "Samursk Vitiator" },
                { id: 747, name: "Umagrhk Manemangler" },
                { id: 748, name: "Supernal Savant" },
                { id: 749, name: "Solar Sage" },
                { id: 750, name: "Bolide Baron" },
                { id: 751, name: "Moon Maven" },
                { id: 752, name: "Izyx Vexer" },
                { id: 753, name: "Grannus Garroter" },
                { id: 754, name: "Svaha Striker" },
                { id: 755, name: "Melisseus Domesticator" },
                { id: 756, name: "Waterway Exemplar" },
                { id: 757, name: "Cavern Exemplar" },
                { id: 758, name: "Muyingwa Wingcrusher" },
                { id: 759, name: "Dakuwaqa Trawler" },
                { id: 760, name: "Tojil Douser" },
                { id: 761, name: "Colkhab Dethroner" },
                { id: 762, name: "Achuka Glaciator" },
                { id: 763, name: "Tchakka Desiccator" },
                { id: 764, name: "Weald Exemplar" },
                { id: 765, name: "Hurkan Birdlimeist" },
                { id: 766, name: "Yumcax Logger" },
                { id: 767, name: "Colkhab Hivecrusher" },
                { id: 768, name: "Achuka Coagulator" },
                { id: 769, name: "Tchakka Filleter" },
                { id: 770, name: "Rabbit Tussler" },
                { id: 771, name: "Helminth Mincer" },
                { id: 772, name: "Mandragardener" },
                { id: 773, name: "Moppet Massacrer" },
                { id: 774, name: "Rip-roaring Limbrender" },
                { id: 775, name: "Shell Shocker" },
                { id: 776, name: "Yagudo Coopkeeper" },
                { id: 777, name: "Gigasplosion Expert" },
                { id: 778, name: "Brother-in-arms" },
                { id: 779, name: "Antica Hunter" },
                { id: 780, name: "Amphibian Adulterator" },
                { id: 781, name: "Tonberry Toppler" },
                { id: 782, name: "Bloodline Corrupter" },
                { id: 783, name: "Kumhau Roaster" },
                { id: 784, name: "Brilliance Manifest" },
                { id: 785, name: "Quieter of Ancient Thoughts" },
                { id: 786, name: "Ark Hume Humiliator" },
                { id: 787, name: "Ark Elvaan Eviscerator" },
                { id: 788, name: "Ark Mithra Maligner" },
                { id: 789, name: "Ark Tarutaru Trouncer" },
                { id: 790, name: "Ark Galka Gouger" },
                { id: 791, name: "Pentarch Pacifier" },
                { id: 792, name: "Dream Distiller" },
                { id: 793, name: "Ra'Kaznar Exemplar" },
                { id: 794, name: "Utkux Peltburner" },
                { id: 795, name: "Cailimh Plumageplucker" },
                { id: 796, name: "Wopket Trunksplitter" },
                { id: 797, name: "Ouryu Obfuscator" },
                { id: 798, name: "Unwavering Blaze" },
                { id: 799, name: "Lancelord Divester" },
                { id: 800, name: "Gessho Pinioner" },
                { id: 801, name: "Sin Purger" },
                { id: 802, name: "Adumbration Disperser" },
                { id: 803, name: "Queller of Otherworldly Gales" },
                { id: 804, name: "Blaze Marshaller" },
                { id: 805, name: "Penitentes Blaster" },
                { id: 806, name: "Sirocco Tamer" },
                { id: 807, name: "Suchian Feller" },
                { id: 808, name: "Ombifid Slayer" },
                { id: 809, name: "Nilotican Decimator" },
                { id: 810, name: "Illuminator of the 1st Walk" },
                { id: 811, name: "Illuminator of the 2nd Walk" },
                { id: 812, name: "Illuminator of the 3rd Walk" },
                { id: 813, name: "Illuminator of the 4th Walk" },
                { id: 814, name: "Illuminator of the 5th Walk" },
                { id: 815, name: "Illuminator of the 6th Walk" },
                { id: 816, name: "Illuminator of the 7th Walk" },
                { id: 817, name: "Illuminator of the 8th Walk" },
                { id: 818, name: "Illuminator of the 9th Walk" },
                { id: 819, name: "Illuminator of the 10th Walk" },
                { id: 820, name: "Illuminator of the 11th Walk" },
                { id: 821, name: "Illuminator of the 12th Walk" },
                { id: 822, name: "Illuminator of the 13th Walk" },
                { id: 823, name: "Illuminator of the 14th Walk" },
                { id: 824, name: "Illuminator of the 15th Walk" },
                { id: 825, name: "Lithosphere Annihilator" },
                { id: 826, name: "Fulmination Disruptor" },
                { id: 827, name: "Bore Repulsor" },
                { id: 828, name: "Palloritus Punisher" },
                { id: 829, name: "Putraxia Pulverizer" },
                { id: 830, name: "Rancibus Ravager" },
                { id: 831, name: "Alluvion Assailant" },
                { id: 832, name: "Perfidien Paindealer" },
                { id: 833, name: "Plouton Pincer" },
                { id: 834, name: "Fleetstalker Fileter" },
                { id: 835, name: "Shockmaw Subjugator" },
                { id: 836, name: "Geodancer" },
                { id: 837, name: "Runic Engraver" },
                { id: 838, name: "Apprentice Tarutaru Sauce Manager" },
                { id: 839, name: "Vegetable Revolutionary" },
                { id: 840, name: "Friend to Gluttons" },
                { id: 841, name: "Waypoint Warrior" },
                { id: 842, name: "Ulbukan Stalwart" },
                { id: 843, name: "Toxin Tussler" },
                { id: 844, name: "Spiritual★Star" },
                { id: 845, name: "Stippling★Star" },
                { id: 846, name: "Geomancipator" },
                { id: 847, name: "Trialed-and-True Runeist" },
                { id: 848, name: "Queen's Confidante" },
                { id: 849, name: "Princess's Partisan" },
                { id: 850, name: "Potation Pathfinder" },
                { id: 851, name: "Storied Geomancer" },
                { id: 852, name: "Ultimate Runeist" },
                { id: 853, name: "Mog Garden Seedling" },
                { id: 854, name: "Kit Empathizer" },
                { id: 855, name: "Jingly Dangler" },
                { id: 856, name: "Mole Manipulator" },
                { id: 857, name: "Agrarian Novice" },
                { id: 858, name: "Agrarian Initiate" },
                { id: 859, name: "Agrarian Professional" },
                { id: 860, name: "Agrarian Virtuoso" },
                { id: 861, name: "Agrarian Tutelar" },
                { id: 862, name: "Weed Praetor" },
                { id: 863, name: "Tree Praetor" },
                { id: 864, name: "Thicket Praetor" },
                { id: 865, name: "Forest Praetor" },
                { id: 866, name: "Jungle Praetor" },
                { id: 867, name: "Copper Mattock" },
                { id: 868, name: "Silver Mattock" },
                { id: 869, name: "Mythril Mattock" },
                { id: 870, name: "Gold Mattock" },
                { id: 871, name: "Adamanttock" },
                { id: 872, name: "Puddle Patron" },
                { id: 873, name: "Swamp Savant" },
                { id: 874, name: "Pond Preceptor" },
                { id: 875, name: "River Regent" },
                { id: 876, name: "Monke-Onke Master" },
                { id: 877, name: "Sardineophyte" },
                { id: 878, name: "Calamareeler" },
                { id: 879, name: "Octopotentate" },
                { id: 880, name: "Giant Squimperator" },
                { id: 881, name: "Leviauthority" },
                { id: 882, name: "Novice Nurseryman" },
                { id: 883, name: "Lesser Landscaper" },
                { id: 884, name: "Greater Gardener" },
                { id: 885, name: "Honored Horticulturist" },
                { id: 886, name: "Mog Gardener" },
                { id: 887, name: "Brygidesque Manager" },
                { id: 888, name: "Vegetable Evolutionary" },
                { id: 889, name: "Blade Enthusiast" },
                { id: 890, name: "Runic Emissary" },
                { id: 891, name: "Maester of Maddening" },
                { id: 892, name: "Sunshine Cadet" },
                { id: 893, name: "Quartet Captivator" },
                { id: 894, name: "The Trustworthy" },
                { id: 895, name: "The Lovelorn" },
                { id: 896, name: "Inventor Extraordinaire" },
                { id: 897, name: "Boomy and Busty" },
                { id: 898, name: "Weatherer of Brumal Climes" },
                { id: 899, name: "White Knight" },
                { id: 900, name: "Light of Dawn" },
                { id: 901, name: "Observer of Fateful Cubes" },
                { id: 902, name: "Knower of Untruths" },
                { id: 903, name: "Ulbukan Understudy" },
                { id: 904, name: "Keeper of Ulbuka" },
                { id: 905, name: "Radiance of Daybreak" },
                { id: 906, name: "Wibbly Wobbly Woozy Warrior" },
                { id: 907, name: "Heir of Eternity" },
                { id: 908, name: "Prospective Pamperer" },
                { id: 909, name: "Novice Nuzzler" },
                { id: 910, name: "Serious Snuggler" },
                { id: 911, name: "Cultivated Coddler" },
                { id: 912, name: "Respected Ruffler" },
                { id: 913, name: "Dung Disseminator" },
                { id: 914, name: "Fauna Feeder" },
                { id: 915, name: "Confident Caretaker" },
                { id: 916, name: "Glorious Groomer" },
                { id: 917, name: "Transcendental Tamer" },
                { id: 918, name: "Bond-building Breeder" },
                { id: 919, name: "Clumsy Cleaver" },
                { id: 920, name: "Disciplined Dissector" },
                { id: 921, name: "Established Examiner" },
                { id: 922, name: "Sublime Slicer" },
                { id: 923, name: "Lifter of Spirits" },
                { id: 924, name: "Shedder of Harlequin Tears" },
                { id: 925, name: "Hope for the Future" },
                { id: 926, name: "Thousand-Year Traveler" },
                { id: 927, name: "Vanquisher of Ashrakk" },
                { id: 928, name: "Vanquisher of Dhokmak" },
                { id: 929, name: "Protected by Ulbukan Spirits" },
                { id: 930, name: "Receiver of Sigils" },
                { id: 931, name: "Destroyer of Hades" },
                { id: 932, name: "Bringer of the Dawn" },
                { id: 933, name: "The One True Pioneer" },
                { id: 934, name: "Bringer of Hope" },
                { id: 935, name: "Good Dew-er" },
                { id: 936, name: "Lifecycler" },
                { id: 937, name: "Sword Saint" },
                { id: 938, name: "The Fated" },
                { id: 939, name: "0" },
                { id: 940, name: "Urmahlullu Usurper" },
                { id: 941, name: "Blazewing Berater" },
                { id: 942, name: "Cove Collapser" },
                { id: 943, name: "Pazuzu Perplexer" },
                { id: 944, name: "Wrathare Waxer" },
                { id: 945, name: "0" },
                { id: 946, name: "0" },
                { id: 947, name: "0" },
                { id: 948, name: "0" },
                { id: 949, name: "0" },
                { id: 950, name: "0" },
                { id: 951, name: "0" },
                { id: 952, name: "0" },
                { id: 953, name: "0" },
                { id: 954, name: "0" },
                { id: 955, name: "0" },
                { id: 956, name: "0" },
                { id: 957, name: "0" },
                { id: 958, name: "0" },
                { id: 959, name: "0" },
                { id: 960, name: "0" },
                { id: 961, name: "0" },
                { id: 962, name: "0" },
                { id: 963, name: "0" },
                { id: 964, name: "0" },
                { id: 965, name: "0" },
                { id: 966, name: "0" },
                { id: 967, name: "0" },
                { id: 968, name: "0" },
                { id: 969, name: "0" },
                { id: 970, name: "0" },
                { id: 971, name: "0" }
            ];

        if (titles[val] == null)
            return '(Unknown Title ' + val + ')';
        return titles[val].name;
    };
});

/**
 * timestamp (filter) - Converts the given value to a timestamp.
 *
 * @param {number}                  The raw time to convert.
 * @returns {string}                The converted timestamp.
 */
arcanusdsp.filter('timestamp', function () {
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

///////////////////////////////////////////////////////////////////////////////////////////////////
//
// Account Profile Angular Addons
//
///////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * accountCharacterJobInformation (filter) - Converts the given accounts data to a string of job information.
 *
 * @param {object} c                The character to pull the job information from.
 * @returns {string}                The characters job information.
 */
arcanusdsp.filter('accountCharacterJobInformation', function () {
    return function (c) {
        if (!c)
            return '?/?';

        const jobs = ['', 'war', 'mnk', 'whm', 'blm', 'rdm', 'thf', 'pld', 'drk', 'bst', 'brd', 'rng', 'sam', 'nin', 'drg', 'smn', 'blu', 'cor', 'pup', 'dnc', 'sch', 'geo', 'run'];
        var mJob = jobs[c.mjob].toUpperCase();
        var sJob = jobs[c.sjob].toUpperCase();

        const padLeft = function (s, n) {
            return Array(n - String(s).length + 1).join('0') + s;
        };

        var ret = mJob + padLeft(c.mlvl, 2);
        if (sJob.length > 0)
            ret += '/' + sJob + padLeft(c.slvl, 2);
        return ret;
    };
});

/**
 * accountPrivileges (filter) - Converts the given privilege number to its string value.
 *
 * @param {object} val              The value to convert.
 * @returns {string}                The converted value.
 */
arcanusdsp.filter('accountPrivileges', function () {
    return function (val) {
        var privileges = '(Unknown)';

        if ((val & 0x01) == 0x01)
            privileges = 'User';
        if ((val & 0x02) == 0x02)
            privileges = 'Admin';
        if ((val & 0x04) == 0x04)
            privileges = 'Admin (Root)';

        return privileges;
    };
});

/**
 * accountStatus (filter) - Converts the given status number to its string value.
 *
 * @param {object} val              The value to convert.
 * @returns {string}                The converted value.
 */
arcanusdsp.filter('accountStatus', function () {
    return function (val) {
        var status = '(Unknown)';

        if ((val & 0x01) == 0x01)
            status = 'Normal (Good Standing)';
        if ((val & 0x02) == 0x02)
            status = 'Banned';

        return status;
    };
});
