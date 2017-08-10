var array = require('core-js/library/fn/array');
var applicationUrls = require('src/application-urls');
var Mounter = require('src/utilities/mounter');
var analyzeJoueur = require('./analyzers/joueur');
var Storage = require('src/storage');
var Spy = require('src/spy');
var Ring = require('src/ring');
//var Channel = require('src/channel');
var Dashboard = require('src/dashboard');
var pages = require('src/pages');
var log = require('src/utilities/log');

/* Application class */
function Application(config) {
    var applicationName = config.name;
    if (!applicationName) {
        throw 'Application name is mandatory, please provide one in the configuration';
    }

    var frames = window.frames;
    var infoFrame = frames.info;
    var menuDocument = frames.menu.document;
    var container = frames.pub.document.body;
    var jeu = {};  // game information fetched by the current joueur

    // analyze the menu in order the get the joueur information
    var joueur = analyzeJoueur(menuDocument, new Date());
    jeu.joueur = joueur;

    // add the nany CSS into the container document...
    var removeCSS = addCSS(container.ownerDocument);

    // create a mounter to render our components into the DOM
    var mounter = Mounter();

    function refreshUI() {
        mounter.scheduleRender();
    }

    // create a storage to save the settings of the current player
    var storage = Storage('Nany/' + applicationName + '/' + jeu.joueur.nom);

    // create the spy if the info frame is available
    var spy;
    if (infoFrame) {
        spy = Spy(infoFrame);
        spy.documentChanged.add(function (doc) {
            var url = doc.location.pathname;
            log('Navigation to ' + url);
            processPageDocument(url, doc);
        });
    }

    // create the ring if an update URL is available
    var ring;
    if (config.ring) {
        ring = Ring(config.ring, storage, refreshUI);
    }

    /*
    // create the (communication) channel
    var channel = Channel(config.name, config.publishKey, config.subscribeKey);
    channel.connect();
    */

    // create the dashboard object
    var dashboard = Dashboard(applicationName, ring, storage, refreshUI);

    // install our UI
    var containerChildren = array.from(container.childNodes);
    container.innerHTML = '';
    var unmount = mounter.append(container, dashboard);

    // finally, load the perso page
    loadPersoPage();

    function destroy() {
        /*
        // disconnect the channel
        channel.disconnect();
        */

        // remove the CSS
        removeCSS();

        // restore the container's initial content
        unmount();
        container.innerHTML = '';
        containerChildren.forEach(function (child) {
            container.appendChild(child);
        });

        // destroy the spy
        if (spy) {
            spy.destroy();
        }
    }

    function processPageDocument(url, doc) {
        var date = new Date();
        var page = pages.byUrl(url);
        var analysis;

        if (!page) {
            return;
        }

        // analyze the page
        if (page.analyze) {
            analysis = page.analyze(doc, date, jeu);
            log(analysis);
        }

        // send an update to the server if needed
        if (ring) {
            ring.processPage(page, doc, date, analysis, joueur);
        }

        // enhance the page
        if (page.enhance) {
            // add the Nany CSS in the new document
            addCSS(doc);

            // enhance
            page.enhance(doc, jeu);
        }
    }

    function loadPersoPage() {
        var persoPage = pages.byType('perso');
        var joueur = jeu.joueur;

        log('Loading perso page');
        persoPage.fetch(joueur.ids, function (response) {
            if (response.statusCode === 200) {
                log('OK');
                processPageDocument(persoPage.url, response.body);
            } else {
                log('FAIL (' + response.statusCode + ')');
            }
        });
    }

    function addCSS(doc) {
        var linkId = 'nanyCSS';
        var link = doc.getElementById(linkId);
        var head = doc.getElementsByTagName('head')[0];

        // insert the CSS file if needed (we never remove it!)
        if (!link) {
            link = doc.createElement('link');
            link.setAttribute('rel', 'stylesheet');
            link.setAttribute('type', 'text/css');
            link.setAttribute('href', applicationUrls.cssUrl);
            link.setAttribute('id', linkId);
            head.appendChild(link);
        }

        return function removeCSS() {
            head.removeChild(link);
        };
    }

    return Object.freeze({
        destroy: destroy
    });
}

module.exports = Application;
