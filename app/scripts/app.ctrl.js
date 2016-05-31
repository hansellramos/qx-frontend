'use strict';

/**
 * @ngdoc function
 * @name app.controller:AppCtrl
 * @description
 * # MainCtrl
 * Controller of the app
 */
angular.module('app')
    .controller('AppCtrl', ['$scope', '$translate', '$state', '$localStorage', '$window', '$document', '$location', '$rootScope', '$timeout', '$mdSidenav', '$mdColorPalette', '$anchorScroll', 'APPLICATION', 'LoginService',
        function ($scope, $translate, $state, $localStorage, $window, $document, $location, $rootScope, $timeout, $mdSidenav, $mdColorPalette, $anchorScroll, APPLICATION, LoginService) {
            // add 'ie' classes to html
            var isIE = !!navigator.userAgent.match(/MSIE/i) || !!navigator.userAgent.match(/Trident.*rv:11\./);
            isIE && angular.element($window.document.body).addClass('ie');
            isSmartDevice($window) && angular.element($window.document.body).addClass('smart');
            // config
            $scope.app = {
                name: 'Qualitrix',
                version: '1.0.3',
                // for chart colors
                color: {
                    primary: '#3f51b5',
                    info: '#2196f3',
                    success: '#4caf50',
                    warning: '#ffc107',
                    danger: '#f44336',
                    accent: '#7e57c2',
                    white: '#ffffff',
                    light: '#f1f2f3',
                    dark: '#475069'
                },
                setting: {
                    theme: {
                        primary: 'indigo',
                        accent: 'purple',
                        warn: 'amber'
                    },
                    asideFolded: false
                },
                search: {
                    content: '',
                    show: false
                },
                auth: getCurrentUser()
            }

            $scope.signout = function () {
                LoginService.logout({
                    token: localStorage.getItem(APPLICATION.CONFIG.AUTH.TOKEN_KEY)
                }, function (response) {
                    localStorage.removeItem(APPLICdATION.CONFIG.AUTH.TOKEN_KEY);
                    localStorage.removeItem(APPLICATION.CONFIG.AUTH.TOKEN_DATA);
                    localStorage.removeItem(APPLICATION.CONFIG.AUTH.USER_DATA);
                    $state.go('access.signin');
                }, function (errorResponse) {
                    alert('Error');
                });
            }

            function getCurrentUser() {
                var user = localStorage.getItem(APPLICATION.CONFIG.AUTH.USER_DATA);
                if (user) {
                    user = JSON.parse(user);
                    return {
                        name: (user.firstname + ' ' + user.lastname).trim(),
                        email: ''
                    };
                } else {
                    return 'N/N';
                }
            }

            $scope.setTheme = function (theme) {
                $scope.app.setting.theme = theme;
            }

            // save settings to local storage
            if (angular.isDefined($localStorage.appSetting)) {
                $scope.app.setting = $localStorage.appSetting;
            } else {
                $localStorage.appSetting = $scope.app.setting;
            }
            $scope.$watch('app.setting', function () {
                $localStorage.appSetting = $scope.app.setting;
            }, true);

            // angular translate
            $scope.langs = {en: 'English', zh_CN: '中文'};
            $scope.selectLang = $scope.langs[$translate.proposedLanguage()] || "English";
            $scope.setLang = function (langKey) {
                // set the current lang
                $scope.selectLang = $scope.langs[langKey];
                // You can change the language during runtime
                $translate.use(langKey);
            };

            function isSmartDevice($window) {
                // Adapted from http://www.detectmobilebrowsers.com
                var ua = $window['navigator']['userAgent'] || $window['navigator']['vendor'] || $window['opera'];
                // Checks for iOs, Android, Blackberry, Opera Mini, and Windows mobile devices
                return (/iPhone|iPod|iPad|Silk|Android|BlackBerry|Opera Mini|IEMobile/).test(ua);
            };

            $scope.getColor = function (color, hue) {
                if (color == "bg-dark" || color == "bg-white") return $scope.app.color[color.substr(3, color.length)];
                return rgb2hex($mdColorPalette[color][hue]['value']);
            }

            //Function to convert hex format to a rgb color
            function rgb2hex(rgb) {
                return "#" + hex(rgb[0]) + hex(rgb[1]) + hex(rgb[2]);
            }

            function hex(x) {
                var hexDigits = new Array("0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f");
                return isNaN(x) ? "00" : hexDigits[(x - x % 16) / 16] + hexDigits[x % 16];
            }

            $rootScope.$on('$stateChangeSuccess', openPage);

            function openPage() {
                $scope.app.search.content = '';
                $scope.app.search.show = false;
                $scope.closeAside();
                // goto top
                $location.hash('view');
                $anchorScroll();
                $location.hash('');
                setTimeout(function () {
                    verifyActiveSession();
                }, 100);
            }

            $scope.goBack = function () {
                $window.history.back();
            }

            $scope.openAside = function () {
                $timeout(function () {
                    $mdSidenav('aside').open();
                });
            }
            $scope.closeAside = function () {
                $timeout(function () {
                    $document.find('#aside').length && $mdSidenav('aside').close();
                });
            }

            function verifyActiveSession() {
                if (!($state.current.name = '' || $state.is('access.signin') || $state.is('forgot-password'))) {
                    var session = localStorage.getItem(APPLICATION.CONFIG.AUTH.TOKEN_DATA);
                    if (session == null) {
                        removeSessionData();
                        $state.go('access.signin',{message:APPLICATION.ENUM.MESSAGES.AUTH.NOT_AUTHENTICATED});
                    } else {
                        session = JSON.parse(session);
                        if (session.expires <= (new Date()).getTime()) {
                            debugger;
                            removeSessionData();
                            $state.go('access.signin',{message:APPLICATION.ENUM.MESSAGES.AUTH.SESSION_ENDED});
                        } else {
                            LoginService.info({token: localStorage.getItem(APPLICATION.CONFIG.AUTH.TOKEN_KEY)}
                                , function (response) {
                                    debugger;
                                    localStorage.setItem(APPLICATION.CONFIG.AUTH.TOKEN_DATA, JSON.stringify(response.data.token));
                                    localStorage.setItem(APPLICATION.CONFIG.AUTH.USER_DATA, JSON.stringify(response.data.token.user));
                                    $scope.app.auth = getCurrentUser();
                                }, function (errorResponse) {
                                    removeSessionData();
                                    $state.go('access.signin',{message:APPLICATION.ENUM.MESSAGES.AUTH.SESSION_ENDED});
                                });
                        }
                    }
                }
                setTimeout(function () {
                    verifyActiveSession();
                }, 10000);
            }

            function removeSessionData() {
                localStorage.removeItem(APPLICATION.CONFIG.AUTH.TOKEN_DATA);
                localStorage.removeItem(APPLICATION.CONFIG.AUTH.TOKEN_KEY);
                localStorage.removeItem(APPLICATION.CONFIG.AUTH.USER_DATA);
            }

        }
    ])
    .controller('AuthController', ['$scope', '$translate', '$stateParams', '$state', '$localStorage', '$window', '$document', '$location', '$rootScope', '$timeout', '$mdSidenav', '$mdColorPalette', '$anchorScroll', 'LoginService', 'APPLICATION',
        function ($scope, $translate, $stateParams, $state, $localStorage, $window, $document, $location, $rootScope, $timeout, $mdSidenav, $mdColorPalette, $anchorScroll, LoginService, APPLICATION) {
            $scope.data = {error: false, errorMessage: '', username: 'hansell.ramos', password: 'komodo'};
            if ($stateParams.message) {
                $scope.data.error = true;
                $scope.data.errorMessage = $stateParams.message;
                $stateParams.message = '';
            }

            $scope.login = function () {
                $scope.requesting = 'Validando...';
                LoginService.login({
                    token: 'login',
                    username: $scope.data.username,
                    password: $scope.data.password,
                    _device: APPLICATION.CONFIG.DEVICE_KEY
                }, function (response) {
                    debugger;
                    $scope.requesting = 'Identificando...';
                    localStorage.setItem(APPLICATION.CONFIG.AUTH.TOKEN_KEY, response.data.token);
                    LoginService.info({token: localStorage.getItem(APPLICATION.CONFIG.AUTH.TOKEN_KEY)}
                        , function (response) {
                            debugger;
                            localStorage.setItem(APPLICATION.CONFIG.AUTH.TOKEN_DATA, JSON.stringify(response.data.token));
                            localStorage.setItem(APPLICATION.CONFIG.AUTH.USER_DATA, JSON.stringify(response.data.token.user));
                            $state.go('app.dashboard');
                        }, errorNotResponse);
                }, errorNotResponse);
            }

            $scope.background = Math.floor(Math.random() * 9);
            $scope.requesting = '';

            function errorNotResponse(errorResponse) {
                $scope.requesting = '';
                debugger;
                $scope.data.error = true;
                $scope.data.errorMessage = errorResponse.status != 0 ? errorResponse.data.message : APPLICATION.ENUM.MESSAGES.AUTH.NO_CONNECTION;
            }

        }])
    .controller('SubsidiaryCtrl', ['$scope', '$translate', '$state', '$localStorage', '$window', '$document', '$location', '$rootScope', '$timeout', '$mdSidenav', '$mdColorPalette', '$anchorScroll', 'SubsidiaryService', 'APPLICATION',
        function ($scope, $translate, $state, $localStorage, $window, $document, $location, $rootScope, $timeout, $mdSidenav, $mdColorPalette, $anchorScroll, SubsidiaryService, APPLICATION) {
            $scope.items = [];
            $scope.predicates = ['name', 'reference', 'active'];

            $scope.remove = function (row) {

            };

            $scope.update = function (row) {

            };

            $scope.show = function (row) {

            }

            $scope.add = function () {

            }

            $scope.get = function () {
                SubsidiaryService.get({token: localStorage.getItem(APPLICATION.CONFIG.AUTH.TOKEN_KEY)}
                    , function (response) {
                        debugger;
                    }
                    , function (errorResponse) {
                        debugger;
                    })
            }

            $scope.selectedPredicate = $scope.predicates[0];

            $scope.rowCollection = [];

            $scope.itemsByPage = 10;
        }])
;