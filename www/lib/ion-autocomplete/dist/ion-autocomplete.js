/*
 * ion-autocomplete 0.3.2
 * Copyright 2016 Danny Povolotski
 * Copyright modifications 2016 Guy Brand
 * https://github.com/guylabs/ion-autocomplete
 */
(function() {

'use strict';

angular.module('ion-autocomplete', []).directive('ionAutocomplete', [
    '$ionicBackdrop', '$ionicScrollDelegate', '$document', '$q', '$parse', '$interpolate', '$ionicPlatform', '$compile', '$templateRequest', '$ionicGesture',
    function ($ionicBackdrop, $ionicScrollDelegate, $document, $q, $parse, $interpolate, $ionicPlatform, $compile, $templateRequest, $ionicGesture) {
        return {
            require: ['ngModel', 'ionAutocomplete'],
            restrict: 'A',
            scope: {},
            bindToController: {
                ngModel: '=',
                templateData: '=',
                itemsMethod: '&',
                itemsClickedMethod: '&',
                itemsRemovedMethod: '&',
                modelToItemMethod: '&',
                cancelButtonClickedMethod: '&',
                placeholder: '@',
                cancelLabel: '@'
            },
            controllerAs: 'viewModel',
            controller: ['$attrs', '$timeout', '$scope', function ($attrs, $timeout, $scope) {

                var valueOrDefault = function (value, defaultValue) {
                    return !value ? defaultValue : value;
                };

                var controller = this;

                // set the default values of the one way binded attributes
                $timeout(function () {
                    controller.placeholder = valueOrDefault(controller.placeholder, 'Click to enter a value...');
                    controller.cancelLabel = valueOrDefault(controller.cancelLabel, 'Done');
                });

                // set the default values of the passed in attributes
                this.itemsMethodValueKey = valueOrDefault($attrs.itemsMethodValueKey, undefined);
                this.itemValueKey = valueOrDefault($attrs.itemValueKey, undefined);
                this.itemViewValueKey = valueOrDefault($attrs.itemViewValueKey, undefined);
                this.componentId = valueOrDefault($attrs.componentId, undefined);
                this.loadingIcon = valueOrDefault($attrs.loadingIcon, undefined);
                this.manageExternally = valueOrDefault($attrs.manageExternally, "false");
                this.ngModelOptions = valueOrDefault($scope.$eval($attrs.ngModelOptions), {});

                // loading flag if the items-method is a function
                this.showLoadingIcon = false;

                // the items, selected items and the query for the list
                this.searchItems = [];
                this.searchQuery = undefined;
                this.searchSelection = {
                    start: 0,
                    end: 0
                };
                this.language = 'unknown';

                this.isArray = function (array) {
                    return angular.isArray(array);
                };
            }],
            link: function (scope, element, attrs, controllers) {

                // get the two needed controllers
                var ngModelController = controllers[0];
                var ionAutocompleteController = controllers[1];

                // use a random css class to bind the modal to the component
                ionAutocompleteController.randomCssClass = "ion-autocomplete-random-" + Math.floor((Math.random() * 1000) + 1);

                var template = [
                    '<div class="ion-autocomplete-container ' + ionAutocompleteController.randomCssClass + ' modal" style="display: none;">',
                    '<div class="bar bar-header item-input-inset">',
                    '<form ng-submit="viewModel.cancelClick();" style="width:100%;padding-top: 0; margin-top:0">',
                    '<label class="item-input-wrapper">',
                    '<i class="icon ion-search placeholder-icon"></i>',
                    '<input type="search" class="ion-autocomplete-search" ng-model="viewModel.searchQuery" ng-model-options="viewModel.ngModelOptions" placeholder="English or ภาษาไทย" autocomplete="off" autocorrect="off" autocapitalize="off"/>',
                    '</label>',
                    '</form>',
                    // '<button class="ion-autocomplete-cancel button button-clear" ng-click="viewModel.cancelClick();">{{viewModel.cancelLabel}}</button>',
                    '</div>',
                    '<ion-content class="has-header">',
                    '{{viewModel.getItemValue(selectedItem, viewModel.itemViewValueKey)}}',
                    '<ion-item ng-repeat="item in viewModel.searchItems" item-height="55px" item-width="100%" ng-click="viewModel.selectItem(item)" class="item-text-wrap">',
                    '{{viewModel.getItemValue(item, viewModel.itemViewValueKey)}}',
                    '</ion-item>',
                    '</ion-content>',
                    '</div>'
                ].join('');

                // load the template synchronously or asynchronously
                $q.when().then(function () {
                    return template;
                }).then(function (template) {

                    // compile the template
                    var searchInputElement = $compile(angular.element(template))(scope);

                    // append the template to body
                    $document.find('body').append(searchInputElement);


                    // returns the value of an item
                    ionAutocompleteController.getItemValue = function (item, key) {

                        // if it's an array, go through all items and add the values to a new array and return it
                        if (angular.isArray(item)) {
                            var items = [];
                            angular.forEach(item, function (itemValue) {
                                if (key && angular.isObject(item)) {
                                    items.push($parse(key)(itemValue));
                                } else {
                                    items.push(itemValue);
                                }
                            });
                            return items;
                        } else {
                            if (key && angular.isObject(item)) {
                                return $parse(key)(item);
                            }
                        }
                        return item;
                    };

                    var replaceSubstring = function(str, start, end, replacement) {
                        var prefix = str.substr(0, start);
                        var suffix = str.substr(end);
                        return prefix + replacement + suffix;
                    };

                    // function which selects the item, hides the search container and the ionic backdrop if it has not maximum selected items attribute set
                    ionAutocompleteController.selectItem = function (item) {

                        // clear the search query when an item is selected
                        var searchQuery = ionAutocompleteController.searchQuery;
                        var searchSelection = ionAutocompleteController.searchSelection;

                        var newSearchQuery = replaceSubstring(searchQuery, searchSelection.start, searchSelection.end, item);

                        ionAutocompleteController.searchQuery = newSearchQuery;
                        searchInputElement[0].value = newSearchQuery;
                        setTimeout(function () {
                            ionAutocompleteController.searchQuerySelection = updateSearchSelection(true);
                        }, 0);

                    };

                    function doGetCaretPosition (oField) {
                        var iCaretPos = 0;

                        if (oField.selectionStart || oField.selectionStart == '0') {
                            iCaretPos = oField.selectionStart;
                        }

                        return iCaretPos;
                    }

                    function isEnglish(str) {
                        if (/[a-z]/i.test(str) && str.indexOf(' ') >= 0) {
                            return true;
                        }
                        return false;
                    }

                    // selection
                    var updateSearchSelection = function(empty) {
                        var newCaretPosition = doGetCaretPosition(searchInputElement[0]);
                        var searchSelection = ionAutocompleteController.searchSelection;

                        var oldStart = searchSelection.start;
                        var oldEnd = searchSelection.end;

                        if (typeof(empty) === "boolean" && empty) {
                            searchSelection = {
                                start: newCaretPosition,
                                end: newCaretPosition
                            };
                        } else if (newCaretPosition <= oldStart) {
                            searchSelection = {
                                start: newCaretPosition,
                                end: newCaretPosition
                            };
                        } else if ((newCaretPosition - oldStart) > 20) {
                            searchSelection = {
                                start: newCaretPosition,
                                end: newCaretPosition
                            };
                        } else {
                            searchSelection = {
                                start: oldStart,
                                end: newCaretPosition
                            }
                        }

                        ionAutocompleteController.searchSelection = searchSelection;

                        var searchSelectionString = '';
                        do {
                            if (searchSelection.start == searchSelection.end) {
                                searchSelectionString = '';
                            } else {
                                searchSelectionString = ionAutocompleteController.searchQuery.substring(
                                    searchSelection.start, searchSelection.end
                                )
                            }
                            if (searchSelectionString.startsWith(' ')) {
                                searchSelection.start++;
                            }
                        } while(searchSelectionString.startsWith(' '));

                        console.log('Search selection string', searchSelectionString);

                        if (ionAutocompleteController.language == 'unknown' && isEnglish(searchSelectionString)) {
                            ionAutocompleteController.language = 'english';
                        } else if (searchSelection.start == 0 && searchSelection.end == 0) {
                            ionAutocompleteController.language = 'unknown';
                        }

                        ionAutocompleteController.fetchSearchQuery(searchSelectionString, false);
                    };
                    var searchInputElement = angular.element($document[0].querySelector('div.ion-autocomplete-container.' + ionAutocompleteController.randomCssClass + ' input'));
                    searchInputElement.bind('keyup touchend mouseup focus', updateSearchSelection);
                    $ionicGesture.on('swipeleft', function() {
                        ionAutocompleteController.searchQuery = '';
                        searchInputElement[0].value = '';
                        updateSearchSelection(true);
                    }, angular.element($document[0].querySelector('div.ion-autocomplete-container.' + ionAutocompleteController.randomCssClass + ' .bar-header')));

                    // update the search items based on the returned value of the items-method
                    ionAutocompleteController.fetchSearchQuery = function (query, isInitializing) {

                        // right away return if the query is undefined to not call the items method for nothing
                        if (query === undefined) {
                            return;
                        }

                        if (angular.isDefined(attrs.itemsMethod)) {

                            // show the loading icon
                            ionAutocompleteController.showLoadingIcon = true;

                            var queryObject = {query: query, language: ionAutocompleteController.language, isInitializing: isInitializing};

                            // if the component id is set, then add it to the query object
                            if (ionAutocompleteController.componentId) {
                                queryObject = {
                                    query: query,
                                    language: ionAutocompleteController.language,
                                    isInitializing: isInitializing,
                                    componentId: ionAutocompleteController.componentId
                                }
                            }

                            // convert the given function to a $q promise to support promises too
                            var promise = $q.when(ionAutocompleteController.itemsMethod(queryObject));

                            promise.then(function (promiseData) {

                                // if the promise data is not set do nothing
                                if (!promiseData) {
                                    return;
                                }

                                if (ionAutocompleteController.searchQuery === undefined || ionAutocompleteController.searchQuery === '') {
                                    ionAutocompleteController.searchItems = [];
                                } else {

                                    // if the given promise data object has a data property use this for the further processing as the
                                    // standard httpPromises from the $http functions store the response data in a data property
                                    if (promiseData && promiseData.data) {
                                        promiseData = promiseData.data;
                                    }

                                    // set the items which are returned by the items method
                                    ionAutocompleteController.searchItems = ionAutocompleteController.getItemValue(promiseData,
                                        ionAutocompleteController.itemsMethodValueKey);
                                }


                                // force the collection repeat to redraw itself as there were issues when the first items were added
                                $ionicScrollDelegate.resize();

                                // hide the loading icon
                                ionAutocompleteController.showLoadingIcon = false;
                            }, function (error) {
                                // reject the error because we do not handle the error here
                                return $q.reject(error);
                            });
                        }
                    };

                    var searchContainerDisplayed = false;

                    ionAutocompleteController.showModal = function () {
                        if (searchContainerDisplayed) {
                            return;
                        }

                        // show the backdrop and the search container
                        // $ionicBackdrop.retain();
                        angular.element($document[0].querySelector('div.ion-autocomplete-container.' + ionAutocompleteController.randomCssClass)).css('display', 'block');

                        // hide the container if the back button is pressed
                        scope.$deregisterBackButton = $ionicPlatform.registerBackButtonAction(function () {
                            ionAutocompleteController.hideModal();
                        }, 300);

                        // get the compiled search field
                        var searchInputElement = angular.element($document[0].querySelector('div.ion-autocomplete-container.' + ionAutocompleteController.randomCssClass + ' input'));

                        // focus on the search input field
                        if (searchInputElement.length > 0) {
                            if (ngModelController.$viewValue) {
                                ionAutocompleteController.searchQuery = ngModelController.$viewValue;
                                searchInputElement[0].value = ionAutocompleteController.searchQuery;
                            }
                            searchInputElement[0].focus();
                            updateSearchSelection(true);
                            setTimeout(function () {
                                searchInputElement[0].focus();
                                updateSearchSelection(true);
                                searchInputElement.on('blur', function() {
                                    searchInputElement[0].focus();
                                });
                            }, 0);
                        }

                        // force the collection repeat to redraw itself as there were issues when the first items were added
                        $ionicScrollDelegate.resize();

                        searchContainerDisplayed = true;
                    };

                    ionAutocompleteController.hideModal = function () {
                        angular.element($document[0].querySelector('div.ion-autocomplete-container.' + ionAutocompleteController.randomCssClass)).css('display', 'none');
                        ionAutocompleteController.searchQuery = undefined;
                        // $ionicBackdrop.release();
                        scope.$deregisterBackButton && scope.$deregisterBackButton();
                        searchContainerDisplayed = false;
                    };

                    // object to store if the user moved the finger to prevent opening the modal
                    var scrolling = {
                        moved: false,
                        startX: 0,
                        startY: 0
                    };

                    // store the start coordinates of the touch start event
                    var onTouchStart = function (e) {
                        scrolling.moved = false;
                        // Use originalEvent when available, fix compatibility with jQuery
                        if (typeof(e.originalEvent) !== 'undefined') {
                            e = e.originalEvent;
                        }
                        scrolling.startX = e.touches[0].clientX;
                        scrolling.startY = e.touches[0].clientY;
                    };

                    // check if the finger moves more than 10px and set the moved flag to true
                    var onTouchMove = function (e) {
                        // Use originalEvent when available, fix compatibility with jQuery
                        if (typeof(e.originalEvent) !== 'undefined') {
                            e = e.originalEvent;
                        }
                        if (Math.abs(e.touches[0].clientX - scrolling.startX) > 10 ||
                            Math.abs(e.touches[0].clientY - scrolling.startY) > 10) {
                            scrolling.moved = true;
                        }
                    };

                    // click handler on the input field to show the search container
                    var onClick = function (event) {
                        // only open the dialog if was not touched at the beginning of a legitimate scroll event
                        if (scrolling.moved) {
                            return;
                        }

                        // prevent the default event and the propagation
                        event.preventDefault();
                        event.stopPropagation();

                        // call the fetch search query method once to be able to initialize it when the modal is shown
                        // use an empty string to signal that there is no change in the search query
                        ionAutocompleteController.fetchSearchQuery("", true);

                        // show the ionic backdrop and the search container
                        ionAutocompleteController.showModal();
                    };

                    // if the click is not handled externally, bind the handlers to the click and touch events of the input field
                    if (ionAutocompleteController.manageExternally == "false") {
                        element.bind('touchstart', onTouchStart);
                        element.bind('touchmove', onTouchMove);
                        element.bind('touchend click focus', onClick);
                    }

                    // cancel handler for the cancel button which clears the search input field model and hides the
                    // search container and the ionic backdrop and calls the cancel button clicked callback
                    ionAutocompleteController.cancelClick = function () {
                        if (typeof cordova !== 'undefined') {
                            cordova.plugins.Keyboard.close();
                        }
                        ngModelController.$setViewValue(ionAutocompleteController.searchQuery);
                        ngModelController.$render();
                        ionAutocompleteController.hideModal();

                        // call cancel button clicked callback
                        if (angular.isDefined(attrs.cancelButtonClickedMethod)) {
                            ionAutocompleteController.cancelButtonClickedMethod({
                                callback: {
                                    selectedItems: 'test',
                                    componentId: ionAutocompleteController.componentId
                                }
                            });
                        }
                    };

                    // remove the component from the dom when scope is getting destroyed
                    scope.$on('$destroy', function () {

                        // angular takes care of cleaning all $watch's and listeners, but we still need to remove the modal
                        searchInputElement.remove();
                    });

                    // render the view value of the model
                    ngModelController.$render = function () {
                        element.val(ionAutocompleteController.getItemValue(ngModelController.$viewValue, ionAutocompleteController.itemViewValueKey));
                    };

                    // set the view value of the model
                    ngModelController.$formatters.push(function (modelValue) {
                        var viewValue = ionAutocompleteController.getItemValue(modelValue, ionAutocompleteController.itemViewValueKey);
                        return viewValue == undefined ? "" : viewValue;
                    });

                    // set the model value of the model
                    ngModelController.$parsers.push(function (viewValue) {
                        return ionAutocompleteController.getItemValue(viewValue, ionAutocompleteController.itemValueKey);
                    });

                });

            }
        };
    }
]);

})();
