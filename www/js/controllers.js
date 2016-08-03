angular.module('app.controllers', [])

    .controller('googleTranslateCtrl', ['$scope', '$stateParams', '$http', '$window',
        function ($scope, $stateParams, $http, $window) {
            $scope.updateHtml = function() {
                $http({
                    method: 'GET',
                    url: 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=th&tl=en&dt=t&q=ใจ',
                    transformResponse: [function (data) {
                        return data;
                    }]
                }).then(function successCallback(response) {

                    var json = eval(response.data);
                    console.log(response.data);
                    $scope.html = json[0][0][0];


                }, function errorCallback(response) {
                    console.log('error');
                    $scope.html = JSON.stringify(response);

                });


            }

        }])

    .controller('cartTabDefaultPageCtrl', ['$scope', '$stateParams', // TIP: Access Route Parameters for your page via $stateParams.parameterName
        function ($scope, $stateParams) {


        }])

    .controller('cloudTabDefaultPageCtrl', ['$scope', '$stateParams', // TIP: Access Route Parameters for your page via $stateParams.parameterName
        function ($scope, $stateParams) {


        }]);
