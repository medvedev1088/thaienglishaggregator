var controllerFunction = function ($scope, $stateParams, $http, $window, $ionicPopup, Thai2englishUrl) {
    var $ = window.jQuery;
    console.log($stateParams);
    $scope.input = {
        q: 'อาหารไทยมีชื่อเสียงทั่วโลก'
    };
    $scope.translation = {
        t: '456',
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
        if (data.length > 0) {
            var translationWithTranscription = data[0];
            if (translationWithTranscription.length > 0) {
                var tArray = translationWithTranscription[0];
                if (tArray.length > 0) {
                    translation.t = tArray[0];
                }
            }
            if (translationWithTranscription.length > 1) {
                var trArray = translationWithTranscription[1];
                if (trArray.length > 3) {
                    translation.tr = trArray[3];
                }
            }
        }
        if (data.length > 1 && data[1] && data[1].length > 0) {
            var dictionaryArray = data[1][0];
            var sentencePart = dictionaryArray[0];
            translation.sp = sentencePart;

            var dictionary = [];
            var dictionaryMapArray = dictionaryArray[2];
            for (var i = 0; i < dictionaryMapArray.length; i++) {
                var dictEntry = dictionaryMapArray[i];
                var meaning = dictEntry[0];
                var synonyms = dictEntry[1];
                dictionary.push({
                    meaning: meaning,
                    synonyms: synonyms
                })
            }
            translation.dictionary = dictionary;
        }
        return translation;
    }

    function convertThai2EnglishToTranslation(data) {
        data = JSON.parse(data);
        console.log(data);
        //var Query = $(data.Query);
        //var transcription = $.makeArray(Query.find('li.listTlitLine > span')).map(function(e) {return e.innerText}).join(' ');
        //console.log('Transcription', transcription);
        // translation.tr = transcription;


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
        var translation = {};
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
                translation = convertThai2EnglishToTranslation(responseData);
            }

            $scope.translation = {
                t: '123'
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
};


angular.module('app.controllers', [])

    .controller('googleTranslateCtrl', ['$scope', '$stateParams', '$http', '$window', '$ionicPopup', 'Thai2englishUrl', controllerFunction])

    .controller('cartTabDefaultPageCtrl', ['$scope', '$stateParams', '$http', '$window', '$ionicPopup', 'Thai2englishUrl', controllerFunction])

    .controller('cloudTabDefaultPageCtrl', ['$scope', '$stateParams', // TIP: Access Route Parameters for your page via $stateParams.parameterName
        function ($scope, $stateParams) {


        }]);
