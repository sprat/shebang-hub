var assign = require('core-js/library/fn/object/assign');
var Page = require('./page');
var nainwak = require('../nainwak');
var dom = require('../dom');
var analyzeObjets = require('../analyzers/objets');
var analyzePager = require('../analyzers/pager');
var Objet = require('../enhancers/objet');
var Box = require('../widgets/box');
var Mounter = require('../mounter');

function analyze(doc, date, jeu) {
    var objets = analyzeObjets(doc, date);
    var pager = analyzePager(doc, date);

    jeu.objets = jeu.objets || {};
    assign(jeu.objets, objets);

    // update the 'perso' bonus data according to the objects in 'inventaire'
    if (jeu.perso) {
        var bonuses = nainwak.bonusObjets(jeu.objets.inventaire);
        assign(jeu.perso, bonuses);
    }

    return {
        objets: objets,
        pager: pager
    };
}

function findObjetsContainers(doc) {
    var objetsTables = dom.findAll('table', doc);
    return objetsTables.map(function (objetTable) {
        return objetTable.find('.news-text');  // first .news-text td in table
    });
}

function enhance(doc, jeu) {
    var mounter = Mounter();
    var bonnet = jeu.objets.bonnet || [];
    var inventaire = jeu.objets.inventaire || [];
    var objets = bonnet.concat(inventaire);
    var containers = findObjetsContainers(doc);

    containers.forEach(function (container, index) {
        mounter.prepend(container, Box(Objet(objets[index], jeu)));
    });
}

module.exports = Page('invent', {
    analyze: analyze,
    enhance: enhance
});
