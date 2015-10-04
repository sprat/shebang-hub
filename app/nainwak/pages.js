/* Collection of pages */
define(['array'], function (array) {
    function Pages(pages) {
        function byUrl(url) {
            return array.find(pages, function (page) {
                return page.url === url;
            });
        }

        function byName(name) {
            return array.find(pages, function (page) {
                return page.name === name;
            });
        }

        return Object.freeze({
            byName: byName,
            byUrl: byUrl
        });
    }

    return Pages;
});