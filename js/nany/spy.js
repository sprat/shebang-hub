define(['./nainwak', 'utils/log'], function (nainwak, log) {
    'use strict';

    /* Spy class */
    function Spy(frame) {
        //IDS = url.parseQueryParams(frame.location).IDS,
        var infoLoaded = function () {
                var contentWindow = frame.contentWindow,
                    doc = contentWindow.document,
                    location = contentWindow.location,
                    url = location.origin + location.pathname,
                    page = nainwak.pages.byUrl(url);

                log('Navigation to ' + url);
                if (page) {
                    page.process(doc);
                }
            },
            isEnabled = false,
            enable = function (value) {
                var oldEnabled = isEnabled;

                // update the status (and convert to boolean, just in case)
                isEnabled = !!value;

                if (oldEnabled === isEnabled) {  // nothing to do
                    return;
                }

                // register or unregister the load event handler
                if (isEnabled) {
                    frame.addEventListener('load', infoLoaded, false);
                } else {
                    frame.removeEventListener('load', infoLoaded, false);
                }
            };

        // start enabled
        enable(true);

        return Object.freeze({
            get enabled() {
                return isEnabled;
            },
            set enabled(value) {
                enable(value);
            }
        });
    }

    return Spy;
});
