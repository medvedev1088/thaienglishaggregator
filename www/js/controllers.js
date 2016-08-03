angular.module('app.controllers', [])

    .controller('googleTranslateCtrl', ['$scope', '$stateParams', // TIP: Access Route Parameters for your page via $stateParams.parameterName
        function ($scope, $stateParams) {
            $scope.updateHtml = function() {
                $http({
                    method: 'GET',
                    url: '/someUrl'
                }).then(function successCallback(response) {
                    // this callback will be called asynchronously
                    // when the response is available
                }, function errorCallback(response) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                });

                $scope.html = '<a>link</a>';
            }

        }])

    .controller('cartTabDefaultPageCtrl', ['$scope', '$stateParams', // TIP: Access Route Parameters for your page via $stateParams.parameterName
        function ($scope, $stateParams) {


        }])

    .controller('cloudTabDefaultPageCtrl', ['$scope', '$stateParams', // TIP: Access Route Parameters for your page via $stateParams.parameterName
        function ($scope, $stateParams) {


        }])
