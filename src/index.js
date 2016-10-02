var Application = require('./application');
var Bookmarklet = require('./bookmarklet');
var Mounter = require('./mounter');
var formules = require('./formules');
var slice = Array.prototype.slice;
var mounter = Mounter();

// start/stop the Application on the Nainwak game page
function run(config) {
    var app = window.nanyApplication;

    // if the application is already launched, stop it
    if (app) {
        app.destroy();
        window.nanyApplication = undefined;  // can't call "delete" on window in some IE
        return;
    }

    // start the application
    window.nanyApplication = Application(config);
}

function addComponent(createComponent) {
    return function (selector/*, args*/) {
        var node = document.querySelector(selector);
        var args = slice.call(arguments, 1);
        mounter.append(node, createComponent.apply(null, args));
    };
}

module.exports = Object.freeze({
    run: run,
    addBookmarklet: addComponent(Bookmarklet),
    addFormules: addComponent(function() { return formules; })
});
