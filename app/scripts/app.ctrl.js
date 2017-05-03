'use strict';

/**
 * @ngdoc function
 * @name app.controller:AppCtrl
 * @description
 * # MainCtrl
 * Controller of the app
 */
angular.module('app')
    .controller('AppCtrl', ['$scope', '$translate', '$state', '$localStorage', '$window', '$document', '$location', '$rootScope', '$timeout', '$mdSidenav', '$mdColorPalette', '$anchorScroll', 'APPLICATION', 'LoginService', 'ngDialog', 'Permissions',
        function ($scope, $translate, $state, $localStorage, $window, $document, $location, $rootScope, $timeout, $mdSidenav, $mdColorPalette, $anchorScroll, APPLICATION, LoginService, ngDialog, Permissions) {
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
            $scope._p = Permissions;
            $scope._pn = APPLICATION.ENUM.PERMISSIONS;

            $scope.signout = function () {
                ga('send','event','log out',JSON.parse(localStorage.USER_DATA).profile[0].name);
                LoginService.logout({
                    token: localStorage.getItem(APPLICATION.CONFIG.AUTH.TOKEN_KEY)
                }, function (response) {
                    removeSessionData();
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
                console.log($state.is('print'));
                if (!($state.current.name = ''
                        || $state.is('access.signin')
                        || $state.is('forgot-password')
                        || $state.is('validateCertificate')
                        || $state.is('print'))) {
                    var session = localStorage.getItem(APPLICATION.CONFIG.AUTH.TOKEN_DATA);
                    if (session == null) {
                        removeSessionData();
                        $state.go('access.signin', {message: APPLICATION.ENUM.MESSAGES.AUTH.NOT_AUTHENTICATED});
                    } else {
                        session = JSON.parse(session);
                        if (session.expires <= (new Date()).getTime()) {
                            removeSessionData();
                            $state.go('access.signin', {message: APPLICATION.ENUM.MESSAGES.AUTH.SESSION_ENDED});
                        } else {
                            LoginService.info({token: localStorage.getItem(APPLICATION.CONFIG.AUTH.TOKEN_KEY)}
                                , function (response) {
                                    localStorage.setItem(APPLICATION.CONFIG.AUTH.TOKEN_DATA, JSON.stringify(response.data.token));
                                    localStorage.setItem(APPLICATION.CONFIG.AUTH.USER_DATA, JSON.stringify(response.data.token.user));
                                    Permissions.setPermissions(response.data.token.user.profile[0].permissions);
                                    Permissions.setIsAdmin(response.data.token.user.isAdmin);
                                    $scope.app.auth = getCurrentUser();
                                }, function (errorResponse) {
                                    removeSessionData();
                                    ngDialog.closeAll();
                                    $state.go('access.signin', {message: APPLICATION.ENUM.MESSAGES.AUTH.SESSION_ENDED});
                                });
                        }
                    }
                }
                setTimeout(function () {
                    verifyActiveSession();
                }, 30000);
            }

            function removeSessionData() {
                localStorage.removeItem(APPLICATION.CONFIG.AUTH.TOKEN_DATA);
                localStorage.removeItem(APPLICATION.CONFIG.AUTH.TOKEN_KEY);
                localStorage.removeItem(APPLICATION.CONFIG.AUTH.USER_DATA);
                Permissions.clear();
            }

        }
    ])
    .controller('AboutController', ['$scope', '$translate', '$stateParams', '$state', '$localStorage', '$window', '$document', '$location', '$rootScope', '$timeout', '$mdSidenav', '$mdColorPalette', '$anchorScroll', 'APPLICATION', '$sce', '$http',
        function ($scope, $translate, $stateParams, $state, $localStorage, $window, $document, $location, $rootScope, $timeout, $mdSidenav, $mdColorPalette, $anchorScroll, APPLICATION, $sce, $http) {
            $scope.apiContentUri = '';

            $scope.init = function(){
                $scope.apiContentUri = $sce.trustAsResourceUrl(APPLICATION.CONFIG.API.URL);
                $http.get('../package.json')
                    .then(function(res){
                        $scope.package = res.data;
                    });
            };

            $scope.init();
        }])
    .controller('UserProfileController', ['$scope', '$translate', '$stateParams', '$state', '$localStorage', '$window', '$document', '$location', '$rootScope', '$timeout', '$mdSidenav', '$mdColorPalette', '$anchorScroll', 'APPLICATION', '$sce', 'LoginService', 'PasswordService', 'Flash', 'UserService', 'ProfileService', 'PermissionsService',
        function ($scope, $translate, $stateParams, $state, $localStorage, $window, $document, $location, $rootScope, $timeout, $mdSidenav, $mdColorPalette, $anchorScroll, APPLICATION, $sce, LoginService, PasswordService, Flash, UserService, ProfileService, PermissionsService) {

            $scope.user = {};
            $scope.passwordChange = {old:'', new:'', repeat:''};
            $scope.permissions = [];

            $scope.currentPage = 'general';

            $scope.init = function(){
                LoginService.info({token: localStorage.getItem(APPLICATION.CONFIG.AUTH.TOKEN_KEY)}
                    , function (response) {
                        $scope.user = response.data.token.user;
                    }, function (errorResponse) {

                });
                PermissionsService.query({token: localStorage.getItem(APPLICATION.CONFIG.AUTH.TOKEN_KEY)}
                    , function (response) {
                        $scope.permissions = response;
                    }, function (errorResponse) {

                });
            };

            $scope.showPage = function(page){
                $scope.currentPage = page;
                $scope.init();
            };

            $scope.hasPermission = function(value){

            };

            $scope._updatePassword = function(){
                PasswordService.update({token: localStorage.getItem(APPLICATION.CONFIG.AUTH.TOKEN_KEY)}, $scope.passwordChange
                    , function(response){
                        console.log(response);
                        Flash.create('success',response.message);
                        $scope.passwordChange = {old:'', new:'', repeat:''};
                    }, function(errorResponse){
                        Flash.create('danger',errorResponse.data.message);
                        if(errorResponse.status == 406){ //validations error
                            if(errorResponse.data.data.fields.reference){
                                $scope._form.error.reference = errorResponse.data.data.fields.reference;
                            }
                        }
                    });
            };

            $scope.init();
        }])
    .controller('AuthController', ['$scope', '$translate', '$stateParams', '$state', '$localStorage', '$window', '$document', '$location', '$rootScope', '$timeout', '$mdSidenav', '$mdColorPalette', '$anchorScroll', 'LoginService', 'APPLICATION',
        function ($scope, $translate, $stateParams, $state, $localStorage, $window, $document, $location, $rootScope, $timeout, $mdSidenav, $mdColorPalette, $anchorScroll, LoginService, APPLICATION) {
            $scope.data = {error: false, errorMessage: ''
                , username: '', password: ''
            };
            if ($stateParams.message) {
                $scope.data.error = true;
                $scope.data.errorMessage = $stateParams.message;
                $stateParams.message = '';
            }
            ga('send','event','login form','');
            $scope.login = function () {
                $scope.requesting = 'Validando...';
                LoginService.login({
                    token: 'login',
                    username: $scope.data.username,
                    password: $scope.data.password,
                    _device: APPLICATION.CONFIG.DEVICE_KEY
                }, function (response) {
                    $scope.requesting = 'Identificando...';
                    localStorage.setItem(APPLICATION.CONFIG.AUTH.TOKEN_KEY, response.data.token);
                    LoginService.info({token: localStorage.getItem(APPLICATION.CONFIG.AUTH.TOKEN_KEY)}
                        , function (response) {
                            localStorage.setItem(APPLICATION.CONFIG.AUTH.TOKEN_DATA, JSON.stringify(response.data.token));
                            localStorage.setItem(APPLICATION.CONFIG.AUTH.USER_DATA, JSON.stringify(response.data.token.user));
                            ga('send','event','log in',JSON.parse(localStorage.USER_DATA).profile[0].name);
                            $state.go('app.dashboard');
                        }, errorNotResponse);
                }, errorNotResponse);
            }

            $scope.background = Math.floor(Math.random() * 9);
            $scope.requesting = '';

            function errorNotResponse(errorResponse) {
                $scope.requesting = '';
                $scope.data.error = true;
                $scope.data.errorMessage = errorResponse.status != 0 ? errorResponse.data.message : APPLICATION.ENUM.MESSAGES.AUTH.NO_CONNECTION;
            }

        }])
    .controller('SubsidiaryCtrl', ['$scope', '$translate', '$state', '$localStorage', '$window', '$document', '$location', '$rootScope', '$timeout', '$mdSidenav', '$mdColorPalette', '$anchorScroll', 'ngDialog', 'Flash', 'SubsidiaryService', 'APPLICATION',
        function ($scope, $translate, $state, $localStorage, $window, $document, $location, $rootScope, $timeout, $mdSidenav, $mdColorPalette, $anchorScroll, ngDialog, Flash, SubsidiaryService, APPLICATION) {

            $scope.items = [];
            $scope._item = null;
            $scope.sortKey = 'name';
            $scope.reverse = false;
            $scope.pageSize = 10;
            $scope.sort = function (keyname) {
                if (keyname == $scope.sortKey) {
                    if (!$scope.reverse) {
                        $scope.reverse = !$scope.reverse;
                    } else {
                        $scope.sortKey = 'id';
                        $scope.reverse = false;
                    }
                } else {
                    $scope.sortKey = keyname;
                    $scope.reverse = false;
                }
            }

            $scope.get = function () {
                SubsidiaryService.query({token: localStorage.getItem(APPLICATION.CONFIG.AUTH.TOKEN_KEY)}
                    , function (response) {
                        var items = [];
                        for (var i = 0; i < response.length; i++) {
                            items.push({
                                id: response[i]._id,
                                name: response[i].name,
                                reference: response[i].reference,
                                //leader: response[i].leader,
                                leader: response[i].leader[0].firstname+' '+response[i].leader[0].lastname,
                                active: response[i].active
                            });
                        }
                        $scope.items = items;
                    }
                    , function (errorResponse) {
                        console.log(errorResponse);
                    });
            };

            $scope.add = function(){
                $state.go('app.subsidiaryAdd');
            };

            $scope.showDetail = function(item){
                $scope.item = item;
                $scope.itemLoading = true;
                SubsidiaryService.get({token: localStorage.getItem(APPLICATION.CONFIG.AUTH.TOKEN_KEY), id:(item._id?item._id:item.id)}
                    , function(response){
                        $scope.item = response;
                        $scope.itemLoading = false;
                    }
                    , function(errorResponse){
                        $scope.errorMesagge = "Error consultando elemento";
                        $scope.itemLoading = false;
                    });
                ngDialog.open({
                    template: 'detail',
                    scope: $scope,
                    //width: window.innerWidth < 800 ? window.innerWidth-24 : window.innerWidth-384
                });
            }

            $scope.delete = function(item){
                $scope._item = item;
                ngDialog.open({
                    template: 'delete',
                    scope: $scope,
                    //width: window.innerWidth < 800 ? window.innerWidth-24 : window.innerWidth-384
                });
            }

            $scope.edit = function(item){
                $state.go('app.subsidiaryEdit', {'_id':(item._id?item._id:(item._id?item._id:item.id))});
                ngDialog.close({
                    template: 'detail'
                });
            }

            $scope._cancelDelete = function(){
                $scope._item = null;
                ngDialog.closeAll();
            }

            $scope._doDelete = function(item){
                SubsidiaryService.delete({token: localStorage.getItem(APPLICATION.CONFIG.AUTH.TOKEN_KEY), id: (item._id?item._id:item.id)}
                    , function (response) {
                        Flash.create('success',response.message);
                        $scope._cancelDelete();
                        $scope.get();
                    }
                    , function (errorResponse) {
                        console.log(errorResponse);
                        Flash.create('danger',errorResponse.data.data.fields.reference);
                    });
            }

            $scope.get();

        }])
    .controller('SubsidiaryAddCtrl', ['$scope', '$translate', '$state', '$localStorage', '$window', '$document', '$location', '$rootScope', '$timeout', '$mdSidenav', '$mdColorPalette', '$anchorScroll', 'ngDialog', 'Flash', 'UserService', 'SubsidiaryService', 'APPLICATION',
        function ($scope, $translate, $state, $localStorage, $window, $document, $location, $rootScope, $timeout, $mdSidenav, $mdColorPalette, $anchorScroll, ngDialog, Flash, UserService, SubsidiaryService, APPLICATION) {
            $scope.subsidiary = {name:"", reference:"", leader:undefined, active:true};
            $scope.requesting = false;
            $scope.users = [];
            UserService.query({token: localStorage.getItem(APPLICATION.CONFIG.AUTH.TOKEN_KEY)}
                , function (response) {$scope.users = response;$scope.requesting = false;
                }, function (errorResponse) {Flash.create('danger',errorResponse);$scope.requesting = false;
                });
            ga('send','event','subsidiary add',JSON.parse(localStorage.USER_DATA).profile[0].name);

            //Obligatory fields
            $scope._form = {
                error : {
                    reference: false
                }
            };

            $scope._submit = $scope._create = function(){
                SubsidiaryService.save({token: localStorage.getItem(APPLICATION.CONFIG.AUTH.TOKEN_KEY)}, $scope.subsidiary
                , function(response){
                    Flash.create('success',response.message);
                    $scope.subsidiary = {name:"", reference:"", leader:undefined, active:true};
                    $scope.form.$setPristine();
                }, function(errorResponse){
                    Flash.create('danger',errorResponse.data.message);
                    if(errorResponse.status == 406){ //validations error
                        if(errorResponse.data.data.fields.reference){
                            $scope._form.error.reference = errorResponse.data.data.fields.reference;
                        }
                    }
                });
            }

            $scope._goBack = function(){
                $state.go('app.subsidiary');
            }
        }])
    .controller('SubsidiaryEditCtrl', ['$scope', '$translate', '$state', '$localStorage', '$window', '$document', '$location', '$rootScope', '$timeout', '$mdSidenav', '$mdColorPalette', '$anchorScroll', 'ngDialog', 'Flash', 'UserService', 'SubsidiaryService', 'APPLICATION',
        function ($scope, $translate, $state, $localStorage, $window, $document, $location, $rootScope, $timeout, $mdSidenav, $mdColorPalette, $anchorScroll, ngDialog, Flash, UserService, SubsidiaryService, APPLICATION) {
            $scope.original = undefined;
            $scope.users = [];
            $scope.subsidiary = {};
            $scope._form = {
                error : {
                    reference: false,
                }
            };
            ga('send','event','subsidiary edit',JSON.parse(localStorage.USER_DATA).profile[0].name);
            $scope._submit = $scope._edit = function(){
                SubsidiaryService.update({token: localStorage.getItem(APPLICATION.CONFIG.AUTH.TOKEN_KEY), id:$state.params._id}, $scope._getChanges()
                    , function(response){
                        Flash.create('success',response.message);
                        $scope._init();
                    }, function(errorResponse){
                        Flash.create('danger',errorResponse.data.message);
                        if(errorResponse.status == 406){ //validations error
                            if(errorResponse.data.data.fields.reference){
                                $scope._form.error.reference = errorResponse.data.data.fields.reference;
                            }
                        }
                    });
            }

            $scope._validate = function(){
                if(JSON.stringify($scope.original) == JSON.stringify($scope.subsidiary)){
                    return false;
                }else if(Object.keys($scope._getChanges()).length===0){
                    return false;
                }
                return true;
            }

            $scope._goBack = function(){
                $state.go('app.subsidiary');
            }

            $scope.__construct = function(){
                $scope.original = undefined;
                $scope.users = [];
                $scope.subsidiary = {};
                //$scope.form.$setPristine();
            }

            $scope._getChanges = function(){
                var changes = {};
                if($scope.original.name!==$scope.subsidiary.name){
                    changes.name = $scope.subsidiary.name;
                }
                if($scope.original.reference!==$scope.subsidiary.reference){
                    changes.reference = $scope.subsidiary.reference;
                }
                if($scope.original.leader!==$scope.subsidiary.leader){
                    changes.leader = $scope.subsidiary.leader;
                }
                if($scope.original.active!==$scope.subsidiary.active){
                    changes.active = $scope.subsidiary.active;
                }
                return changes;
            }

            $scope._init = function(){
                $scope.__construct();
                SubsidiaryService.get({token: localStorage.getItem(APPLICATION.CONFIG.AUTH.TOKEN_KEY), id:$state.params._id}
                    , function (response) {
                        $scope.subsidiary = response;
                        $scope.subsidiary.leader = $scope.subsidiary.leader[0].id;
                        $scope.original = JSON.parse(JSON.stringify($scope.subsidiary));
                        $scope.requesting = false;
                    }, function (errorResponse) {Flash.create('danger',errorResponse);$scope.requesting = false;
                });
                UserService.query({token: localStorage.getItem(APPLICATION.CONFIG.AUTH.TOKEN_KEY)}
                    , function (response) {$scope.users = response;$scope.requesting = false;
                    }, function (errorResponse) {Flash.create('danger',errorResponse);$scope.requesting = false;
                });
            }

            $scope._init();

        }])
    .controller('StoreCtrl', ['$scope', '$translate', '$state', '$localStorage', '$window', '$document', '$location', '$rootScope', '$timeout', '$mdSidenav', '$mdColorPalette', '$anchorScroll', 'ngDialog', 'Flash', 'StoreService', 'APPLICATION',
        function ($scope, $translate, $state, $localStorage, $window, $document, $location, $rootScope, $timeout, $mdSidenav, $mdColorPalette, $anchorScroll, ngDialog, Flash, StoreService, APPLICATION) {

            $scope.items = [];
            $scope._item = null;
            $scope.sortKey = 'name';
            $scope.reverse = false;
            $scope.pageSize = 10;
            $scope.sort = function (keyname) {
                if (keyname == $scope.sortKey) {
                    if (!$scope.reverse) {
                        $scope.reverse = !$scope.reverse;
                    } else {
                        $scope.sortKey = 'id';
                        $scope.reverse = false;
                    }
                } else {
                    $scope.sortKey = keyname;
                    $scope.reverse = false;
                }
            }

            ga('send','event','store list',JSON.parse(localStorage.USER_DATA).profile[0].name);

            $scope.add = function(){
                $state.go('app.storeAdd');
            }

            $scope.showDetail = function(item){
                $scope.item = item;
                $scope.itemLoading = true;
                StoreService.get({token: localStorage.getItem(APPLICATION.CONFIG.AUTH.TOKEN_KEY), id:(item._id?item._id:item.id)}
                    , function(response){
                        $scope.item = response;
                        $scope.itemLoading = false;
                    }
                    , function(errorResponse){
                        $scope.errorMesagge = "Error consultando elemento";
                        $scope.itemLoading = false;
                    });
                ngDialog.open({
                    template: 'detail',
                    scope: $scope,
                    //width: window.innerWidth < 800 ? window.innerWidth-24 : window.innerWidth-384
                });
            }

            $scope.get = function () {
                StoreService.query({token: localStorage.getItem(APPLICATION.CONFIG.AUTH.TOKEN_KEY)}
                    , function (response) {
                        var items = [];
                        for (var i = 0; i < response.length; i++) {
                            items.push({
                                id: response[i]._id,
                                name: response[i].name,
                                reference: response[i].reference,
                                subsidiary: response[i].subsidiary[0].name,
                                active: response[i].active
                            });
                        }
                        $scope.items = items;
                    }
                    , function (errorResponse) {
                        console.log(errorResponse);
                    });
            };

            $scope.delete = function(item){
                $scope._item = item;
                ngDialog.open({
                    template: 'delete',
                    scope: $scope,
                    //width: window.innerWidth < 800 ? window.innerWidth-24 : window.innerWidth-384
                });
            }

            $scope.edit = function(item){
                $state.go('app.storeEdit', {'_id':(item._id?item._id:item.id)});
                ngDialog.closeAll();
            }

            $scope._cancelDelete = function(){
                $scope._item = null;
                ngDialog.closeAll();
            }

            $scope._doDelete = function(item){
                StoreService.delete({token: localStorage.getItem(APPLICATION.CONFIG.AUTH.TOKEN_KEY), id: (item._id?item._id:item.id)}
                    , function (response) {
                        Flash.create('success',response.message);
                        $scope._cancelDelete();
                        $scope.get();
                    }
                    , function (errorResponse) {
                        console.log(errorResponse);
                        Flash.create('danger',errorResponse.data.data.fields.reference);
                    });
            }

            $scope.get();

        }])
    .controller('StoreAddCtrl', ['$scope', '$translate', '$state', '$localStorage', '$window', '$document', '$location', '$rootScope', '$timeout', '$mdSidenav', '$mdColorPalette', '$anchorScroll', 'ngDialog', 'Flash', 'StoreService', 'SubsidiaryService', 'APPLICATION',
        function ($scope, $translate, $state, $localStorage, $window, $document, $location, $rootScope, $timeout, $mdSidenav, $mdColorPalette, $anchorScroll, ngDialog, Flash, StoreService, SubsidiaryService, APPLICATION) {
            $scope.store = {name:"", reference:"", subsidiary:null, address:"", phone:"", notes:"", active:true};
            $scope.subsidiaries = [];
            $scope.requesting = true;
            ga('send','event','store add',JSON.parse(localStorage.USER_DATA).profile[0].name);
            SubsidiaryService.query({token: localStorage.getItem(APPLICATION.CONFIG.AUTH.TOKEN_KEY)}
                , function (response) {
                    $scope.subsidiaries = response;
                    $scope.requesting = false;
                }
                , function (errorResponse) {
                    Flash.create('danger',errorResponse);
                    $scope.requesting = false;
                });

            $scope._form = {
                error : {
                    reference: false,
                    subsidiary: false,
                },
                success: {
                    general: false
                }
            };

            $scope._submit = $scope._create = function(){
                StoreService.save({token: localStorage.getItem(APPLICATION.CONFIG.AUTH.TOKEN_KEY)}, $scope.store
                    , function(response){
                        Flash.create('success',response.message);
                        $scope.store = {name:"", reference:"", subsidiary:null, address:"", phone:"", notes:"", active:true};
                        $scope.form.$setPristine();
                    }, function(errorResponse){
                        Flash.create('danger',errorResponse.data.message);
                        if(errorResponse.status == 406){ //validations error
                            if(errorResponse.data.data.fields.reference){
                                $scope._form.error.reference = errorResponse.data.data.fields.reference;
                            }
                        }
                    });
            }

            $scope._goBack = function(){
                $state.go('app.store');
            }
        }])
    .controller('StoreEditCtrl', ['$scope', '$translate', '$state', '$localStorage', '$window', '$document', '$location', '$rootScope', '$timeout', '$mdSidenav', '$mdColorPalette', '$anchorScroll', 'ngDialog', 'Flash', 'StoreService', 'SubsidiaryService', 'APPLICATION',
        function ($scope, $translate, $state, $localStorage, $window, $document, $location, $rootScope, $timeout, $mdSidenav, $mdColorPalette, $anchorScroll, ngDialog, Flash, StoreService, SubsidiaryService, APPLICATION) {
            $scope.original = undefined;
            $scope.subsidiaries = [];
            $scope.store = {};
            $scope._form = {
                error : {
                    reference: false,
                }
            };
            ga('send','event','store edit',JSON.parse(localStorage.USER_DATA).profile[0].name);
            $scope._submit = $scope._edit = function(){
                StoreService.update({token: localStorage.getItem(APPLICATION.CONFIG.AUTH.TOKEN_KEY), id:$state.params._id}, $scope._getChanges()
                    , function(response){
                        Flash.create('success',response.message);
                        $scope._init();
                    }, function(errorResponse){
                        Flash.create('danger',errorResponse.data.message);
                        if(errorResponse.status == 406){ //validations error
                            if(errorResponse.data.data.fields.reference){
                                $scope._form.error.reference = errorResponse.data.data.fields.reference;
                            }
                        }
                    });
            }

            $scope._validate = function(){
                if(JSON.stringify($scope.original) == JSON.stringify($scope.store)){
                    return false;
                }else if(Object.keys($scope._getChanges()).length===0){
                    return false;
                }
                return true;
            }

            $scope._goBack = function(){
                $state.go('app.store');
            }

            $scope.__construct = function(){
                $scope.original = undefined;
                $scope.subsidiaries = [];
                $scope.store = {};
                //$scope.form.$setPristine();
            }

            $scope._getChanges = function(){
                var changes = {};
                if($scope.original.name!==$scope.store.name){
                    changes.name = $scope.store.name;
                }
                if($scope.original.reference!==$scope.store.reference){
                    changes.reference = $scope.store.reference;
                }
                if($scope.original.subsidiary!==$scope.store.subsidiary){
                    changes.subsidiary = $scope.store.subsidiary;
                }
                if($scope.original.address!==$scope.store.address){
                    changes.address = $scope.store.address;
                }
                if($scope.original.phone!==$scope.store.phone){
                    changes.phone = $scope.store.phone;
                }
                if($scope.store.notes && $scope.store.notes!=='<p></p>' && $scope.original.notes!==$scope.store.notes){
                    changes.notes = $scope.store.notes;
                }
                if($scope.original.active!==$scope.store.active){
                    changes.active = $scope.store.active;
                }
                return changes;
            }

            $scope._init = function(){
                $scope.__construct();
                StoreService.get({token: localStorage.getItem(APPLICATION.CONFIG.AUTH.TOKEN_KEY), id:$state.params._id}
                    , function (response) {
                        $scope.store = response;
                        $scope.store.subsidiary = $scope.store.subsidiary[0].id;
                        $scope.original = JSON.parse(JSON.stringify($scope.store));
                        $scope.requesting = false;
                    }, function (errorResponse) {Flash.create('danger',errorResponse);$scope.requesting = false;
                    });
                SubsidiaryService.query({token: localStorage.getItem(APPLICATION.CONFIG.AUTH.TOKEN_KEY)}
                    , function (response) {$scope.subsidiaries = response;$scope.requesting = false;
                    }, function (errorResponse) {Flash.create('danger',errorResponse);$scope.requesting = false;
                    });
            }

            $scope._init();

        }])
    .controller('ProductCtrl', ['$scope', '$translate', '$state', '$localStorage', '$window', '$document', '$location', '$rootScope', '$timeout', '$mdSidenav', '$mdColorPalette', '$anchorScroll', 'ngDialog', 'Flash', 'ProductService', 'DueListFactory', 'APPLICATION',
        function ($scope, $translate, $state, $localStorage, $window, $document, $location, $rootScope, $timeout, $mdSidenav, $mdColorPalette, $anchorScroll, ngDialog, Flash, ProductService, DueListFactory, APPLICATION) {

            $scope.items = [];
            $scope._item = null;
            $scope.sortKey = 'name';
            $scope.reverse = false;
            $scope.pageSize = 10;
            $scope.dueList = [];
            $scope.sort = function (keyname) {
                if (keyname == $scope.sortKey) {
                    if (!$scope.reverse) {
                        $scope.reverse = !$scope.reverse;
                    } else {
                        $scope.sortKey = 'id';
                        $scope.reverse = false;
                    }
                } else {
                    $scope.sortKey = keyname;
                    $scope.reverse = false;
                }
            }
            ga('send','event','product list',JSON.parse(localStorage.USER_DATA).profile[0].name);

            $scope.add = function(){
                $state.go('app.productAdd');
            }

            $scope.showDetail = function(item){

                $scope.item = item;
                $scope.itemLoading = true;
                ProductService.get({token: localStorage.getItem(APPLICATION.CONFIG.AUTH.TOKEN_KEY), id:(item._id?item._id:item.id)}
                    , function(response){
                        $scope.item = response;
                        $scope.item.due_date = DueListFactory.one($scope.item.due_date);
                        $scope.itemLoading = false;
                    }
                    , function(errorResponse){
                        $scope.errorMesagge = "Error consultando elemento";
                        $scope.itemLoading = false;
                    });
                ngDialog.open({
                    template: 'detail',
                    scope: $scope,
                    //width: window.innerWidth < 800 ? window.innerWidth-24 : window.innerWidth-384
                });
            }

            $scope.get = function () {
                ProductService.query({token: localStorage.getItem(APPLICATION.CONFIG.AUTH.TOKEN_KEY)}
                    , function (response) {
                        var items = [];
                        for (var i = 0; i < response.length; i++) {
                            items.push({
                                id: response[i]._id,
                                name: response[i].name,
                                reference: response[i].reference,
                                store: response[i].store[0].name+' ('+response[i].store[0].reference+')',
                                active: response[i].active
                            });
                        }
                        $scope.items = items;
                    }
                    , function (errorResponse) {
                        console.log(errorResponse);
                    });
            };

            $scope.delete = function(item){
                $scope._item = item;
                ngDialog.open({
                    template: 'delete',
                    scope: $scope,
                    //width: window.innerWidth < 800 ? window.innerWidth-24 : window.innerWidth-384
                });
            }

            $scope.edit = function(item){
                $state.go('app.productEdit', {'_id':item.id});
            }

            $scope._cancelDelete = function(){
                $scope._item = null;
                ngDialog.closeAll();
            }

            $scope._doDelete = function(item){
                ProductService.delete({token: localStorage.getItem(APPLICATION.CONFIG.AUTH.TOKEN_KEY), id:(item._id?item._id:item.id)}
                    , function (response) {
                        Flash.create('success',response.message);
                        $scope._cancelDelete();
                        $scope.get();
                    }
                    , function (errorResponse) {
                        console.log(errorResponse);
                        Flash.create('danger',errorResponse.data.data.fields.reference);
                    });
            }

            $scope.get();

        }])
    .controller('ProductAddCtrl', ['$scope', '$translate', '$state', '$localStorage', '$window', '$document', '$location', '$rootScope', '$timeout', '$mdSidenav', '$mdColorPalette', '$anchorScroll', 'ExternalService', 'SubsidiaryService', 'StoreService', 'DueListFactory', 'PropertyTypeFactory', 'ngDialog', 'Flash', 'ProductService', 'APPLICATION', '$sce','$interval', 'Permissions',
        function ($scope, $translate, $state, $localStorage, $window, $document, $location, $rootScope, $timeout, $mdSidenav, $mdColorPalette, $anchorScroll, ExternalService, SubsidiaryService, StoreService, DueListFactory, PropertyTypeFactory, ngDialog, Flash, ProductService, APPLICATION, $sce, $interval, Permissions) {
            $scope._p = Permissions;
            $scope.product = { store:undefined, name:'', reference:'', due_date:4, max_dose:'N/A', notes:'', certification_nsf:false
                , properties:[{name:'', validation:{type:APPLICATION.ENUM.PROPERTY.TYPE.TEXT}}], active:true
            };
            $scope.selecteds = {
                subsidiary: undefined
            };
            $scope.subsidiaries = [];
            $scope.stores = [];
            $scope._stores = [];
            $scope.dueList = DueListFactory.get();
            $scope.propertyTypeList = PropertyTypeFactory.get();
            $scope.propertyTypeEnum = APPLICATION.ENUM.PROPERTY.TYPE;
            $scope.loading = false;

            $scope._form = {
                error : {
                    reference: false,
                },
                success: {
                    general: false
                }
            };
            ga('send','event','product add',JSON.parse(localStorage.USER_DATA).profile[0].name);

            function initializeData(){
                $scope.subsidiaries = [];
                SubsidiaryService.query({token: localStorage.getItem(APPLICATION.CONFIG.AUTH.TOKEN_KEY)}
                    , function (response) {$scope.subsidiaries = response;$scope.requesting = false;
                    }, function (errorResponse) {Flash.create('danger',errorResponse);$scope.requesting = false;
                    });
                $scope._stores = [];
                StoreService.query({token: localStorage.getItem(APPLICATION.CONFIG.AUTH.TOKEN_KEY)}
                    , function (response) {$scope._stores = response;$scope.requesting = false;
                    }, function (errorResponse) {Flash.create('danger',errorResponse);$scope.requesting = false;
                    });
            }

            $scope._goBack = function(){
                $state.go('app.product');
            }

            $scope._submit = $scope._create = function(){
                ProductService.save({token: localStorage.getItem(APPLICATION.CONFIG.AUTH.TOKEN_KEY)}, $scope.product
                    , function(response){
                        Flash.create('success',response.message);
                        $scope._reset();
                    }, function(errorResponse){
                        Flash.create('danger',errorResponse.data.message);
                        if(errorResponse.status == 406){ //validations error
                            if(errorResponse.data.data.fields.reference){
                                $scope._form.error.reference = errorResponse.data.data.fields.reference;
                            }
                        }
                    });
            }

            $scope.validateProperties = function(){
                //if($scope.record.product==undefined) return false;
                for(var i in $scope.product.properties){
                    if($scope.product.properties[i].name == "" || $scope.product.properties[i].name == '<p></p>'){
                        return false;
                    }
                }
                return true;
            }

            $scope._reset = function(){
                $scope.product = { store:undefined, name:'', reference:'', due_date:4, max_dose:'', notes:'', certification_nsf:''
                    , properties:[{name:'', validation:{type:APPLICATION.ENUM.PROPERTY.TYPE.TEXT}}], active:true
                };
                $scope.form.$setPristine();
            }

            $scope.updateStores = function(){
                $scope.stores = [];
                for(var i in $scope._stores){
                    var _store = $scope._stores[i];
                    if(_store.subsidiary && _store.subsidiary.length>0 &&  _store.subsidiary[0].id==$scope.selecteds.subsidiary){
                        $scope.stores.push(_store);
                    }
                }
            };

            $scope.addProperty = function(){
                $scope.product.properties.push(
                    {
                        name:'',
                        validation:{
                            type:'text',
                            list:[]
                        },
                        active:true,
                        remission_editable:false
                    }
                );
            }

            $scope.removeProperty = function(index){
                if($scope.product.properties.length-1<index){
                    delete $scope.product.properties[index];
                }
            }

            $scope.updateProperty = function(index){
                if($scope.product.properties[index].validation.type==APPLICATION.ENUM.PROPERTY.TYPE.LIST){
                    $scope.product.properties[index].validation = {
                        type:APPLICATION.ENUM.PROPERTY.TYPE.LIST,
                        list:[{
                            label: '', valid: true
                        }]
                    };
                }else if($scope.product.properties[index].validation.type==APPLICATION.ENUM.PROPERTY.TYPE.RANGE){
                    $scope.product.properties[index].validation = {
                        type:APPLICATION.ENUM.PROPERTY.TYPE.RANGE,
                        max_value:1.00,
                        min_value:0.00
                    };
                }else if($scope.product.properties[index].validation.type==APPLICATION.ENUM.PROPERTY.TYPE.BOOLEAN){
                    $scope.product.properties[index].validation = {
                        type:APPLICATION.ENUM.PROPERTY.TYPE.BOOLEAN,
                        yes_value:'',
                        no_value:''
                    };
                }else if($scope.product.properties[index].validation.type==APPLICATION.ENUM.PROPERTY.TYPE.TEXT){
                    $scope.product.properties[index].validation = {
                        type:APPLICATION.ENUM.PROPERTY.TYPE.TEXT
                    };
                }
            }

            $scope.addPropertyListItem = function(index){
                $scope.product.properties[index].validation.list.push({
                    label: '', valid: true
                });
            }

            $scope.removePropertyListItem = function(parent, index){
                delete $scope.product.properties[parent].validation.list[index];
            }

            $scope.validateProperties = function(){
                for(var i in $scope.product.properties){
                    var _p = $scope.product.properties[i];
                    if(_p.name===''){
                        return false;
                    }
                    if(_p.type===APPLICATION.ENUM.PROPERTY.TYPE.TEXT){
                        //text validations
                    }else if(_p.type===APPLICATION.ENUM.PROPERTY.TYPE.LIST){
                        for(var j in _p.validation.list){
                            var _e = _p.validation.list[j];
                            if(_e.label===''){
                                return false;
                            }
                        }
                    }else if(_p.type===APPLICATION.ENUM.PROPERTY.TYPE.RANGE){
                        if(_p.validations.max_value!=='' && _p.validations.min_value!==''
                            && parseFloat(_p.validation.max_value)<=parseFloat(_p.validation.min_value)){
                            return false;
                        }
                        if(_p.validations.min_value!=='' && _p.validations.max_value!==''
                            && parseFloat(_p.validation.min_value)>=parseFloat(_p.validation.max_value)){
                            return false;
                        }
                    }else if(_p.type===APPLICATION.ENUM.PROPERTY.TYPE.BOOLEAN){
                        if(_p.validation.yes_value==='' || _p.validation.no_value===''){
                            return false;
                        }
                    }
                }
                return true;
            };

            $scope.hola = function(){
                debugger;
                $scope.form;
            }

            initializeData();
        }])
    .controller('ProductEditCtrl', ['$scope', '$translate', '$state', '$localStorage', '$window', '$document', '$location', '$rootScope', '$timeout', '$mdSidenav', '$mdColorPalette', '$anchorScroll', 'ExternalService', 'SubsidiaryService', 'StoreService', 'DueListFactory', 'PropertyTypeFactory', 'ngDialog', 'Common', 'Flash', 'ProductService', 'APPLICATION', '$sce','$interval','Permissions',
        function ($scope, $translate, $state, $localStorage, $window, $document, $location, $rootScope, $timeout, $mdSidenav, $mdColorPalette, $anchorScroll, ExternalService, SubsidiaryService, StoreService, DueListFactory, PropertyTypeFactory, ngDialog, Common, Flash, ProductService, APPLICATION, $sce, $interval, Permissions) {
            $scope._p = Permissions;
            $scope.original = undefined;
            $scope.product = {};
            $scope.selecteds = {
                subsidiary: undefined
            };
            $scope.subsidiaries = [];
            $scope.stores = [];
            $scope._stores = [];
            $scope.store = {};
            $scope.dueList = DueListFactory.get();
            $scope.propertyTypeList = PropertyTypeFactory.get();
            $scope.propertyTypeEnum = APPLICATION.ENUM.PROPERTY.TYPE;
            $scope.loading = false;

            $scope._form = {
                error : {
                    reference: false,
                }
            };
            ga('send','event','product edit',JSON.parse(localStorage.USER_DATA).profile[0].name);

            $scope._submit = $scope._edit = function(){
                // debugger;
                // console.log($scope._getChanges());
                // return;
                ProductService.update({token: localStorage.getItem(APPLICATION.CONFIG.AUTH.TOKEN_KEY), id:$state.params._id}, $scope._getChanges()
                    , function(response){
                        Flash.create('success',response.message);
                        $scope._init();
                    }, function(errorResponse){
                        Flash.create('danger',errorResponse.data.message);
                        if(errorResponse.status == 406){ //validations error
                            if(errorResponse.data.data.fields.reference){
                                $scope._form.error.reference = errorResponse.data.data.fields.reference;
                            }
                        }
                    });
            }

            $scope.validateProperties = function(){
                for(var i in $scope.product.properties){
                    if(!$scope.validateProperty(i)){
                        return false;
                    }
                }
                return true;
            };

            $scope.validateProperty = function(index){
                var property = $scope.product.properties[index];
                if(Common.stripHtmlTags(property.name).length === 0){
                    property.error = "La descripción de la propiedad no puede estar vacía";
                    return false;
                }else if(property.error && property.error === "La descripción de la propiedad no puede estar vacía"){
                    property.error = "";
                }
                if(property.validation.type === APPLICATION.ENUM.PROPERTY.TYPE.RANGE){
                    if(property.validation.min_value > property.validation.max_value){
                        property.error = "El valor mínimo de la propiedad debe ser menor a su contraparte";
                        return false;
                    }else if(property.error && property.error === "El valor mínimo de la propiedad debe ser menor a su contraparte"){
                        property.error = "";
                    }
                }else if(property.validation.type === APPLICATION.ENUM.PROPERTY.TYPE.BOOLEAN){
                    if(property.validation.yes_value.trim() === '' || property.validation.no_value.trim() === ''){
                        property.error = "Ninguno de los valores para la propiedad deben estar vacíos";
                        return false;
                    }else if(property.error && property.error === "Ninguno de los valores para la propiedad deben estar vacíos"){
                        property.error = "";
                    }
                }else if(property.validation.type === APPLICATION.ENUM.PROPERTY.TYPE.LIST){
                    var error = false;
                    for(var i in property.validation.list){
                        if(property.validation.list[i].deleted == false && property.validation.list[i].label.trim() === ''){
                            property.error = "Ninguno de los valores para la propiedad deben estar vacíos";
                            error = true;
                            break;
                        }
                    }
                    if(error){
                        return false;
                    }else if(property.error && property.error === "Ninguno de los valores para la propiedad deben estar vacíos"){
                        property.error = "";
                    }
                }
                return true;
            }

            $scope.updateStores = function(){
                $scope.stores = [];
                for(var i in $scope._stores){
                    var _store = $scope._stores[i];
                    if(_store.subsidiary && _store.subsidiary.length>0 &&  _store.subsidiary[0].id==$scope.selecteds.subsidiary){
                        $scope.stores.push(_store);
                    }
                }
            };

            $scope.updateProperty = function(index) {
                $scope.updatePropertyStatus(index);
                if($scope.product.properties[index].validation.type==APPLICATION.ENUM.PROPERTY.TYPE.LIST){
                    $scope.product.properties[index].validation = {
                        type:APPLICATION.ENUM.PROPERTY.TYPE.LIST,
                        list:[{
                            label: '', valid: true
                        }]
                    };
                }else if($scope.product.properties[index].validation.type==APPLICATION.ENUM.PROPERTY.TYPE.RANGE){
                    $scope.product.properties[index].validation = {
                        type:APPLICATION.ENUM.PROPERTY.TYPE.RANGE,
                        max_value:1.00,
                        min_value:0.00
                    };
                }else if($scope.product.properties[index].validation.type==APPLICATION.ENUM.PROPERTY.TYPE.BOOLEAN){
                    $scope.product.properties[index].validation = {
                        type:APPLICATION.ENUM.PROPERTY.TYPE.BOOLEAN,
                        yes_value:'Cumple',
                        no_value:'No Cumple'
                    };
                }else if($scope.product.properties[index].validation.type==APPLICATION.ENUM.PROPERTY.TYPE.TEXT){
                    $scope.product.properties[index].validation = {
                        type:APPLICATION.ENUM.PROPERTY.TYPE.TEXT
                    };
                }
            }

            $scope._validate = function(){
                if(JSON.stringify($scope.original) == JSON.stringify($scope.product)){
                    return false;
                }else if(Object.keys($scope._getChanges()).length===0){
                    return false;
                }
                return true;
            };

            $scope._goBack = function(){
                $state.go('app.product');
            };

            $scope.__construct = function(){
                $scope.original = undefined;
                $scope.external = {};
                $scope.subsidiaries = [];
                $scope.store = {};
                //$scope.form.$setPristine();
            }

            $scope.validateChanges = function(){
                return Object.keys($scope._getChanges()).length > 0;
            };

            $scope._getChanges = function(){
                var changes = {};
                if($scope.original) {
                    if ($scope.original.store !== $scope.product.store) {
                        changes.store = $scope.product.store;
                    }
                    if ($scope.original.name !== $scope.product.name) {
                        changes.name = $scope.product.name;
                    }
                    if ($scope.original.reference !== $scope.product.reference) {
                        changes.reference = $scope.product.reference;
                    }
                    if (Common.stripHtmlTags($scope.product.max_dose).length > 0 && $scope.original.max_dose !== $scope.product.max_dose) {
                        changes.max_dose = $scope.product.max_dose;
                    }
                    if ($scope.original.due_date !== $scope.product.due_date) {
                        changes.due_date = $scope.product.due_date;
                    }
                    if ($scope.original.certification_nsf !== $scope.product.certification_nsf) {
                        changes.certification_nsf = $scope.product.certification_nsf;
                    }
                    if ($scope.original.active !== $scope.product.active) {
                        changes.active = $scope.product.active;
                    }
                    for (var p in $scope.product.properties) {
                        if ($scope.product.properties[p].status != 'none') {
                            changes.properties = getPropertiesChanged();
                        }
                    }
                }
                return changes;
            };

            function getPropertiesChanged(){
                var properties = [];
                var changesInProperties = false;
                for(var i in $scope.product.properties){
                    if($scope.validateProperty(i)){
                        if($scope.product.properties[i].status != 'none'){
                            changesInProperties = true;
                        }
                        properties.push($scope.product.properties[i]);
                    }
                }
                return changesInProperties ? properties : [];
            }

            $scope.typeOf = function(val) {
                return typeof val;
            };

            $scope._init = function(){
                $scope.__construct();
                $scope.subsidiaries = [];
                SubsidiaryService.query({token: localStorage.getItem(APPLICATION.CONFIG.AUTH.TOKEN_KEY)}
                    , function (response) {$scope.subsidiaries = response;$scope.requesting = false;
                    }, function (errorResponse) {Flash.create('danger',errorResponse);$scope.requesting = false;
                    });
                $scope._stores = [];
                StoreService.query({token: localStorage.getItem(APPLICATION.CONFIG.AUTH.TOKEN_KEY)}
                    , function (response) {$scope._stores = response;$scope.requesting = false;
                    }, function (errorResponse) {Flash.create('danger',errorResponse);$scope.requesting = false;
                    });
                ProductService.get({token: localStorage.getItem(APPLICATION.CONFIG.AUTH.TOKEN_KEY), id:$state.params._id}
                    , function (response) {
                        if(CKEDITOR.instances["property[{{$index}}].name"]){
                            CKEDITOR.instances["property[{{$index}}].name"].destroy();
                        }
                        $scope.product = response;
                        $scope.product.due_date = $scope.product.due_date === 0 ? undefined : $scope.product.due_date;
                        $scope.selecteds.subsidiary = $scope.product.store[0].subsidiary;
                        $scope.updateStores();
                        $scope.product.store = $scope.product.store[0].id;
                        $scope.original = JSON.parse(JSON.stringify($scope.product));
                        $scope.requesting = false;
                        for(var property in $scope.product.properties){
                            $scope.product.properties[property].status = 'none';
                            if($scope.product.properties[property].active === null){
                                $scope.product.properties[property].active = true;
                                $scope.product.properties[property].status = 'updated';
                            }
                        }
                    }, function (errorResponse) {Flash.create('danger',errorResponse);$scope.requesting = false;
                    });
            };

            $scope.addProperty = function(){
                $scope.product.properties.push(
                    {
                        name:'',
                        validation:{
                            type:'text'
                        },
                        active:true,
                        remission_editable:false,
                        deleted:false,
                        status:'added'
                    }
                );
            };

            $scope.removeProperty = function(index){
                if($scope.product.properties.length-1<=index){
                    $scope.product.properties[index].deleted = true;
                    $scope.product.properties[index].status = 'removed';
                }
            };

            $scope.updatePropertyStatus = function(index){
                if($scope.product.properties[index].status == 'none'){
                    $scope.product.properties[index].status = 'updated';
                }
            };

            $scope.addPropertyListItem = function(index){
                $scope.product.properties[index].validation.list.push({
                    label: '', valid: true, deleted:false
                });
            };

            $scope.removePropertyListItem = function(parent, index){
                $scope.product.properties[parent].validation.list[index].deleted = true;
            };

            $scope.hola = function(){
                debugger;
                $scope._getChanges();
            }

            $scope._init();

        }])
    .controller('RecordCtrl', ['$scope', '$translate', '$state', '$localStorage', '$window', '$document', '$location', '$rootScope', '$timeout', '$mdSidenav', '$mdColorPalette', '$anchorScroll', 'ExternalService', 'SubsidiaryService', 'StoreService', 'ProductService', 'ngDialog', 'Flash', 'RecordService', 'APPLICATION', '$sce','$interval',
function ($scope, $translate, $state, $localStorage, $window, $document, $location, $rootScope, $timeout, $mdSidenav, $mdColorPalette, $anchorScroll, ExternalService, SubsidiaryService, StoreService, ProductService, ngDialog, Flash, RecordService, APPLICATION, $sce, $interval) {

            $scope.selecteds = {
                subsidiary: undefined
                , store: undefined
                , product: undefined
            };
            $scope.subsidiaries = [];
            $scope.stores = [];
            $scope._stores = [];
            $scope.products = [];
            $scope._products = [];
            $scope.loading = false;

            $scope.items = [];
            $scope._item = null;
            $scope.sortKey = 'id';
            $scope.reverse = true;
            $scope.pageSize = 10;
            $scope.sort = function (keyname) {
                if (keyname == $scope.sortKey) {
                    if (!$scope.reverse) {
                        $scope.reverse = !$scope.reverse;
                    } else {
                        $scope.sortKey = 'id';
                        $scope.reverse = false;
                    }
                } else {
                    $scope.sortKey = keyname;
                    $scope.reverse = false;
                }
            }
            ga('send','event','record list',JSON.parse(localStorage.USER_DATA).profile[0].name);

            $scope.add = function(){
                $state.go('app.recordAdd');
            }

            $scope.updateStores = function(){
                $scope.stores = [];
                for(var i in $scope._stores){
                    var _store = $scope._stores[i];
                    if(_store.subsidiary && _store.subsidiary.length>0 &&  _store.subsidiary[0].id==$scope.selecteds.subsidiary){
                        $scope.stores.push(_store);
                    }
                }
            };

            $scope.updateProducts = function(){
                $scope.products = [];
                for(var i in $scope._products){
                    var _product = $scope._products[i];
                    if(_product.store && _product.store.length>0 && _product.store[0]._id==$scope.selecteds.store){
                        $scope.products.push(_product);
                    }
                }
            };

            $scope.updateRecords = function(){
                $scope.product = undefined;
                for(var i in $scope._products){
                    if($scope._products[i].id ==$scope.selecteds.product){
                        $scope.product = $scope._products[i];
                    }
                }
            }

            $scope.get = function () {
                $scope.loading = true;
                RecordService.query({token: localStorage.getItem(APPLICATION.CONFIG.AUTH.TOKEN_KEY), product:$scope.selecteds.product._id}
                    , function (response) {
                        var items = [];
                        for (var i = 0; i < response.length; i++) {
                            items.push({
                                id: response[i]._id
                                , reference: response[i].reference
                                , analysis_date: response[i].analysis_date
                                , elaboration_date: response[i].elaboration_date
                                , due_date: response[i].due_date
                                , reception_date: response[i].reception_date
                                , properties: response[i].properties
                                , user: response[i].creator[0].firstname + ' '+response[i].creator[0].lastname
                                , veredict: response[i].veredict
                                , remission: response[i].remission
                                , quantity: response[i].quantity
                                , existing_quantity: response[i].existing_quantity
                                , supplier: response[i].supplier[0].name
                                , satisfies: response[i].satisfies
                                , notes: response[i].notes
                                , active: response[i].active
                                , clause: response[i].clause
                            });
                        }
                        $scope.items = items;
                        $scope.loading = false;
                    }
                    , function (errorResponse) {
                        console.log(errorResponse);
                        $scope.loading = false;
                    });
            };

            function initializeData(){
                $scope.subsidiaries = [];
                SubsidiaryService.query({token: localStorage.getItem(APPLICATION.CONFIG.AUTH.TOKEN_KEY)}
                    , function (response) {$scope.subsidiaries = response;$scope.requesting = false;
                    }, function (errorResponse) {Flash.create('danger',errorResponse);$scope.requesting = false;
                });
                $scope._stores = [];
                StoreService.query({token: localStorage.getItem(APPLICATION.CONFIG.AUTH.TOKEN_KEY)}
                    , function (response) {$scope._stores = response;$scope.requesting = false;
                    }, function (errorResponse) {Flash.create('danger',errorResponse);$scope.requesting = false;
                });
                $scope._products = [];
                ProductService.query({token: localStorage.getItem(APPLICATION.CONFIG.AUTH.TOKEN_KEY)}
                    , function (response) {$scope._products = response;$scope.requesting = false;
                    }, function (errorResponse) {Flash.create('danger',errorResponse);$scope.requesting = false;
                });
            }

            $scope.determinateValue = 30;
            $scope.determinateValue2 = 30;

            $interval(function() {
                $scope.determinateValue += 1;
                $scope.determinateValue2 += 1.5;
                if ($scope.determinateValue > 100) {
                    $scope.determinateValue = 30;
                    $scope.determinateValue2 = 30;
                }
            }, 100, 0, true);

            $scope.delete = function(item){
                $scope._item = item;
                ngDialog.open({
                    template: 'delete',
                    scope: $scope,
                    //width: window.innerWidth < 800 ? window.innerWidth-24 : window.innerWidth-384
                });
            }

            $scope.edit = function(item){
                $state.go('app.recordEdit', {'product':$scope.selecteds.product._id,'_id':item.id});
            }

            $scope._cancelDelete = function(){
                $scope._item = null;
                ngDialog.closeAll();
            }

            $scope._doDelete = function(item){
                RecordService.delete({token: localStorage.getItem(APPLICATION.CONFIG.AUTH.TOKEN_KEY), id: item.id}
                    , function (response) {
                        Flash.create('success',response.message);
                        $scope._cancelDelete();
                        $scope.get();
                    }
                    , function (errorResponse) {
                        console.log(errorResponse);
                        Flash.create('danger',errorResponse.data.data.fields.reference);
                    });
            }

            initializeData();

        }])
    .controller('RecordAddCtrl', ['$scope', '$translate', '$state', '$localStorage', '$window', '$document', '$location', '$rootScope', '$timeout', '$mdSidenav', '$mdColorPalette', '$anchorScroll', 'ExternalService', 'SubsidiaryService', 'StoreService', 'ProductService', 'ngDialog', 'Flash', 'RecordService', 'APPLICATION', '$sce','$interval',
        function ($scope, $translate, $state, $localStorage, $window, $document, $location, $rootScope, $timeout, $mdSidenav, $mdColorPalette, $anchorScroll, ExternalService, SubsidiaryService, StoreService, ProductService, ngDialog, Flash, RecordService, APPLICATION, $sce, $interval) {
            var _date = new Date();_date.setMilliseconds(0);_date.setSeconds(0);
            $scope.record = {reference:'', product:undefined, analysis_date:_date, elaboration_date:_date, due_date:undefined, reception_date:undefined,
                provider:undefined, remission:"", quantity:0, veredict:'', active:true, notes:'', properties:[]
            };
            $scope.selecteds = {
                subsidiary: undefined
                , store: undefined
                , product: undefined
            };
            $scope.subsidiaries = [];
            $scope.stores = [];
            $scope._stores = [];
            $scope.products = [];
            $scope.externals = [];
            $scope._products = [];
            $scope.loading = false;

            $scope._form = {};
            ga('send','event','record add',JSON.parse(localStorage.USER_DATA).profile[0].name);

            function initializeData(){
                $scope._form = {
                    error : {
                        reference: false,
                    },
                    success: {
                        general: false
                    }
                };
                $scope.subsidiaries = [];
                SubsidiaryService.query({token: localStorage.getItem(APPLICATION.CONFIG.AUTH.TOKEN_KEY)}
                    , function (response) {$scope.subsidiaries = response;$scope.requesting = false;
                    }, function (errorResponse) {Flash.create('danger',errorResponse);$scope.requesting = false;
                    });
                $scope._stores = [];
                StoreService.query({token: localStorage.getItem(APPLICATION.CONFIG.AUTH.TOKEN_KEY)}
                    , function (response) {$scope._stores = response;$scope.requesting = false;
                    }, function (errorResponse) {Flash.create('danger',errorResponse);$scope.requesting = false;
                    });
                $scope._products = [];
                ProductService.query({token: localStorage.getItem(APPLICATION.CONFIG.AUTH.TOKEN_KEY)}
                    , function (response) {$scope._products = response;$scope.requesting = false;
                    }, function (errorResponse) {Flash.create('danger',errorResponse);$scope.requesting = false;
                    });
                $scope.externals = [];
                ExternalService.query({token: localStorage.getItem(APPLICATION.CONFIG.AUTH.TOKEN_KEY)}
                    , function (response) {$scope.externals = response;$scope.requesting = false;
                    }, function (errorResponse) {Flash.create('danger',errorResponse);$scope.requesting = false;
                    });
            }

            $scope._goBack = function(){
                $state.go('app.record');
            }

            $scope._submit = $scope._create = function(){
                RecordService.save({token: localStorage.getItem(APPLICATION.CONFIG.AUTH.TOKEN_KEY)}, formatRecord()
                    , function(response){
                        Flash.create('success',response.message);
                        $scope._reset();
                    }, function(errorResponse){
                        Flash.create('danger',errorResponse.data.message);
                        if(errorResponse.status == 406){ //validations error
                            if(errorResponse.data.data.fields.reference){
                                $scope._form.error.reference = errorResponse.data.data.fields.reference;
                            }
                        }
                    });
            }

            $scope.validateProperties = function(){
                if($scope.record.product==undefined) return false;
                for(var i in $scope.record.properties){
                    if($scope.record.properties[i].value == ""){
                        return false;
                    }
                }
                return true;
            }

            function formatRecord(){
                var _record = {
                    reference:$scope.record.reference,
                    product:$scope.record.product,
                    analysis_date:$scope.record.analysis_date,
                    elaboration_date:$scope.record.elaboration_date,
                    due_date:$scope.record.due_date,
                    reception_date:$scope.record.reception_date,
                    supplier:$scope.record.provider,
                    remission:$scope.record.remission,
                    quantity:$scope.record.quantity,
                    existent_quantity:$scope.record.quantity,
                    veredict:$scope.record.veredict,
                    active:$scope.record.active,
                    satisfies:$scope.record.active,
                    notes:$scope.record.notes
                };
                var _properties = [];
                for(var i in $scope.record.properties){
                    var _p = $scope.record.properties[i];
                    _properties.push({
                        property:_p.id
                        , value: _p.value
                    });
                }
                _record.properties = _properties;
                return _record;
            }

            $scope._reset = function(){
                _date = new Date();_date.setMilliseconds(0);_date.setSeconds(0);
                $scope.record = {reference:'', product:$scope.record.product, analysis_date:_date, elaboration_date:_date, due_date:undefined, reception_date:undefined,
                    provider:undefined, remission:"", quantity:0, veredict:'', active:true, notes:'', properties:[]
                };
                $scope.updateProperties();
                $scope.form.$setPristine();
            }

            $scope.updateStores = function(){
                $scope.stores = [];
                for(var i in $scope._stores){
                    var _store = $scope._stores[i];
                    if(_store.subsidiary && _store.subsidiary.length>0 &&  _store.subsidiary[0].id==$scope.selecteds.subsidiary){
                        $scope.stores.push(_store);
                    }
                }
            };

            $scope.updateProducts = function(){
                $scope.products = [];
                for(var i in $scope._products){
                    var _product = $scope._products[i];
                    if(_product.store && _product.store.length>0 && _product.store[0]._id==$scope.selecteds.store){
                        $scope.products.push(_product);
                    }
                }
            };

            $scope.updateProperties = function(){
                $scope.record.product = $scope.selecteds.product.id;
                $scope.record.properties = [];
                for(var i in $scope.selecteds.product.properties){
                    var _p = $scope.selecteds.product.properties[i];
                    _p.value = '';
                    $scope.record.properties.push(_p);
                }
                $scope._form = {
                    error : {
                        reference: false,
                    },
                    success: {
                        general: false
                    }
                };
            }

            initializeData();
        }])

    .controller('RecordEditCtrl', ['$scope', '$translate', '$state', '$localStorage', '$window', '$document', '$location', '$rootScope', '$timeout', '$mdSidenav', '$mdColorPalette', '$anchorScroll', 'ngDialog', 'Flash', 'RecordService', 'ProductService', 'StoreService', 'ExternalService', 'APPLICATION',
        function ($scope, $translate, $state, $localStorage, $window, $document, $location, $rootScope, $timeout, $mdSidenav, $mdColorPalette, $anchorScroll, ngDialog, Flash, RecordService, ProductService, StoreService, ExternalService, APPLICATION) {
            $scope.original = undefined;
            $scope.record = {};
            $scope.product = {};
            $scope._form = {
                error : {
                    reference: false,
                }
            };
            $scope.externals = [];
            ga('send','event','record edit',JSON.parse(localStorage.USER_DATA).profile[0].name);
            $scope._submit = $scope._edit = function(){
                RecordService.update({token: localStorage.getItem(APPLICATION.CONFIG.AUTH.TOKEN_KEY), id:$state.params._id}, $scope._getChanges()
                    , function(response){
                        Flash.create('success',response.message);
                        $scope._form.error.reference = false;
                        $scope._init();
                    }, function(errorResponse){
                        if(errorResponse.status == 406){ //validations error
                            if(errorResponse.data.data.fields.reference){
                                $scope._form.error.reference = errorResponse.data.data.fields.reference;
                            }
                            Flash.create('danger',errorResponse.data.data.fields.reference.message);
                        }else{
                            Flash.create('danger',errorResponse.data.message);
                        }
                    });
            }

            $scope._validate = function(){
                if(JSON.stringify($scope.original) == JSON.stringify($scope.external)){
                    return false;
                }else if(Object.keys($scope._getChanges()).length===0){
                    return false;
                }else if(!$scope.validateProperties()){
                    return false;
                }
                return true;
            }

            $scope._goBack = function(){
                $state.go('app.record');
            }

            $scope.__construct = function(){
                $scope.original = undefined;
                $scope.external = {};
                //$scope.form.$setPristine();
            }

            $scope.validateProperties = function(){
                for(var i in $scope.record.properties){
                    if($scope.record.properties[i].value.trim() == ""){
                        return false;
                    }
                }
                return true;
            }

            $scope._getChanges = function(){
                var changes = {};
                if(!$scope.original) return changes;
                if($scope.original.reference!==$scope.record.reference){
                    changes.reference = $scope.record.reference;
                }
                if(getDateWithoutPartialDays(new Date($scope.original.analysis_date)).getTime()
                    !==getDateWithoutPartialDays($scope.record.analysis_date).getTime()){
                    changes.analysis_date = $scope.record.analysis_date;
                }
                if(getDateWithoutPartialDays(new Date($scope.original.elaboration_date)).getTime()
                    !==getDateWithoutPartialDays($scope.record.elaboration_date).getTime()){
                    changes.elaboration_date = $scope.record.elaboration_date;
                }
                if(getDateWithoutPartialDays(new Date($scope.original.due_date)).getTime()
                    !==getDateWithoutPartialDays($scope.record.due_date).getTime()){
                    changes.due_date = $scope.record.due_date;
                }
                if(getDateWithoutPartialDays(new Date($scope.original.reception_date)).getTime()
                    !==getDateWithoutPartialDays($scope.record.reception_date).getTime()){
                    changes.reception_date = $scope.record.reception_date;
                }
                if($scope.original.provider!==$scope.record.provider){
                    changes.supplier = $scope.record.provider;
                }
                if($scope.original.remission!==$scope.record.remission){
                    changes.remission = $scope.record.remission;
                }
                if($scope.original.quantity!==$scope.record.quantity){
                    changes.quantity = $scope.record.quantity;
                }
                if($scope.original.veredict!==$scope.record.veredict){
                    changes.veredict = $scope.record.veredict;
                }
                var propertiesChanges = $scope._getPropertiesChanges();
                if(propertiesChanges.length>0){
                    changes.properties = propertiesChanges;
                }
                if($scope.original.notes!==$scope.record.notes){
                    changes.notes = $scope.record.notes;
                }
                if($scope.original.active!==$scope.record.active){
                    changes.active = $scope.record.active;
                }
                if($scope.original.satisfies!==$scope.record.satisfies){
                    changes.satisfies = $scope.record.satisfies;
                }
                return changes;
            }

            $scope._getPropertiesChanges = function(){
                var changes = [];
                //debugger;
                for(var property = 0;property <  $scope.record.properties.length; property++){
                    for(var originalProperty = 0;originalProperty <  $scope.original.properties.length; originalProperty++){
                        if($scope.record.properties[property].property
                            ==$scope.original.properties[originalProperty].property
                            && $scope.record.properties[property].value
                            !=$scope.original.properties[originalProperty].value
                        ){
                            changes.push({
                                property:$scope.record.properties[property].property
                                , value:$scope.record.properties[property].value
                            });
                        }
                    }
                }
                //$scope.record.properties[0].value = "hansel";
                return changes;
            }

            function getDateWithoutPartialDays(date){
                if(!date) date = new Date(date);
                return new Date(date.getYear(), date.getMonth(), date.getDate());
            }

            $scope._init = function(){
                $scope.__construct();
                RecordService.get({token: localStorage.getItem(APPLICATION.CONFIG.AUTH.TOKEN_KEY), product:$state.params.product, id:$state.params._id}
                    , function (response) {
                        $scope.record = response;
                        $scope.record.provider = $scope.record.supplier[0].id;
                        if($scope.record.analysis_date){ $scope.record.analysis_date = new Date($scope.record.analysis_date); }
                        if($scope.record.elaboration_date){ $scope.record.elaboration_date = new Date($scope.record.elaboration_date); }
                        if($scope.record.due_date){ $scope.record.due_date = new Date($scope.record.due_date); }
                        if($scope.record.reception_date){ $scope.record.reception_date = new Date($scope.record.reception_date); }
                        ProductService.get({token: localStorage.getItem(APPLICATION.CONFIG.AUTH.TOKEN_KEY), id:$scope.record.product[0]._id}
                            , function (response) {
                                $scope.product = response;
                                matchRecordPropertyNames();
                                $scope.original = JSON.parse(JSON.stringify($scope.record));
                                StoreService.get({token: localStorage.getItem(APPLICATION.CONFIG.AUTH.TOKEN_KEY), id:$scope.product.store[0]._id}
                                    , function (response) {
                                        $scope.product.store[0] = response;
                                    }, function (errorResponse) {Flash.create('danger',errorResponse);$scope.requesting = false;
                                });
                            }, function (errorResponse) {Flash.create('danger',errorResponse);$scope.requesting = false;
                        });
                        $scope.original = JSON.parse(JSON.stringify($scope.record));
                        $scope.requesting = false;
                    }, function (errorResponse) {Flash.create('danger',errorResponse);$scope.requesting = false;
                });
                $scope.externals = [];
                ExternalService.query({token: localStorage.getItem(APPLICATION.CONFIG.AUTH.TOKEN_KEY)}
                    , function (response) {$scope.externals = response;$scope.requesting = false;
                    }, function (errorResponse) {Flash.create('danger',errorResponse);$scope.requesting = false;
                });
            }

            function matchRecordPropertyNames(){
                for(var property = 0;property <  $scope.record.properties.length; property++){
                    for(var productProperty = 0; productProperty < $scope.product.properties.length; productProperty++){
                        if($scope.record.properties[property].property == $scope.product.properties[productProperty].id){
                            $scope.record.properties[property].name = $scope.product.properties[productProperty].name;
                            break;
                        }
                    }
                }
            }

            $scope._init();

        }])
    .controller('RecordImportCtrl', ['$scope', '$translate', '$state', '$localStorage', '$window', '$document', '$location', '$rootScope', '$timeout', '$mdSidenav', '$mdColorPalette', '$anchorScroll', 'ExternalService', 'SubsidiaryService', 'StoreService', 'ProductService', 'ngDialog', 'Flash', 'RecordService', 'APPLICATION', '$sce','$interval',
        function ($scope, $translate, $state, $localStorage, $window, $document, $location, $rootScope, $timeout, $mdSidenav, $mdColorPalette, $anchorScroll, ExternalService, SubsidiaryService, StoreService, ProductService, ngDialog, Flash, RecordService, APPLICATION, $sce, $interval) {

            $scope.selecteds = {
                subsidiary: undefined
                , store: undefined
                , product: undefined
            };
            $scope.subsidiaries = [];
            $scope.stores = [];
            $scope._stores = [];
            $scope.products = [];
            $scope.externals = [];
            $scope._products = [];
            $scope.loading = false;

            $scope.config = {
                firstRow:2,
                fields:{
                    lote:1,
                    supplier: 2,
                    remission: 3,
                    analysisDate: 4,
                    elaborationDate:5,
                    receptionDate:6,
                    dueDate:7,
                    properties:[],
                    quantity:8,
                    existentQuantity:9,
                    veredict:10,
                    active:11,
                    creator:12,
                    notes:13
                }
            };

            function initializeData(){
                $scope.subsidiaries = [];
                SubsidiaryService.query({token: localStorage.getItem(APPLICATION.CONFIG.AUTH.TOKEN_KEY)}
                    , function (response) {$scope.subsidiaries = response;$scope.requesting = false;
                    }, function (errorResponse) {Flash.create('danger',errorResponse);$scope.requesting = false;
                    });
                $scope._stores = [];
                StoreService.query({token: localStorage.getItem(APPLICATION.CONFIG.AUTH.TOKEN_KEY)}
                    , function (response) {$scope._stores = response;$scope.requesting = false;
                    }, function (errorResponse) {Flash.create('danger',errorResponse);$scope.requesting = false;
                    });
                $scope._products = [];
                ProductService.query({token: localStorage.getItem(APPLICATION.CONFIG.AUTH.TOKEN_KEY)}
                    , function (response) {$scope._products = response;$scope.requesting = false;
                    }, function (errorResponse) {Flash.create('danger',errorResponse);$scope.requesting = false;
                    });
                $scope.externals = [];
                ExternalService.query({token: localStorage.getItem(APPLICATION.CONFIG.AUTH.TOKEN_KEY)}
                    , function (response) {$scope.externals = response;$scope.requesting = false;
                    }, function (errorResponse) {Flash.create('danger',errorResponse);$scope.requesting = false;
                    });
            }

            $scope.updateStores = function(){
                $scope.stores = [];
                for(var i in $scope._stores){
                    var _store = $scope._stores[i];
                    if(_store.subsidiary && _store.subsidiary.length>0 &&  _store.subsidiary[0].id==$scope.selecteds.subsidiary){
                        $scope.stores.push(_store);
                    }
                }
            };

            $scope.updateProducts = function(){
                $scope.products = [];
                for(var i in $scope._products){
                    var _product = $scope._products[i];
                    if(_product.store && _product.store.length>0 && _product.store[0]._id==$scope.selecteds.store){
                        $scope.products.push(_product);
                    }
                }
            };

            $scope.updateProperties = function(){
                /*
                $scope.record.product = $scope.selecteds.product.id;
                $scope.record.properties = [];
                for(var i in $scope.selecteds.product.properties){
                    var _p = $scope.selecteds.product.properties[i];
                    _p.value = '';
                    $scope.record.properties.push(_p);
                }
                */
            }

            initializeData();

        }])
    .controller('CertificateCtrl', ['$scope', '$translate', '$state', '$localStorage', '$window', '$document', '$location', '$rootScope', '$timeout', '$mdSidenav', '$mdColorPalette', '$anchorScroll', 'ngDialog', 'Flash', 'CertificateService', 'APPLICATION', '$sce',
        function ($scope, $translate, $state, $localStorage, $window, $document, $location, $rootScope, $timeout, $mdSidenav, $mdColorPalette, $anchorScroll, ngDialog, Flash, CertificateService, APPLICATION, $sce) {

            $scope.items = [];
            $scope.item = null;
            $scope.itemPrintPage = null;
            $scope.itemLoading = false;
            $scope.sortKey = 'id';
            $scope.reverse = true;
            $scope.pageSize = 10;
            $scope.all = localStorage.all==="?all=true";
            $scope.from = new Date(new Date().getTime()-(187*24*3600*1000));
            ga('send','event','certificates list',JSON.parse(localStorage.USER_DATA).profile[0].name);

            $scope.sort = function (keyname) {
                if (keyname == $scope.sortKey) {
                    if (!$scope.reverse) {
                        $scope.reverse = !$scope.reverse;
                    } else {
                        $scope.sortKey = 'id';
                        $scope.reverse = false;
                    }
                } else {
                    $scope.sortKey = keyname;
                    $scope.reverse = false;
                }
            }

            $scope.add = function(){
                $state.go('app.certificateAdd');
            }

            $scope.get = function () {
                $scope.itemLoading = true;
                CertificateService.query({token: localStorage.getItem(APPLICATION.CONFIG.AUTH.TOKEN_KEY)}
                    , function (response) {
                        var items = [];
                        for (var i = 0; i < response.length; i++) {
                            items.push({
                                id: response[i]._id,
                                no: response[i].id,
                                created: response[i].created,
                                customer: response[i].customer.length > 0 ? response[i].customer[0].name : 'N/R',
                                quantity: response[i].quantity,
                                presentation: response[i].presentation,
                                remission: response[i].remission,
                                product: response[i].product[0].name+' ('+response[i].product[0].reference+')',
                                user: response[i].creator[0].firstname+' '+response[i].creator[0].lastname,
                                active: response[i].active
                            });
                        }
                        $scope.items = items;
                        $scope.itemLoading = false;
                    }
                    , function (errorResponse) {
                        console.log(errorResponse);
                    });
            };

            $scope.showDetail = function(item){
                $scope.item = item;
                $scope.itemLoading = true;
                CertificateService.get({token: localStorage.getItem(APPLICATION.CONFIG.AUTH.TOKEN_KEY), id:item.id}
                , function(response){
                        $scope.item = response;
                        $scope.itemLoading = false;
                    }
                , function(errorResponse){
                        $scope.errorMesagge = "Error consultando elemento";
                        $scope.itemLoading = false;
                    });
                ngDialog.open({
                    template: 'detail',
                    scope: $scope,
                    //width: window.innerWidth < 800 ? window.innerWidth-24 : window.innerWidth-384
                });
            }

            $scope.showPrint = function(item){
                $scope.item = item;
                $scope.itemPrintPage = window.open("#/print/certificate/"+(item._id?item._id:item.id),this.target,'width=800,height=600');
            }

            $scope.delete = function(item){
                $scope.item = item;
                ngDialog.open({
                    template: 'delete',
                    scope: $scope,
                    //width: window.innerWidth < 800 ? window.innerWidth-24 : window.innerWidth-384
                });
            }

            $scope._cancelDelete = function(){
                $scope.item = null;
                ngDialog.closeAll();
            }

            $scope._doDelete = function(item){
                CertificateService.delete({token: localStorage.getItem(APPLICATION.CONFIG.AUTH.TOKEN_KEY), id: (item._id?item._id:item.id)}
                    , function (response) {
                        Flash.create('success',response.message);
                        $scope._cancelDelete();
                        $scope.get();
                    }
                    , function (errorResponse) {
                        console.log(errorResponse);
                        Flash.create('danger',errorResponse.data.data.fields.reference);
                    });
            }

            $scope.setShowAllData = function(){
                localStorage.all = $scope.all ? "?all=true":"";
                $scope.get();
            }

            $scope.get();

        }])
    .controller('CertificateAddCtrl', ['$scope', '$translate', '$state', '$localStorage', '$window', '$document', '$location', '$rootScope', '$timeout', '$mdSidenav', '$mdColorPalette', '$anchorScroll', 'ngDialog', 'Flash', 'SubsidiaryService', 'StoreService', 'ProductService', 'RecordService', 'ExternalService', 'CertificateService', 'APPLICATION', '$sce','DueListFactory',
        function ($scope, $translate, $state, $localStorage, $window, $document, $location, $rootScope, $timeout, $mdSidenav, $mdColorPalette, $anchorScroll, ngDialog, Flash, SubsidiaryService, StoreService, ProductService, RecordService, ExternalService, CertificateService, APPLICATION, $sce, DueListFactory) {
            var _date = new Date();_date.setMilliseconds(0);_date.setSeconds(0);
            $scope.certificate = {date: _date, subsidiary:undefined, store:undefined,
                product:undefined, properties:[], presentation:"", max_dose:"", elaboration_date:_date, due_date:0,
                values:[], customer:undefined, quantity:0
                , remission:"", clause:APPLICATION.ENUM.MESSAGES.CERTIFICATE.DEFAULT_CLAUSE, active:true};
            $scope.subsidiaries = [];
            $scope.stores = [];
            $scope._stores = [];
            $scope.products = [];
            $scope._products = [];
            $scope.product = undefined;
            $scope.properties = [];
            $scope.record = undefined;
            $scope.form = {record:undefined};
            $scope.externals = [];
            $scope.requesting = true;
            ga('send','event','certificates add',JSON.parse(localStorage.USER_DATA).profile[0].name);
            SubsidiaryService.query({token: localStorage.getItem(APPLICATION.CONFIG.AUTH.TOKEN_KEY)}
                , function (response) {$scope.subsidiaries = response;$scope.requesting = false;
                }, function (errorResponse) {Flash.create('danger',errorResponse);$scope.requesting = false;
                });
            StoreService.query({token: localStorage.getItem(APPLICATION.CONFIG.AUTH.TOKEN_KEY)}
                , function (response) {$scope._stores = response;$scope.requesting = false;
                }, function (errorResponse) {Flash.create('danger',errorResponse);$scope.requesting = false;
                });
            ProductService.query({token: localStorage.getItem(APPLICATION.CONFIG.AUTH.TOKEN_KEY)}
                , function (response) {$scope._products = response;$scope.requesting = false;
                }, function (errorResponse) {Flash.create('danger',errorResponse);$scope.requesting = false;
                });
            ExternalService.query({token: localStorage.getItem(APPLICATION.CONFIG.AUTH.TOKEN_KEY)}
                , function (response) {$scope.externals = response;$scope.requesting = false;
                }, function (errorResponse) {Flash.create('danger',errorResponse);$scope.requesting = false;
                });

            $scope.validateCertificateProperties = function(){
                for(var i in $scope.certificate.properties){
                    if($scope.certificate.properties[i]===true){
                        return true;
                    }
                }
                return false;
            }

            $scope.updateStores = function(){
                $scope.stores = [];
                for(var i in $scope._stores){
                    var _store = $scope._stores[i];
                    if(_store.subsidiary && _store.subsidiary.length>0 &&  _store.subsidiary[0].id==$scope.certificate.subsidiary){
                        $scope.stores.push(_store);
                    }
                }
            };

            $scope.updateProducts = function(){
                $scope.products = [];
                for(var i in $scope._products){
                    var _product = $scope._products[i];
                    if(_product.store && _product.store.length>0 && _product.store[0]._id==$scope.certificate.store){
                        $scope.products.push(_product);
                    }
                }
            };

            $scope.updateProperties = function(){
                $scope.product = undefined;
                for(var i in $scope._products){
                    if($scope._products[i].id ==$scope.certificate.product){
                        $scope.product = $scope._products[i];
                    }
                }
                $scope.certificate.properties = [];
                for(var i in $scope.product.properties){
                    var _p = $scope.product.properties[i];
                    $scope.certificate.properties[_p.id] = true;
                }
                $scope.certificate.properties['analysisDate'] = false;
                $scope.certificate.properties['elaborationDate'] = false;
                $scope.certificate.properties['dueDate'] = false;
                $scope.certificate.properties['receptionDate'] = false;
                $scope.certificate.properties['quantity'] = false;
                $scope.certificate.max_dose = $scope.product.max_dose;
                $scope.certificate.certification_nsf = $scope.product.certification_nsf;
                $scope.certificate.due_date = DueListFactory.one($scope.product.due_date);
                $scope.updateRecords();

            }

            $scope.updateRecords = function(){
                $scope.records = [];
                $scope.requesting = true;
                RecordService.query({token: localStorage.getItem(APPLICATION.CONFIG.AUTH.TOKEN_KEY), product:$scope.product._id}
                    , function (response) {$scope._records = response; $scope.records = $scope._records; $scope.requesting = false;}
                    , function (errorResponse) {Flash.create('danger',errorResponse);$scope.requesting = false;}
                );
                $scope.certificate.values = [];
            }

            $scope.updateRecordsList = function(){
                $scope.records = [];
                var exists;
                for(var r in $scope._records){
                    exists = false;
                    for(var v in $scope.certificate.values){
                        if($scope._records[r].reference && $scope._records[r].reference == $scope.certificate.values[v].reference){
                            exists = true;
                        }
                    }
                    if($scope._records[r].reference && !exists ){
                        $scope.records.push($scope._records[r]);
                    }
                }
            }

            $scope.updateValues = function(){
                $scope.form.recordSelected = true;
                $scope.certificate.values.push($scope.form.record);
                $scope.form.record = undefined;
                $scope.updateRecordsList();
            }

            $scope._form = {
                error : {
                    name: false,
                },
                success: {
                    general: false
                }
            };

            $scope._updateProperties = function(){
                for(var i in  $scope.profile.permissions){
                    if($scope.profile.permissions[i]===false){
                        delete $scope.profile.permissions[i];
                    }
                }
            }

            $scope._create = function(){
                CertificateService.save({token: localStorage.getItem(APPLICATION.CONFIG.AUTH.TOKEN_KEY)}, formatCertificate()
                    , function(response){
                        Flash.create('success',response.message
                            +'. El código del certificado generado es ' +
                            '<a class="font-bold" href="'+getPrintUrl(response.data.result)+'">'+response.data.result.id+'</a>,'
                            +' para imprimir este certificado haga clic ' +
                            '<a class="font-bold" href="'+getPrintUrl(response.data.result)+'">aquí</a>');
                        $scope._reset();
                    }, function(errorResponse){
                        Flash.create('danger',errorResponse.data.message);
                        if(errorResponse.status == 406){ //validations error

                        }
                    });
            }

            $scope._reset = function(){
                _date = new Date();_date.setMilliseconds(0);_date.setSeconds(0);
                $scope.certificate = {date: _date, subsidiary:undefined, store:undefined,
                    product:undefined, properties:[], presentation:"", max_dose:"", elaboration_date:_date, due_date:0,
                    values:[], customer:undefined, quantity:0
                    , remission:"", clause:APPLICATION.ENUM.MESSAGES.CERTIFICATE.DEFAULT_CLAUSE, active:true};
                $scope.form.$setPristine();
                $scope.product = undefined;
                $scope.properties = [];
                $scope.record = undefined;
                $scope.form = {record:undefined};
            }

            function getPrintUrl(item){
                return 'javascript:window.open(\'#/print/certificate/'+item._id+'\',\'width=800,height=600\')';
            }

            function getLeader(){
                for(var i=0;i<$scope.subsidiaries.length;i++){
                    if($scope.subsidiaries[i].id ==$scope.certificate.subsidiary){
                        return $scope.subsidiaries[i].leader[0].firstname + ' '
                            + $scope.subsidiaries[i].leader[0].lastname;
                    }
                }
                return null;
            }

            function formatCertificate(){
                return {
                    date: $scope.certificate.date
                    , subsidiary: $scope.certificate.subsidiary
                    , product: $scope.certificate.product
                    , customer: $scope.certificate.customer
                    , remission: $scope.certificate.remission
                    , quantity: $scope.certificate.quantity
                    , presentation: $scope.certificate.presentation
                    , properties: formatCertificateProperties()
                    , values: formatCertificateValues()
                    , elaboration_date: $scope.certificate.elaboration_date
                    , max_dose: $scope.certificate.max_dose
                    , due_date: $scope.certificate.due_date
                    , certification_nsf: $scope.certificate.certification_nsf
                    , leader: getLeader()
                    , clause: $scope.certificate.clause
                    , active: true
                };
            }

            function formatCertificateProperties(){
                var _p = [];
                debugger;
                _p.push({property:'reference', name:"Lote"});
                if($scope.certificate.properties['analysisDate']===true){
                    _p.push({property:'analysisDate', name:"Fecha de Análisis"});
                }
                if($scope.certificate.properties['elaborationDate']===true){
                    _p.push({property:'elaborationDate', name:"Fecha de Elaboración"});
                }
                if($scope.certificate.properties['dueDate']===true){
                    _p.push({property:'dueDate', name:"Fecha de Vencimiento"});
                }
                if($scope.certificate.properties['receptionDate']===true){
                    _p.push({property:'receptionDate', name:"Fecha de Recepción"});
                }
                for(var i in $scope.certificate.properties){
                    if($scope.certificate.properties[i]===true){
                        for(var p in $scope.product.properties){
                            if($scope.product.properties[p].id == i){
                                _p.push({
                                    property: $scope.product.properties[p].id
                                    , name: $scope.product.properties[p].name
                                });
                                break;
                            }
                        }
                    }
                }
                return _p;
            }

            function formatCertificateValues(){
                var _v = [];
                for(var r in $scope.certificate.values){
                    var _values = [];
                    var _record = $scope.certificate.values[r];
                    _values.push({
                        property: 'reference'
                        , value: _record.reference
                    });

                    if($scope.certificate.properties['analysisDate']===true){
                        _values.push({
                            property: 'analysisDate'
                            , value: _record.analysis_date
                        });
                    }
                    if($scope.certificate.properties['elaborationDate']===true){
                        _values.push({
                            property: 'elaborationDate'
                            , value: _record.elaboration_date
                        });
                    }
                    if($scope.certificate.properties['dueDate']===true){
                        _values.push({
                            property: 'dueDate'
                            , value: _record.due_date
                        });
                    }
                    if($scope.certificate.properties['receptionDate']===true){
                        _values.push({
                            property: 'receptionDate'
                            , value: _record.reception_date
                        });
                    }
                    for(var v in _record.properties){
                        var _value = _record.properties[v];
                        for(var pr in $scope.certificate.properties){
                            if($scope.certificate.properties[pr] === true && _value.property == pr){
                                _values.push({
                                    property: _value.property
                                    , value: _value.value
                                });
                            }
                        }
                    }
                    _v.push({
                        record: _record.reference
                        , values: _values
                    });
                }
                return _v;
            }

            $scope._goBack = function(){
                $state.go('app.certificate');
            }
        }])
    .controller('CertificateValidationCtrl', ['$scope', '$translate', '$state', '$localStorage', '$window', '$document', '$location', '$rootScope', '$timeout', '$mdSidenav', '$mdColorPalette', '$anchorScroll', 'ngDialog', 'Flash', 'CertificateValidationService', 'APPLICATION', '$sce',
        function ($scope, $translate, $state, $localStorage, $window, $document, $location, $rootScope, $timeout, $mdSidenav, $mdColorPalette, $anchorScroll, ngDialog, Flash, CertificateValidationService, APPLICATION, $sce) {
            $scope.certificate = { id:$state.params.id, verification: $state.params.verification != '-' ? $state.params.verification : '' };
            $scope.requesting = '';
            ga('send','event','certificates validation',localStorage.USER_DATA ? JSON.parse(localStorage.USER_DATA).profile[0].name : 'anon');
            $scope._submit = function(){
                $scope.requesting = 'Consultando...';
                CertificateValidationService.get({id: $scope.certificate.id, verification: $scope.certificate.verification}
                ,function(response){
                    $scope.requesting = '';
                    $window.open("#/print/certificate/"+(response._id?response._id:response.id),'_blank');
                }
                ,function(errorResponse){
                    $scope.errorMessage = "No se ha podido verificar su certificado con los datos proporcionados, verifique o contacte con su proveedor";
                    $scope.requesting = '';
                    $timeout(function(){$scope.errorMessage = '';},10000);
                });
            }
        }])
    .controller('CertificatePrintController', ['$scope', '$translate', '$state', '$localStorage', '$window', '$document', '$location', '$rootScope', '$timeout', '$mdSidenav', '$mdColorPalette', '$anchorScroll', 'ngDialog', 'Flash', 'CertificateService', 'APPLICATION',
        function ($scope, $translate, $state, $localStorage, $window, $document, $location, $rootScope, $timeout, $mdSidenav, $mdColorPalette, $anchorScroll, ngDialog, Flash, CertificateService, APPLICATION) {
            $scope.item = null;
            $scope.itemLoading = true;
            $scope._width = 1;
            $scope.qrcode = "http://www.pqp.com.co/";
            ga('send','event','certificates print',localStorage.USER_DATA ? JSON.parse(localStorage.USER_DATA).profile[0].name : 'anon');
            CertificateService.get({token: localStorage.getItem(APPLICATION.CONFIG.AUTH.TOKEN_KEY), id:$state.params.id}
                , function(response){
                    $scope.item = response;
                    //$scope.qrcode = "http://www.pqp.com.co/q/?c=";
                    $scope.itemLoading = false;
                    $scope._width = 80/($scope.item.properties.length-2);
                    setTimeout(function(){
                        $scope.qrcode = "http://www.pqp.com.co/q/c/"+$scope.item.id+"/v/"+$scope.item.verification;
                        setTimeout(function(){window.print();},500);
                    },100);
                    $("title").html("Certificado de Calidad "+ $scope.item.id +" "+$("title").html())
                }
                , function(errorResponse){
                    $scope.errorMesagge = "Error consultando elemento";
                    $scope.itemLoading = false;
                });
        }])
    .controller('ExternalCtrl', ['$scope', '$translate', '$state', '$localStorage', '$window', '$document', '$location', '$rootScope', '$timeout', '$mdSidenav', '$mdColorPalette', '$anchorScroll', 'ngDialog', 'Flash', 'ExternalService', 'APPLICATION',
        function ($scope, $translate, $state, $localStorage, $window, $document, $location, $rootScope, $timeout, $mdSidenav, $mdColorPalette, $anchorScroll, ngDialog, Flash, ExternalService, APPLICATION) {

            $scope.items = [];
            $scope._item = null;
            $scope.sortKey = 'name';
            $scope.reverse = false;
            $scope.pageSize = 10;
            $scope.sort = function (keyname) {
                if (keyname == $scope.sortKey) {
                    if (!$scope.reverse) {
                        $scope.reverse = !$scope.reverse;
                    } else {
                        $scope.sortKey = 'id';
                        $scope.reverse = false;
                    }
                } else {
                    $scope.sortKey = keyname;
                    $scope.reverse = false;
                }
            };
            ga('send','event','external list',JSON.parse(localStorage.USER_DATA).profile[0].name);

            $scope.add = function(){
                $state.go('app.externalAdd');
            }

            $scope.get = function () {
                ExternalService.query({token: localStorage.getItem(APPLICATION.CONFIG.AUTH.TOKEN_KEY)}
                    , function (response) {
                        var items = [];
                        for (var i = 0; i < response.length; i++) {
                            items.push({
                                id: response[i]._id,
                                name: response[i].name,
                                address: response[i].address,
                                active: response[i].active
                            });
                        }
                        $scope.items = items;
                    }
                    , function (errorResponse) {
                        console.log(errorResponse);
                    });
            };

            $scope.delete = function(item){
                $scope._item = item;
                ngDialog.open({
                    template: 'delete',
                    scope: $scope,
                    //width: window.innerWidth < 800 ? window.innerWidth-24 : window.innerWidth-384
                });
            }

            $scope.edit = function(item){
                $state.go('app.externalEdit', {'_id':item.id});
            }

            $scope._cancelDelete = function(){
                $scope._item = null;
                ngDialog.closeAll();
            }

            $scope._doDelete = function(item){
                ExternalService.delete({token: localStorage.getItem(APPLICATION.CONFIG.AUTH.TOKEN_KEY), id: item.id}
                    , function (response) {
                        Flash.create('success',response.message);
                        $scope._cancelDelete();
                        $scope.get();
                    }
                    , function (errorResponse) {
                        console.log(errorResponse);
                        Flash.create('danger',errorResponse.data.data.fields.reference);
                    });
            }

            $scope.get();

        }])
    .controller('ExternalAddCtrl', ['$scope', '$translate', '$state', '$localStorage', '$window', '$document', '$location', '$rootScope', '$timeout', '$mdSidenav', '$mdColorPalette', '$anchorScroll', 'ngDialog', 'Flash', 'ExternalService', 'APPLICATION',
        function ($scope, $translate, $state, $localStorage, $window, $document, $location, $rootScope, $timeout, $mdSidenav, $mdColorPalette, $anchorScroll, ngDialog, Flash, ExternalService, APPLICATION) {
            $scope.external = {name:"", address:"", phone:"", notes:"", contact:"", active:true};
            $scope.requesting = false;

            //Obligatory fields
            $scope._form = {
                error : {
                    name: false
                }
            };
            ga('send','event','external add',JSON.parse(localStorage.USER_DATA).profile[0].name);
            $scope._submit = $scope._create = function(){
                ExternalService.save({token: localStorage.getItem(APPLICATION.CONFIG.AUTH.TOKEN_KEY)}, $scope.external
                    , function(response){
                        Flash.create('success',response.message);
                        $scope.external = {name:"", address:"", phone:"", notes:"", contact:"", active:true};
                        $scope.form.$setPristine();
                    }, function(errorResponse){
                        Flash.create('danger',errorResponse.data.message);
                        if(errorResponse.status == 406){ //validations error
                            if(errorResponse.data.data.fields.name){
                                $scope._form.error.name = errorResponse.data.data.fields.name;
                            }
                        }
                    });
            }

            $scope._goBack = function(){
                $state.go('app.external');
            }
        }])
    .controller('ExternalEditCtrl', ['$scope', '$translate', '$state', '$localStorage', '$window', '$document', '$location', '$rootScope', '$timeout', '$mdSidenav', '$mdColorPalette', '$anchorScroll', 'ngDialog', 'Flash', 'ExternalService', 'APPLICATION',
        function ($scope, $translate, $state, $localStorage, $window, $document, $location, $rootScope, $timeout, $mdSidenav, $mdColorPalette, $anchorScroll, ngDialog, Flash, ExternalService, APPLICATION) {
            $scope.original = undefined;
            $scope.external = {};
            $scope._form = {
                error : {
                    reference: false,
                }
            };
            ga('send','event','external edit',JSON.parse(localStorage.USER_DATA).profile[0].name);
            $scope._submit = $scope._edit = function(){
                ExternalService.update({token: localStorage.getItem(APPLICATION.CONFIG.AUTH.TOKEN_KEY), id:$state.params._id}, $scope._getChanges()
                    , function(response){
                        Flash.create('success',response.message);
                        $scope._init();
                    }, function(errorResponse){
                        Flash.create('danger',errorResponse.data.message);
                        if(errorResponse.status == 406){ //validations error

                        }
                    });
            }

            $scope._validate = function(){
                if(JSON.stringify($scope.original) == JSON.stringify($scope.external)){
                    return false;
                }else if(Object.keys($scope._getChanges()).length===0){
                    return false;
                }
                return true;
            }

            $scope._goBack = function(){
                $state.go('app.external');
            }

            $scope.__construct = function(){
                $scope.original = undefined;
                $scope.external = {};
                //$scope.form.$setPristine();
            }

            $scope._getChanges = function(){
                var changes = {};
                if($scope.original.name!==$scope.external.name){
                    changes.name = $scope.external.name;
                }
                if($scope.original.address!==$scope.external.address){
                    changes.address = $scope.external.address;
                }
                if($scope.original.phone!==$scope.external.phone){
                    changes.phone = $scope.external.phone;
                }
                if($scope.external.notes && $scope.external.notes!=='<p></p>' && $scope.original.notes!==$scope.external.notes){
                    changes.notes = $scope.external.notes;
                }
                if($scope.original.contact!==$scope.external.contact){
                    changes.contact = $scope.external.contact;
                }
                if($scope.original.active!==$scope.external.active){
                    changes.active = $scope.external.active;
                }
                return changes;
            }

            $scope._init = function(){
                $scope.__construct();
                ExternalService.get({token: localStorage.getItem(APPLICATION.CONFIG.AUTH.TOKEN_KEY), id:$state.params._id}
                    , function (response) {
                        $scope.external = response;
                        $scope.original = JSON.parse(JSON.stringify($scope.external));
                        $scope.requesting = false;
                    }, function (errorResponse) {Flash.create('danger',errorResponse);$scope.requesting = false;
                });
            }

            $scope._init();

        }])
    .controller('UserCtrl', ['$scope', '$translate', '$state', '$localStorage', '$window', '$document', '$location', '$rootScope', '$timeout', '$mdSidenav', '$mdColorPalette', '$anchorScroll', 'ngDialog', 'Flash', 'UserService', 'APPLICATION',
        function ($scope, $translate, $state, $localStorage, $window, $document, $location, $rootScope, $timeout, $mdSidenav, $mdColorPalette, $anchorScroll, ngDialog, Flash, UserService, APPLICATION) {

            $scope.items = [];
            $scope._item = null;
            $scope.sortKey = 'lastname';
            $scope.reverse = false;
            $scope.pageSize = 10;
            $scope.sort = function (keyname) {
                if (keyname == $scope.sortKey) {
                    if (!$scope.reverse) {
                        $scope.reverse = !$scope.reverse;
                    } else {
                        $scope.sortKey = 'id';
                        $scope.reverse = false;
                    }
                } else {
                    $scope.sortKey = keyname;
                    $scope.reverse = false;
                }
            }

            $scope.add = function(){
                $state.go('app.userAdd');
            }
            ga('send','event','user list',JSON.parse(localStorage.USER_DATA).profile[0].name);

            $scope.showDetail = function(item){
                $scope.item = item;
                $scope.itemLoading = true;
                UserService.get({token: localStorage.getItem(APPLICATION.CONFIG.AUTH.TOKEN_KEY), id:(item._id?item._id:item.id)}
                    , function(response){
                        $scope.item = response;
                        $scope.itemLoading = false;
                    }
                    , function(errorResponse){
                        $scope.errorMesagge = "Error consultando elemento";
                        $scope.itemLoading = false;
                    });
                ngDialog.open({
                    template: 'detail',
                    scope: $scope,
                    //width: window.innerWidth < 800 ? window.innerWidth-24 : window.innerWidth-384
                });
            }

            $scope.get = function () {
                UserService.query({token: localStorage.getItem(APPLICATION.CONFIG.AUTH.TOKEN_KEY)}
                    , function (response) {
                        $scope.items = response;
                    }
                    , function (errorResponse) {
                        console.log(errorResponse);
                    });
            };

            $scope.delete = function(item){
                $scope._item = item;
                ngDialog.open({
                    template: 'delete',
                    scope: $scope,
                    //width: window.innerWidth < 800 ? window.innerWidth-24 : window.innerWidth-384
                });
            }

            $scope.edit = function(item){
                $state.go('app.userEdit', {'_id':(item._id?item._id:item.id)});
            }

            $scope._cancelDelete = function(){
                $scope._item = null;
                ngDialog.closeAll();
            }

            $scope._doDelete = function(item){
                UserService.delete({token: localStorage.getItem(APPLICATION.CONFIG.AUTH.TOKEN_KEY), id: (item._id?item._id:(item._id?item._id:item.id))}
                    , function (response) {
                        Flash.create('success',response.message);
                        $scope._cancelDelete();
                        $scope.get();
                    }
                    , function (errorResponse) {
                        console.log(errorResponse);
                        Flash.create('danger',errorResponse.data.data.fields.reference);
                    });
            }

            $scope.get();

        }])
    .controller('UserAddCtrl', ['$scope', '$translate', '$state', '$localStorage', '$window', '$document', '$location', '$rootScope', '$timeout', '$mdSidenav', '$mdColorPalette', '$anchorScroll', 'ngDialog', 'Flash', 'ProfileService', 'UserService', 'APPLICATION',
        function ($scope, $translate, $state, $localStorage, $window, $document, $location, $rootScope, $timeout, $mdSidenav, $mdColorPalette, $anchorScroll, ngDialog, Flash, ProfileService, UserService, APPLICATION) {
            $scope.user = {username:"", password:"", repeatPassword:"", profile:null, firstname:"", lastname:"", email:"", active:true};
            $scope.profiles = [];
            $scope.requesting = true;
            ProfileService.query({token: localStorage.getItem(APPLICATION.CONFIG.AUTH.TOKEN_KEY)}
                , function (response) {
                    $scope.profiles = response;
                    $scope.requesting = false;
                }
                , function (errorResponse) {
                    Flash.create('danger',errorResponse);
                    $scope.requesting = false;
                });

            $scope._form = {
                error : {
                    username: false,
                    profile: false,
                    repeatPassword: { message: APPLICATION.ENUM.MESSAGES.USER.PASSWORDS_NOT_EQUAL }
                },
                success: {
                    general: false
                }
            };
            ga('send','event','user add',JSON.parse(localStorage.USER_DATA).profile[0].name);

            $scope._submit = $scope._create = function(){
                UserService.save({token: localStorage.getItem(APPLICATION.CONFIG.AUTH.TOKEN_KEY)}, $scope.user
                    , function(response){
                        Flash.create('success',response.message);
                        $scope.user = {username:"", password:"", repeatPassword:"", profile:null, firstname:"", lastname:"", email:"", active:true};
                        $scope.form.$setPristine();
                    }, function(errorResponse){
                        Flash.create('danger',errorResponse.data.message);
                        if(errorResponse.status == 406){ //validations error
                            if(errorResponse.data.data.fields.username){
                                $scope._form.error.username = errorResponse.data.data.fields.username;
                            }
                        }
                    });
            }

            $scope._goBack = function(){
                $state.go('app.user');
            }
        }])
    .controller('UserEditCtrl', ['$scope', '$translate', '$state', '$localStorage', '$window', '$document', '$location', '$rootScope', '$timeout', '$mdSidenav', '$mdColorPalette', '$anchorScroll', 'ngDialog', 'Flash', 'ProfileService', 'UserService', 'APPLICATION',
        function ($scope, $translate, $state, $localStorage, $window, $document, $location, $rootScope, $timeout, $mdSidenav, $mdColorPalette, $anchorScroll, ngDialog, Flash, ProfileService, UserService, APPLICATION) {
            $scope.original = undefined;
            $scope.profiles = [];
            $scope.user = {};
            $scope._form = {
                error : {
                    username: false,
                    profile: false,
                    repeatPassword: { message: APPLICATION.ENUM.MESSAGES.USER.PASSWORDS_NOT_EQUAL }
                }
            };
            ga('send','event','user edit',JSON.parse(localStorage.USER_DATA).profile[0].name);
            $scope._submit = $scope._edit = function(){
                UserService.update({token: localStorage.getItem(APPLICATION.CONFIG.AUTH.TOKEN_KEY), id:$state.params._id}, $scope._getChanges()
                    , function(response){
                        Flash.create('success',response.message);$scope._init();
                    }, function(errorResponse){
                        Flash.create('danger',errorResponse.data.message);
                        if(errorResponse.status == 406){ //validations error
                            $scope._form.error.username = errorResponse.data.data.fields.username;
                        }
                    });
            }

            $scope._validate = function(){
                if(JSON.stringify($scope.original) == JSON.stringify($scope.user)){
                    return false;
                }else if(Object.keys($scope._getChanges()).length===0){
                    return false;
                }
                return true;
            }

            $scope._goBack = function(){
                $state.go('app.user');
            }

            $scope.__construct = function(){
                $scope.original = undefined;
                $scope.user = {};
                //$scope.form.$setPristine();
            }

            $scope._getChanges = function(){
                var changes = {};
                if($scope.original.firstname!==$scope.user.firstname){
                    changes.firstname = $scope.user.firstname;
                }
                if($scope.original.lastname!==$scope.user.lastname){
                    changes.lastname = $scope.user.lastname;
                }
                if($scope.original.username!==$scope.user.username){
                    changes.username = $scope.user.username;
                }
                if($scope.user.password!==''){
                    changes.password = $scope.user.password;
                }
                if($scope.original.profile!==$scope.user.profile){
                    changes.profile = $scope.user.profile;
                }
                if($scope.original.email!==$scope.user.email){
                    changes.email= $scope.user.email;
                }
                if($scope.original.active!==$scope.user.active){
                    changes.active = $scope.user.active;
                }
                if($scope.original.isAdmin!==$scope.user.isAdmin){
                    changes.isAdmin = $scope.user.isAdmin;
                }
                return changes;
            }

            $scope._init = function(){
                $scope.__construct();
                ProfileService.query({token: localStorage.getItem(APPLICATION.CONFIG.AUTH.TOKEN_KEY)}
                    , function (response) {$scope.profiles = response;$scope.requesting = false;}
                    , function (errorResponse) {Flash.create('danger',errorResponse);$scope.requesting = false;
                    });
                UserService.get({token: localStorage.getItem(APPLICATION.CONFIG.AUTH.TOKEN_KEY), id:$state.params._id}
                    , function (response) {
                        $scope.user = response;
                        $scope.user.password = $scope.user.repeatPassword = '';
                        if(!$scope.user.email){$scope.user.email ='';}
                        $scope.user.profile = $scope.user.profile[0].id;
                        $scope.original = JSON.parse(JSON.stringify($scope.user));
                        $scope.requesting = false;
                    }, function (errorResponse) {Flash.create('danger',errorResponse);$scope.requesting = false;
                    });
            }

            $scope._init();

        }])
    .controller('ProfileCtrl', ['$scope', '$translate', '$state', '$localStorage', '$window', '$document', '$location', '$rootScope', '$timeout', '$mdSidenav', '$mdColorPalette', '$anchorScroll', 'ngDialog', 'Flash', 'PermissionsService', 'ProfileService', 'APPLICATION',
        function ($scope, $translate, $state, $localStorage, $window, $document, $location, $rootScope, $timeout, $mdSidenav, $mdColorPalette, $anchorScroll, ngDialog, Flash, PermissionsService, ProfileService, APPLICATION) {

            $scope.items = [];
            $scope._item = null;
            $scope.permissions = [];
            $scope.sortKey = 'name';
            $scope.reverse = false;
            $scope.pageSize = 10;
            $scope.sort = function (keyname) {
                if (keyname == $scope.sortKey) {
                    if (!$scope.reverse) {
                        $scope.reverse = !$scope.reverse;
                    } else {
                        $scope.sortKey = 'id';
                        $scope.reverse = false;
                    }
                } else {
                    $scope.sortKey = keyname;
                    $scope.reverse = false;
                }
            }
            ga('send','event','profile list',JSON.parse(localStorage.USER_DATA).profile[0].name);

            $scope.add = function(){
                $state.go('app.profileAdd');
            }

            $scope.showDetail = function(item){
                $scope.item = item;
                $scope.itemLoading = true;
                PermissionsService.query({token: localStorage.getItem(APPLICATION.CONFIG.AUTH.TOKEN_KEY)}
                    , function (response) {
                        $scope.permissions = response;
                    }
                    , function (errorResponse) {
                        console.log(errorResponse);
                });
                ProfileService.get({token: localStorage.getItem(APPLICATION.CONFIG.AUTH.TOKEN_KEY), id:(item._id?item._id:item.id)}
                    , function(response){
                        $scope.item = response;
                        $scope.itemLoading = false;
                    }
                    , function(errorResponse){
                        $scope.errorMesagge = "Error consultando elemento";
                        $scope.itemLoading = false;
                    });
                ngDialog.open({
                    template: 'detail',
                    scope: $scope,
                    //width: window.innerWidth < 800 ? window.innerWidth-24 : window.innerWidth-384
                });
            }

            $scope.get = function () {
                ProfileService.query({token: localStorage.getItem(APPLICATION.CONFIG.AUTH.TOKEN_KEY)}
                    , function (response) {
                        $scope.items = response;
                    }
                    , function (errorResponse) {
                        console.log(errorResponse);
                    });
            };

            $scope.delete = function(item){
                $scope._item = item;
                ngDialog.open({
                    template: 'delete',
                    scope: $scope,
                    //width: window.innerWidth < 800 ? window.innerWidth-24 : window.innerWidth-384
                });
            }

            $scope.edit = function(item){
                $state.go('app.profileEdit', {'_id':(item._id?item._id:item.id)});
            }

            $scope._cancelDelete = function(){
                $scope._item = null;
                ngDialog.closeAll();
            }

            $scope._doDelete = function(item){
                ProfileService.delete({token: localStorage.getItem(APPLICATION.CONFIG.AUTH.TOKEN_KEY), id: (item._id?item._id:item.id)}
                    , function (response) {
                        Flash.create('success',response.message);
                        $scope._cancelDelete();
                        $scope.get();
                    }
                    , function (errorResponse) {
                        console.log(errorResponse);
                        Flash.create('danger',errorResponse.data.data.fields.reference);
                    });
            }

            $scope.get();

        }])
    .controller('ProfileAddCtrl', ['$scope', '$translate', '$state', '$localStorage', '$window', '$document', '$location', '$rootScope', '$timeout', '$mdSidenav', '$mdColorPalette', '$anchorScroll', 'ngDialog', 'Flash', 'PermissionsService', 'ProfileService', 'APPLICATION',
        function ($scope, $translate, $state, $localStorage, $window, $document, $location, $rootScope, $timeout, $mdSidenav, $mdColorPalette, $anchorScroll, ngDialog, Flash, PermissionsService, ProfileService, APPLICATION) {
            $scope.profile = {name:"", description:"", permissions:{}, active:true};
            $scope.permissions = [];
            $scope.requesting = true;
            ga('send','event','profile add',JSON.parse(localStorage.USER_DATA).profile[0].name);
            PermissionsService.query({token: localStorage.getItem(APPLICATION.CONFIG.AUTH.TOKEN_KEY)}
                , function (response) {
                    $scope.permissions = response;
                    $scope.requesting = false;
                }
                , function (errorResponse) {
                    Flash.create('danger',errorResponse);
                    $scope.requesting = false;
                });

            $scope._form = {
                error : {
                    name: false,
                },
                success: {
                    general: false
                }
            };

            $scope._updatePermissions = function(){
                for(var i in  $scope.profile.permissions){
                    if($scope.profile.permissions[i]===false){
                        delete $scope.profile.permissions[i];
                    }
                }
            }

            $scope._submit = $scope._create = function(){
                ProfileService.save({token: localStorage.getItem(APPLICATION.CONFIG.AUTH.TOKEN_KEY)}, $scope.profile
                    , function(response){
                        Flash.create('success',response.message);
                        $scope.profile = {name:"", description:"", permissions:{}, active:true};
                        $scope.form.$setPristine();
                    }, function(errorResponse){
                        Flash.create('danger',errorResponse.data.message);
                        if(errorResponse.status == 406){ //validations error

                        }
                    });
            }

            $scope._goBack = function(){
                $state.go('app.profile');
            }
        }])
    .controller('ProfileEditCtrl', ['$scope', '$translate', '$state', '$localStorage', '$window', '$document', '$location', '$rootScope', '$timeout', '$mdSidenav', '$mdColorPalette', '$anchorScroll', 'ngDialog', 'Flash', 'PermissionsService', 'ProfileService', 'APPLICATION',
        function ($scope, $translate, $state, $localStorage, $window, $document, $location, $rootScope, $timeout, $mdSidenav, $mdColorPalette, $anchorScroll, ngDialog, Flash, PermissionsService, ProfileService, APPLICATION) {
            $scope.original = undefined;
            $scope.permissions = [];
            $scope.profile = {};
            $scope._form = {
                error : {
                }
            };
            ga('send','event','profile edit',JSON.parse(localStorage.USER_DATA).profile[0].name);
            $scope._submit = $scope._edit = function(){
                ProfileService.update({token: localStorage.getItem(APPLICATION.CONFIG.AUTH.TOKEN_KEY), id:$state.params._id}, $scope._getChanges()
                    , function(response){
                        Flash.create('success',response.message);$scope._init();
                    }, function(errorResponse){
                        Flash.create('danger',errorResponse.data.message);
                        if(errorResponse.status == 406){ //validations error
                        }
                    });
            }

            $scope._updatePermissions = function(){
                for(var i in  $scope.profile.permissions){
                    if($scope.profile.permissions[i]===false){
                        delete $scope.profile.permissions[i];
                    }
                }
            }

            $scope._validate = function(){
                if(JSON.stringify($scope.original) == JSON.stringify($scope.user)){
                    return false;
                }else if(Object.keys($scope._getChanges()).length===0){
                    return false;
                }
                return true;
            }

            $scope._goBack = function(){
                $state.go('app.profile');
            }

            $scope.__construct = function(){
                $scope.original = undefined;
                $scope.profile = {};
                //$scope.form.$setPristine();
            }

            $scope._getChanges = function(){
                var changes = {};
                if($scope.original.name!==$scope.profile.name){
                    changes.name = $scope.profile.name;
                }
                if($scope.original.description!==$scope.profile.description){
                    changes.description = $scope.profile.description;
                }
                var diff = $scope._getPermissionsChanges();
                if(diff){
                    changes.permissions = diff.permissions;
                }
                if($scope.original.active!==$scope.profile.active){
                    changes.active = $scope.profile.active;
                }
                return changes;
            }

            $scope._getPermissionsChanges = function(){
                var changes = {};
                var diff = false;
                for(var i in $scope.original.permissions){
                    if(!$scope.profile.permissions[i] || $scope.original.permissions[i]!=$scope.profile.permissions[i]){
                        diff = true;
                        break;
                    }
                }
                if(!diff) {
                    for (var i in $scope.profile.permissions) {
                        if (!$scope.original.permissions[i] || $scope.profile.permissions[i] != $scope.original.permissions[i]) {
                            diff = true;
                            break;
                        }
                    }
                }
                if(diff){
                    changes.permissions = {};
                    for (var i in $scope.profile.permissions) {
                        changes.permissions[i] = $scope.profile.permissions[i];
                    }
                    //changes.permissions = $scope.profile.permissions;
                }
                return changes;
            }

            $scope._init = function(){
                $scope.__construct();
                PermissionsService.query({token: localStorage.getItem(APPLICATION.CONFIG.AUTH.TOKEN_KEY)}
                    , function (response) {
                        $scope.permissions = response;
                    }, function (errorResponse) {Flash.create('danger',errorResponse);$scope.requesting = false;
                    });
                ProfileService.get({token: localStorage.getItem(APPLICATION.CONFIG.AUTH.TOKEN_KEY), id:$state.params._id}
                    , function (response) {
                        $scope.profile = response;
                        $scope.original = JSON.parse(JSON.stringify($scope.profile));
                        $scope.requesting = false;
                    }, function (errorResponse) {Flash.create('danger',errorResponse);$scope.requesting = false;
                });
            }

            $scope._init();

        }])

;