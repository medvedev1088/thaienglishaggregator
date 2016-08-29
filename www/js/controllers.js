var controllerFunction = function ($rootScope, $scope, $stateParams, $http, $window, $ionicPopup, ThaiToEnglishUrl,
                                   GoogleTranslateService, ThaiToEnglishService) {
    var $ = angular.element;

    if ($stateParams.tab === 'google') {
        $scope.title = 'Google Translate';
    } else if ($stateParams.tab === 'thaiToEnglish') {
        $scope.title = 'thai2english';
    }

    if (!$rootScope.input) {
        $rootScope.input = {
            q: ''
        };
        if (devEnvironment) {
            $rootScope.input.q = 'อาหารไทยมีชื่อเสียงทั่วโลก';
        }
    }
    $scope.translation = {
        t: '',
        tr: '',
        dictionary: [],
        sp: '',
        words: []
    };

    $scope.fullLink = {
        link: ''
    };

    function copyProperties(source, dest) {
        for (var prop in source) {
            if (source.hasOwnProperty(prop)) {
                dest[prop] = source[prop];
            }
        }
    }

    $scope.updateHtml = function () {
        var q = $scope.input.q;

        console.log('search query', q);

        var httpParams = {};
        if ($stateParams.tab === 'google') {
            httpParams = GoogleTranslateService.getRequestParams(q);
        } else if ($stateParams.tab === 'thaiToEnglish') {
            httpParams = ThaiToEnglishService.getRequestParams(q);
        }

        $http(httpParams).then(function successCallback(response) {
            console.log(response);
            var responseData = response.data;

            var translation;
            if ($stateParams.tab === 'google') {
                translation = GoogleTranslateService.convertResponseToTranslation(responseData);
            } else if ($stateParams.tab === 'thaiToEnglish') {
                try {
                    translation = ThaiToEnglishService.convertResponseToTranslation(responseData);
                } catch (err) {
                $ionicPopup.alert({
                    title: err,
                    template: 'test'
                });
                }
            }

            $scope.translation = {
                t: ''
            };

            copyProperties(translation, $scope.translation);

        }, function errorCallback(response) {
            console.log(response);
            $ionicPopup.alert({
                title: 'Error!',
                template: response.data
            });
        });
    };

    $scope.search = function (callback) {
        $scope.updateHtml();
    };

    $scope.callbackMethod = function (query, language) {
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
                $scope.html = JSON.stringify(response);
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
                $scope.html = JSON.stringify(response);
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
                $scope.html = JSON.stringify(response);
            });
        }

        return promise;
    };
    $scope.$on('$ionicView.enter', function() {
        $scope.updateHtml();
    })
    $scope.ionicGestureCallback = function () {

    }
};


var ctrlParams = [
    '$rootScope', '$scope', '$stateParams', '$http', '$window', '$ionicPopup',
    'ThaiToEnglishUrl', 'GoogleTranslateService', 'ThaiToEnglishService', controllerFunction
];
angular.module('app.controllers', [])
    .controller('googleTranslateCtrl', ctrlParams)
    .controller('thaiToEnglishCtrl', ctrlParams)

    .controller('cloudTabDefaultPageCtrl', ['$scope', '$stateParams', // TIP: Access Route Parameters for your page via $stateParams.parameterName
        function ($scope, $stateParams) {


        }]);
