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

module.exports = function (arcanus) {
    /**
     * Default Constructor
     *
     * @constructor
     */
    function Plugin() { }

    /**
     * The right-side main menu for account handling. (Guest)
     *
     * @type {Array}
     */
    var mainMenuRightGuest = [
        {
            alias: 'login',
            href: '/account/login',
            icon: 'fa-sign-in',
            title: 'login'
        }
    ];

    /**
     * The right-side main menu for account handling. (Logged In)
     *
     * @type {Array}
     */
    var mainMenuRightUser = [
        {
            alias: 'account',
            href: '',
            icon: 'fa-gear',
            title: 'Account',
            children: [
                {
                    alias: 'profile',
                    href: '/account/profile',
                    icon: 'fa-user',
                    title: 'Profile'
                },
                {
                    alias: 'account-sep1',
                    separator: true
                },
                {
                    alias: 'changeemail',
                    href: '/account/changeemail',
                    icon: 'fa-envelope-o',
                    title: 'Change Email'
                },
                {
                    alias: 'changepassword',
                    href: '/account/changepassword',
                    icon: 'fa-key',
                    title: 'Change Password'
                }
            ]
        },
        {
            alias: 'logout',
            href: '/account/logout',
            icon: 'fa-sign-out',
            title: 'logout',
        }
    ];

    /**
     * Initializes the plugin.
     *
     * @param {function} done                       The callback to invoke when finished.
     */
    Plugin.Initialize = function (done) {
        // Implement the passport-local login strategy..
        require('./include/passport-local')(arcanus, arcanus.passport);

        // Register the routes for this plugin..
        var pluginService = arcanus.services.get('pluginservice');
        pluginService.registerRouter('arcanusdsp', '/account', require('./routes/account')(arcanus));

        // Build the right-side menus for the website..
        var menuService = arcanus.services.get('menuservice');
        var menuOptionsRight = {
            class: 'nav navbar-nav navbar-right'
        };
        menuService.createMenu('main-right-guest', mainMenuRightGuest, menuOptionsRight);
        menuService.createMenu('main-right-user', mainMenuRightUser, menuOptionsRight);

        done(null, true);
    };

    // Return the plugin instance..
    return Plugin;
};