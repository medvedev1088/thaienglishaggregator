function Optional(value) {
    this.value = value;
    this.hasValue = !!value;
}

Optional.prototype.forEach = function(func) {
    if (this.hasValue && this.value.length) {
        for (var i = 0; i < this.value.length; i++) {
            func(new Optional(this.value[i]));
        }
    }
};

Optional.prototype.get = function(index) {
    return this.hasValue && this.value.length && this.value.length > index
        ? new Optional(this.value[index])
        : new Optional(null);
};

Optional.prototype.orElse = function(value) {
    return this.hasValue ? this.value : value;
};

function htmlDecode(input){
    var e = document.createElement('div');
    e.innerHTML = input;
    return e.childNodes.length === 0 ? "" : e.childNodes[0].nodeValue;
}

var controllerFunction = function ($scope, $stateParams, $http, $window, $ionicPopup, Thai2englishUrl, GoogleCompleteSearchUrl) {
    var $ = angular.element;
    $scope.input = {
        q: 'อาหารไทยมีชื่อเสียงทั่วโลก'
    };
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

    function convertGoogleToTranslation(data) {
        data = eval(data);
        var translation = {};

        translation.t = new Optional(data).get(0).get(0).get(0).orElse('');
        translation.tr = new Optional(data).get(0).get(1).get(3).orElse('');

        translation.sp = new Optional(data).get(1).get(0).get(0).orElse('');

        var dictionary = [];
        new Optional(data).get(1).get(0).get(2).forEach(function(dictEntry) {
            var meaning = dictEntry.get(0).orElse('');
            var synonyms = dictEntry.get(1).orElse('');
            dictionary.push({
                meaning: meaning,
                synonyms: synonyms
            })
        });
        translation.dictionary = dictionary;

        return translation;
    }

    function convertThai2EnglishToTranslation(data) {
        data = JSON.parse(data);
        console.log(data);

        var translation = {};

        var Query = $(data.Query);
        var transcription = $.makeArray(Query.find('li.listTlitLine > span')).map(function(e) {return e.innerText}).join(' ');
        translation.tr = transcription;

        var Sentences = data.Sentences;
        var Sentence = Sentences[0];
        var WordObjects = Sentence.WordObjects;
        var words = [];
        for (var i = 0; i < WordObjects.length; i++) {
            var WordObject = WordObjects[i];
            words.push({
                text: WordObject.Word,
                tr: WordObject.Transliteration,
                meaning: WordObject.Meanings[0].Meaning
            })
        }

        translation.words = words;

        return translation;
    }

    function copyProperties(source, dest) {
        for (var prop in source) {
            if (source.hasOwnProperty(prop)) {
                dest[prop] = source[prop];
            }
        }
    }

    $scope.updateHtml = function () {
        // $ionicPopup.alert({
        //     title: ionic.Platform.platforms.join(),
        //     template: 'test'
        // });

        var q = $scope.input.q;

        console.log('search query', q);

        function getGoogleParams(q) {
            return {
                method: 'GET',
                url: 'https://translate.googleapis.com/translate_a/single?client=gtx',
                params: {
                    sl: 'th',
                    tl: 'en',
                    dt: [
                        't', // translation
                        'at', // alternate translations
                        'rm', // transcription
                        'bd', // dictionary
                        'ex' // examples
                    ],
                    q: q
                },
                transformResponse: [function (data) {
                    return data;
                }]
            }
        }

        function getThai2EnglishParams(q) {
            return {
                method: 'POST',
                url:  Thai2englishUrl + '/ajax/AddNewQueryDoSpacing.aspx',
                params: {
                    unspacedText: q,
                    queryDivId: 'queryText'
                },
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                transformResponse: [function (data) {
                    return data;
                }]
            }
        }

        var httpParams = {};
        if ($stateParams.tab === 'google') {
            httpParams = getGoogleParams(q);
        } else if ($stateParams.tab === 'thai2english') {
            httpParams = getThai2EnglishParams(q);
        }

        $http(httpParams).then(function successCallback(response) {
            console.log(response);
            var responseData = response.data;

            var translation;
            if ($stateParams.tab === 'google') {
                translation = convertGoogleToTranslation(responseData);
            } else if ($stateParams.tab === 'thai2english') {
                try {
                    translation = convertThai2EnglishToTranslation(responseData);
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
            if (!firstTimeFailed) {
                callApi(true);
            } else {
                $ionicPopup.alert({
                    title: 'Error!',
                    template: response.data
                });
            }
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
    }
};


angular.module('app.controllers', [])

    .controller('googleTranslateCtrl', ['$scope', '$stateParams', '$http', '$window', '$ionicPopup', 'Thai2englishUrl', 'Thai2englishUrl', controllerFunction])

    .controller('cartTabDefaultPageCtrl', ['$scope', '$stateParams', '$http', '$window', '$ionicPopup', 'Thai2englishUrl', 'Thai2englishUrl', controllerFunction])

    .controller('cloudTabDefaultPageCtrl', ['$scope', '$stateParams', // TIP: Access Route Parameters for your page via $stateParams.parameterName
        function ($scope, $stateParams) {


        }]);
