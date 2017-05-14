// config

var app =
        angular.module('app')
            .config(
                ['$controllerProvider', '$compileProvider', '$filterProvider', '$provide',
                    function ($controllerProvider, $compileProvider, $filterProvider, $provide) {

                        // lazy controller, directive and service
                        app.controller = $controllerProvider.register;
                        app.directive = $compileProvider.directive;
                        app.filter = $filterProvider.register;
                        app.factory = $provide.factory;
                        app.service = $provide.service;
                        app.constant = $provide.constant;
                        app.value = $provide.value;
                    }
                ])
            .config(['$translateProvider', function ($translateProvider) {
                // Register a loader for the static files
                // So, the module will search missing translation tables under the specified urls.
                // Those urls are [prefix][langKey][suffix].
                $translateProvider.useStaticFilesLoader({
                    prefix: 'i18n/',
                    suffix: '.js'
                });
                // Tell the module what language to use by default
                $translateProvider.preferredLanguage('en');
                // Tell the module to store the language in the local storage
                $translateProvider.useLocalStorage();
            }])
            .constant('APPLICATION', {
                CONFIG: {
                    API: {
                            URL: 'http://localhost:8080/',
                        RESOURCES: {
                            AUTH: 'auth/',
                            SUBSIDIARY: 'subsidiaries/',
                            STORE: 'stores/',
                            PRODUCT: 'products/',
                            RECORD: 'records/',
                            CERTIFICATE: 'certificates/',
                            CERTIFICATE_VALIDATION: 'certificates/validate/',
                            EXTERNAL: 'externals/',
                            USER: 'users/',
                            PROFILE: 'profiles/',
                            PERMISSIONS: 'permissions/',
                            PASSWORD: 'password/',
                        }
                    }
                    , DEVICE_KEY: 'b4cd45f5b00b326a79ea6121f9cc0db8'
                    , AUTH: {
                        TOKEN_KEY: 'TOKEN_KEY',
                        TOKEN_DATA: 'TOKEN_DATA',
                        USER_DATA: 'USER_DATA'
                    }
                    , PERMISSIONS: {
                        MODULES: {
                            SERVICE: 'service'
                        }
                        , OPTIONS: {}
                    }
                }
                , GLOBAL: {
                    SESSION_TIMELIFE: 24 * 60 * 60
                }
                , ENUM: {
                    CONFIG: {
                        GLOBAL: {
                            SESSION_TIMELIFE: 'SESSION_TIMELIFE'
                        }
                    }
                    , MESSAGES : {
                        AUTH : {
                            NO_CONNECTION : 'No ha sido posible identificarte por problemas en el servidor, por favor intenta dentro de unos momentos.'
                            , NOT_AUTHENTICATED: 'Aún no te has identificado, por favor inicia sesión antes de continuar.'
                            , SESSION_ENDED: 'Hemos cerrado tu sessión dada la falta de actividad, por favor identifícate nuevamente para continuar.'
                        },
                        USER:{
                            PASSWORDS_NOT_EQUAL: 'Las contraseñas no coinciden.'
                        },
                        CERTIFICATE: {
                            DEFAULT_CLAUSE: ""
                        }
                    }
                    , PROPERTY:{
                        TYPE:{
                            TEXT:'text'
                            , BOOLEAN: 'boolean'
                            , LIST: 'list'
                            , RANGE: 'range'
                        }
                    }
                    , PERMISSIONS: {
                        RECORD_LIST: 'recordList',
                        CERTIFICATE_LIST: 'certificateList',
                        PRODUCT_LIST: 'productList',
                        STORE_LIST: 'storeList',
                        SUBSIDIARY_LIST: 'subsidiaryList',
                        EXTERNAL_LIST: 'externalList',
                        USER_LIST: 'userList',
                        PROFILE_LIST: 'profileList',

                        RECORD_CREATE: 'recordCreate',
                        CERTIFICATE_CREATE: 'certificateCreate',
                        PRODUCT_CREATE: 'productCreate',
                        STORE_CREATE: 'storeCreate',
                        SUBSIDIARY_CREATE: 'subsidiaryCreate',
                        EXTERNAL_CREATE: 'externalCreate',
                        USER_CREATE: 'userCreate',
                        PROFILE_CREATE: 'profileCreate',

                        RECORD_UPDATE: 'recordUpdate',
                        PRODUCT_UPDATE: 'productUpdate',
                        STORE_UPDATE: 'storeUpdate',
                        SUBSIDIARY_UPDATE: 'subsidiaryUpdate',
                        EXTERNAL_UPDATE: 'externalUpdate',
                        USER_UPDATE: 'userUpdate',
                        PROFILE_UPDATE: 'profileUpdate',

                        RECORD_DELETE: 'recordDelete',
                        CERTIFICATE_DELETE: 'certificateDelete',
                        PRODUCT_DELETE: 'productDelete',
                        STORE_DELETE: 'storeDelete',
                        SUBSIDIARY_DELETE: 'subsidiaryDelete',
                        EXTERNAL_DELETE: 'externalDelete',
                        USER_DELETE: 'userDelete',
                        PROFILE_DELETE: 'profileDelete',

                        USER_RESET_PASSWORD: 'userResetPassword',
                        RECORD_EDIT_QUANTITY: 'recordEditQuantity',
                        RECORD_EDIT_ACTIVE: 'recordEditActive',
                        RECORD_EDIT_SATISFIES: 'recordEditSatisfies',

                        RECORD_IMPORT: 'recordImport',
                    }
                }
            })
            .factory('Page', function(){
                var _default = 'Qualitrix';
                var title =  _default;
                return {
                    title: function() { return title; },
                    setTitle: function(newTitle) { title = newTitle },
                    reset: function(){
                        title = _default
                    }
                };
            })
            .factory('Permissions',function(){
                var _permissions = {};
                var _isAdmin = false;
                return {
                    setPermissions: function(permissions){
                        _permissions = permissions;
                    },
                    setIsAdmin: function(isAdmin){
                        _isAdmin = isAdmin;
                    },
                    isAdmin: function(){
                        return _isAdmin;
                    },
                    hasPermission: function(permission){
                        return typeof _permissions[permission]!='undefined';
                    },
                    clear:function(){
                        _isAdmin=false;
                        _permissions={};
                    }
                };
            })
    ;
