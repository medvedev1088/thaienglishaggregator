angular.module('app.services')
.service('SuggestionsService', ['$http', function($http){
    var service = {};

    service.getSuggestions = function (query, language) {
        var q = query;

        if (!q || (q.length && q.length == 0)) {
            return [];
        }

        var promise;
        console.log('Language', language);
        if (language == 'unknown') {
            var karaokePromise = $http({
                method: 'GET',
                url: 'https://inputtools.google.com/request',
                params: {
                    text: q,
                    itc: 'th-t-i0-und',
                    num: '13',
                    cp: '0',
                    cs: '1',
                    ie: 'utf-8',
                    oe: 'utf-8',
                    app: 'translate'
                },
                transformResponse: [function (data) {
                    return JSON.parse(data);
                }]
            }).then(function successCallback(response) {
                var data = response.data;
                console.log(data);
                return new Optional(data).get(1).get(0).get(1).orElse([]);
            }, function errorCallback(response) {
                console.log('error');
            });

            var suggestionsPromise = $http({
                method: 'GET',
                url: 'https://clients1.google.com/complete/search?client=translate_separate_corpus&ds=translate&hl=en&requiredfields=tl%3Ath',
                params: {
                    q: q
                },
                transformResponse: [function (data) {
                    var data = data.replace('window.google.ac.h(', '');
                    data = data.substring(0, data.length - 1);
                    return JSON.parse(data);
                }]
            }).then(function successCallback(response) {
                var data = response.data;
                console.log(data);
                var arr = new Optional(data).get(1).orElse([]).map(function(e) {return e[0]});
                // arr = arr.map(function(e) {return e.replace('<b>', '').replace('</b>', '')});
                arr = arr.map(function(e) {return htmlDecode(e)});
                return arr;
            }, function errorCallback(response) {
                console.log('error');
            });

            return Promise.all([karaokePromise, suggestionsPromise]).then(function (resultArray) {

                var suggestionsResult = resultArray[1];
                var karaokeResult = resultArray[0];
                if (suggestionsResult && suggestionsResult.length > 0) {
                    return [suggestionsResult[0]].concat(karaokeResult);
                } else {
                    return karaokeResult;
                }
            })
        } else if (language == 'english' || language == 'thai') {
            promise = $http({
                method: 'GET',
                url: 'http://suggestqueries.google.com/complete/search',
                params: {
                    client: 'firefox',
                    q: q
                },
                transformResponse: [function (data) {
                    return JSON.parse(data);
                }]
            }).then(function successCallback(response) {
                var data = response.data;
                return new Optional(data).get(1).orElse([]);
            }, function errorCallback(response) {
                console.log('error');
            });
        }

        return promise;
    };

    return service;
}]);
