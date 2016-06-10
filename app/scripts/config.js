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
                        URL: 'http://localhost:3000/',
                        RESOURCES: {
                            AUTH: 'auth/',
                            SUBSIDIARY: 'subsidiaries/',
                            STORE: 'stores/',
                            PRODUCT: 'products/',
                            RECORD: 'records/',
                            CERTIFICATE: 'certificates/',
                            EXTERNAL: 'externals/',
                            USER: 'users/',
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
                        }
                    }
                }
            })
            .factory('Page', function(){
                var _default = 'Qualitrix | Productos Químicos Panamericanos S.A. | Control de Calidad';
                var title =  _default;
                return {
                    title: function() { return title; },
                    setTitle: function(newTitle) { title = newTitle },
                    reset: function(){
                        title = _default
                    }
                };
            })
    ;
