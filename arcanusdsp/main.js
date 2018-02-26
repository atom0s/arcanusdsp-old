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
     * The main menu object to create for the arcanusdsp website.
     *
     * @type {Array}
     */
    var mainMenu = [
        {
            alias: 'community',
            href: '',
            icon: 'fa-globe',
            title: 'Community',
            children: [
                {
                    alias: 'forums',
                    href: 'https://www.kupoffxi.com/forums/',
                    icon: 'fa-list',
                    title: 'Forums',
                },
                {
                    alias: 'wiki',
                    href: 'http://kupoffxi.wikia.com/wiki/Kupo_FFXI_Wiki',
                    icon: 'fa-wikipedia-w',
                    title: 'Wiki',
                },
                {
                    alias: 'chat',
                    href: 'https://discord.gg/bNJ9hHY',
                    icon: 'fa-comments-o',
                    title: 'Chat (Discord)',
                },
                {
                    alias: 'ashita',
                    href: 'http://ashita.atom0s.com/',
                    icon: 'fa-gears',
                    title: 'Ashita',
                },
                {
                    alias: 'community-sep00',
                    separator: true
                },
                {
                    alias: 'bugreports',
                    href: 'https://github.com/KupoServer/Issues',
                    icon: 'fa-github',
                    title: 'Bug Reports (Server)',
                },
                {
                    alias: 'bugreportsweb',
                    href: 'https://github.com/KupoServer/Website',
                    icon: 'fa-github',
                    title: 'Bug Reports (Website)',
                }
            ]
        },
        {
            alias: 'database',
            href: '',
            icon: 'fa-database',
            title: 'Database Tools',
            children: [
                {
                    alias: 'whosoinline',
                    href: 'https://devbeta.kupoffxi.com/whosonline/',
                    icon: 'fa-list',
                    title: 'Whos Online (Mobile)',
                },
                {
                    alias: 'database-sep00',
                    separator: true
                }
            ]
        },
        {
            alias: 'guides',
            href: '',
            icon: 'fa-info-circle',
            title: 'Guides',
            children: [
            ]
        },
        {
            alias: 'donate',
            href: '/donate',
            icon: 'fa-paypal',
            title: 'Donate',
        }
    ];

    /**
     * Initializes the plugin.
     *
     * @param {function} done                       The callback to invoke when finished.
     */
    Plugin.Initialize = function (done) {
        // Register the routes for this plugin..
        var pluginService = arcanus.services.get('pluginservice');
        pluginService.registerRouter('arcanusdsp', '/', require('./routes/index')(arcanus));
        pluginService.registerRouter('arcanusdsp', '/ajax', require('./routes/ajax')(arcanus));

        // Build the base menu for the website..
        var menuService = arcanus.services.get('menuservice');
        var menuOptions = {
            class: 'nav navbar-nav navbar-left'
        };
        menuService.createMenu('main', mainMenu, menuOptions);

        done(null, true);
    };

    // Return the plugin instance..
    return Plugin;
};