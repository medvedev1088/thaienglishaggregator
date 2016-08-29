angular.module('app.routes', [])

    .config(function ($stateProvider, $urlRouterProvider) {

        // Ionic uses AngularUI Router which uses the concept of states
        // Learn more here: https://github.com/angular-ui/ui-router
        // Set up the various states which the app can be in.
        // Each state's controller can be found in controllers.js
        $stateProvider


            .state('tabsController.googleTranslateTab', {
                url: '/googleTranslate?tab',
                views: {
                    'googleTranslateTab': {
                        templateUrl: 'templates/tabContent.html',
                        controller: 'googleTranslateCtrl'
                    }
                }
            })

            .state('tabsController.thaiToEnglishTab', {
                url: '/thaiToEnglish?tab',
                views: {
                    'thaiToEnglishTab': {
                        templateUrl: 'templates/tabContent.html',
                        controller: 'thaiToEnglishCtrl'
                    }
                }
            })

            .state('tabsController.thaiLanguageComTab', {
                url: '/thaiLanguageCom?tab',
                views: {
                    'thaiLanguageComTab': {
                        templateUrl: 'templates/tabContent.html',
                        controller: 'thaiLanguageComCtrl'
                    }
                }
            })

            .state('tabsController', {
                url: '/tabsController',
                templateUrl: 'templates/tabsController.html',
                abstract: true
            });

        $urlRouterProvider.otherwise('/tabsController/thaiLanguageCom?tab=thaiLanguageCom')


    });
