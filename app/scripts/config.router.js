'use strict';

/**
 * @ngdoc function
 * @name app.config:uiRouter
 * @description
 * # Config
 * Config for the router
 */
angular.module('app')
    .run(
        ['$rootScope', '$state', '$stateParams',
            function ($rootScope, $state, $stateParams) {
                $rootScope.$state = $state;
                $rootScope.$stateParams = $stateParams;
            }
        ]
    )
    .config(
        ['$stateProvider', '$urlRouterProvider', 'MODULE_CONFIG', 'APPLICATION',
            function ($stateProvider, $urlRouterProvider, MODULE_CONFIG, APPLICATION) {
                var p = getParams('layout'),
                    l = p ? p + '.' : '',
                    layout = 'views/layout.' + l + 'html',
                    aside = 'views/aside.' + l + 'html',
                    content = 'views/content.' + l + 'html';

                $urlRouterProvider
                    .otherwise(
                        localStorage.getItem(APPLICATION.CONFIG.AUTH.TOKEN_KEY)
                            ? '/app/dashboard'
                            : '/access/signin'
                    );
                $stateProvider
                    .state('app', {
                        abstract: true,
                        url: '/app',
                        views: {
                            '': {
                                templateUrl: layout
                            },
                            'aside': {
                                templateUrl: aside
                            },
                            'content': {
                                templateUrl: content
                            }
                        }
                    })
                    .state('app.dashboard', {
                        url: '/dashboard',
                        templateUrl: 'views/pages/dashboard.html',
                        data: {title: 'Dashboard', folded: true},
                        resolve: load(['scripts/controllers/chart.js', 'scripts/controllers/vectormap.js'])
                    })
                    .state('app.about', {
                        url: '/about',
                        templateUrl: 'views/pages/about.html',
                        data: {title: 'Acerca del Sistema'},
                        controller: 'AboutController'
                    })
                    .state('app.userProfile', {
                        url: '/userProfile',
                        templateUrl: 'views/pages/settings.html',
                        data: {title: 'Perfil de Usuario'},
                        controller: 'UserProfileController'
                    })
                    .state('app.subsidiary', {
                        url: '/subsidiary',
                        templateUrl: 'views/modules/subsidiary/index.html',
                        data: {title: 'Sucursales'},
                        controller: 'SubsidiaryCtrl'
                    })
                    .state('app.subsidiaryAdd', {
                        url: '/subsidiary/add',
                        templateUrl: 'views/modules/subsidiary/edit.html',
                        data: {title: 'Nueva Sucursal'},
                        controller: 'SubsidiaryAddCtrl',
                        resolve: load(['ui.select'])
                    })
                    .state('app.subsidiaryEdit', {
                        url: '/subsidiary/edit/:_id',
                        templateUrl: 'views/modules/subsidiary/edit.html',
                        data: {title: 'Modificar Sucursal'},
                        controller: 'SubsidiaryEditCtrl',
                        resolve: load(['ui.select'])
                    })
                    .state('app.store', {
                        url: '/store',
                        templateUrl: 'views/modules/store/index.html',
                        data: {title: 'Bodegas/Tiendas'},
                        controller: 'StoreCtrl'
                    })
                    .state('app.storeAdd', {
                        url: '/store/add',
                        templateUrl: 'views/modules/store/edit.html',
                        data: {title: 'Nueva Tienda/Bodega'},
                        controller: 'StoreAddCtrl'
                    })
                    .state('app.storeEdit', {
                        url: '/store/edit/:_id',
                        templateUrl: 'views/modules/store/edit.html',
                        data: {title: 'Modificar Bodega/Tienda'},
                        controller: 'StoreEditCtrl',
                        resolve: load(['ui.select'])
                    })
                    .state('app.product', {
                        url: '/product',
                        templateUrl: 'views/modules/product/index.html',
                        data: {title: 'Productos'},
                        controller: 'ProductCtrl'
                    })
                    .state('app.productAdd', {
                        url: '/product/add/',
                        templateUrl: 'views/modules/product/edit.html',
                        data: {title: 'Nuevo Producto'},
                        controller: 'ProductAddCtrl',
                        resolve: load(['ui.select'])
                    })
                    .state('app.productEdit', {
                        url: '/product/edit/:_id',
                        templateUrl: 'views/modules/product/edit.html',
                        data: {title: 'Modificar Producto'},
                        controller: 'ProductEditCtrl',
                        resolve: load(['ui.select'])
                    })
                    .state('app.record', {
                        url: '/record',
                        templateUrl: 'views/modules/record/index.html',
                        data: {title: 'Muestras'},
                        controller: 'RecordCtrl',
                        resolve: load(['ui.select'])
                    })
                    .state('app.recordAdd', {
                        url: '/record/add/:product',
                        templateUrl: 'views/modules/record/edit.html',
                        data: {title: 'Nueva Muestra'},
                        controller: 'RecordAddCtrl',
                        resolve: load(['ui.select'])
                    })
                    .state('app.recordEdit', {
                        url: '/record/edit/:product/:_id',
                        templateUrl: 'views/modules/record/edit.html',
                        data: {title: 'Modificar Muestra'},
                        controller: 'RecordEditCtrl',
                        resolve: load(['ui.select'])
                    })
                    .state('app.recordImport', {
                        url: '/record/import/:product',
                        templateUrl: 'views/modules/record/import.html',
                        data: {title: 'Importar Muestras'},
                        controller: 'RecordImportCtrl',
                        resolve: load(['ui.select'])
                    })
                    .state('app.certificate', {
                        url: '/certificate',
                        templateUrl: 'views/modules/certificate/index.html',
                        data: {title: 'Certificados'},
                        controller: 'CertificateCtrl'
                    })
                    .state('print', {
                        url: '/print',
                        template: '<div class="bg-big"><div ui-view class="fade-in-down smooth"></div></div>'
                    })
                    .state('validateCertificate', {
                        url: '/validate/:verification/certificate/:id',
                        templateUrl: 'views/modules/certificate/validate.html',
                        controller: 'CertificateValidationCtrl'
                    })
                    .state('print.certificate', {
                        url: '/certificate/:id',
                        templateUrl: 'views/modules/certificate/print.html',
                        controller: 'CertificatePrintController'
                    })
                    .state('app.certificateAdd', {
                        url: '/certificate/add',
                        templateUrl: 'views/modules/certificate/edit.html',
                        data: {title: 'Nuevo Certificado de Calidad'},
                        controller: 'CertificateAddCtrl',
                        resolve: load(['ui.select'])
                    })
                    .state('app.external', {
                        url: '/external',
                        templateUrl: 'views/modules/external/index.html',
                        data: {title: 'Proveedores/Clientes'},
                        controller: 'ExternalCtrl'
                    })
                    .state('app.externalAdd', {
                        url: '/external/add',
                        templateUrl: 'views/modules/external/edit.html',
                        data: {title: 'Nuevo Cliente/Proveedor'},
                        controller: 'ExternalAddCtrl'
                    })
                    .state('app.externalEdit', {
                        url: '/external/edit/:_id',
                        templateUrl: 'views/modules/external/edit.html',
                        data: {title: 'Modificar Proveedor/Cliente'},
                        controller: 'ExternalEditCtrl',
                        resolve: load(['ui.select'])
                    })
                    .state('app.user', {
                        url: '/user',
                        templateUrl: 'views/modules/user/index.html',
                        data: {title: 'Usuarios'},
                        controller: 'UserCtrl'
                    })
                    .state('app.userAdd', {
                        url: '/user/add',
                        templateUrl: 'views/modules/user/edit.html',
                        data: {title: 'Nuevo Usuario'},
                        controller: 'UserAddCtrl'
                    })
                    .state('app.userEdit', {
                        url: '/user/edit/:_id',
                        templateUrl: 'views/modules/user/edit.html',
                        data: {title: 'Modificar Usuario'},
                        controller: 'UserEditCtrl',
                        resolve: load(['ui.select'])
                    })
                    .state('app.profile', {
                        url: '/profile',
                        templateUrl: 'views/modules/profile/index.html',
                        data: {title: 'Perfiles'},
                        controller: 'ProfileCtrl'
                    })
                    .state('app.profileAdd', {
                        url: '/profile/add',
                        templateUrl: 'views/modules/profile/edit.html',
                        data: {title: 'Nuevo Perfil'},
                        controller: 'ProfileAddCtrl'
                    })
                    .state('app.profileEdit', {
                        url: '/profile/edit/:_id',
                        templateUrl: 'views/modules/profile/edit.html',
                        data: {title: 'Modificar Perfil'},
                        controller: 'ProfileEditCtrl',
                        resolve: load(['ui.select'])
                    })
                    .state('app.analysis', {
                        url: '/analysis',
                        templateUrl: 'views/pages/dashboard.analysis.html',
                        data: {title: 'Analysis'},
                        resolve: load(['scripts/controllers/chart.js', 'scripts/controllers/vectormap.js'])
                    })
                    .state('app.wall', {
                        url: '/wall',
                        templateUrl: 'views/pages/dashboard.wall.html',
                        data: {title: 'Wall', folded: true}
                    })
                    .state('app.todo', {
                        url: '/todo',
                        templateUrl: 'apps/todo/todo.html',
                        data: {title: 'Todo', theme: {primary: 'indigo-800'}},
                        controller: 'TodoCtrl',
                        resolve: load('apps/todo/todo.js')
                    })
                    .state('app.todo.list', {
                        url: '/{fold}'
                    })
                    .state('app.note', {
                        url: '/note',
                        templateUrl: 'apps/note/main.html',
                        data: {theme: {primary: 'blue-grey'}}
                    })
                    .state('app.note.list', {
                        url: '/list',
                        templateUrl: 'apps/note/list.html',
                        data: {title: 'Note'},
                        controller: 'NoteCtrl',
                        resolve: load(['apps/note/note.js', 'moment'])
                    })
                    .state('app.note.item', {
                        url: '/{id}',
                        views: {
                            '': {
                                templateUrl: 'apps/note/item.html',
                                controller: 'NoteItemCtrl',
                                resolve: load(['apps/note/note.js', 'moment'])
                            },
                            'navbar@': {
                                templateUrl: 'apps/note/navbar.html',
                                controller: 'NoteItemCtrl'
                            }
                        },
                        data: {title: '', child: true}
                    })
                    .state('app.inbox', {
                        url: '/inbox',
                        templateUrl: 'apps/inbox/inbox.html',
                        data: {title: 'Inbox', folded: true},
                        resolve: load(['apps/inbox/inbox.js', 'moment'])
                    })
                    .state('app.inbox.list', {
                        url: '/inbox/{fold}',
                        templateUrl: 'apps/inbox/list.html'
                    })
                    .state('app.inbox.detail', {
                        url: '/{id:[0-9]{1,4}}',
                        templateUrl: 'apps/inbox/detail.html'
                    })
                    .state('app.inbox.compose', {
                        url: '/compose',
                        templateUrl: 'apps/inbox/new.html',
                        resolve: load(['textAngular', 'ui.select'])
                    })
                    .state('ui', {
                        url: '/ui',
                        abstract: true,
                        views: {
                            '': {
                                templateUrl: layout
                            },
                            'aside': {
                                templateUrl: aside
                            },
                            'content': {
                                templateUrl: content
                            }
                        }
                    })
                    // components router
                    .state('ui.component', {
                        url: '/component',
                        abstract: true,
                        template: '<div ui-view></div>'
                    })
                    .state('ui.component.arrow', {
                        url: '/arrow',
                        templateUrl: 'views/ui/component/arrow.html',
                        data: {title: 'Arrows'}
                    })
                    .state('ui.component.badge-label', {
                        url: '/badge-label',
                        templateUrl: 'views/ui/component/badge-label.html',
                        data: {title: 'Badges & Labels'}
                    })
                    .state('ui.component.button', {
                        url: '/button',
                        templateUrl: 'views/ui/component/button.html',
                        data: {title: 'Buttons'}
                    })
                    .state('ui.component.color', {
                        url: '/color',
                        templateUrl: 'views/ui/component/color.html',
                        data: {title: 'Colors'}
                    })
                    .state('ui.component.grid', {
                        url: '/grid',
                        templateUrl: 'views/ui/component/grid.html',
                        data: {title: 'Grids'}
                    })
                    .state('ui.component.icon', {
                        url: '/icons',
                        templateUrl: 'views/ui/component/icon.html',
                        data: {title: 'Icons'}
                    })
                    .state('ui.component.list', {
                        url: '/list',
                        templateUrl: 'views/ui/component/list.html',
                        data: {title: 'Lists'}
                    })
                    .state('ui.component.nav', {
                        url: '/nav',
                        templateUrl: 'views/ui/component/nav.html',
                        data: {title: 'Navs'}
                    })
                    .state('ui.component.progressbar', {
                        url: '/progressbar',
                        templateUrl: 'views/ui/component/progressbar.html',
                        data: {title: 'Progressbars'}
                    })
                    .state('ui.component.streamline', {
                        url: '/streamline',
                        templateUrl: 'views/ui/component/streamline.html',
                        data: {title: 'Streamlines'}
                    })
                    .state('ui.component.timeline', {
                        url: '/timeline',
                        templateUrl: 'views/ui/component/timeline.html',
                        data: {title: 'Timelines'}
                    })
                    .state('ui.component.uibootstrap', {
                        url: '/uibootstrap',
                        templateUrl: 'views/ui/component/uibootstrap.html',
                        resolve: load('scripts/controllers/bootstrap.js'),
                        data: {title: 'UI Bootstrap'}
                    })
                    // material routers
                    .state('ui.material', {
                        url: '/material',
                        template: '<div ui-view></div>',
                        resolve: load('scripts/controllers/material.js')
                    })
                    .state('ui.material.button', {
                        url: '/button',
                        templateUrl: 'views/ui/material/button.html',
                        data: {title: 'Buttons'}
                    })
                    .state('ui.material.color', {
                        url: '/color',
                        templateUrl: 'views/ui/material/color.html',
                        data: {title: 'Colors'}
                    })
                    .state('ui.material.icon', {
                        url: '/icon',
                        templateUrl: 'views/ui/material/icon.html',
                        data: {title: 'Icons'}
                    })
                    .state('ui.material.card', {
                        url: '/card',
                        templateUrl: 'views/ui/material/card.html',
                        data: {title: 'Card'}
                    })
                    .state('ui.material.form', {
                        url: '/form',
                        templateUrl: 'views/ui/material/form.html',
                        data: {title: 'Form'}
                    })
                    .state('ui.material.list', {
                        url: '/list',
                        templateUrl: 'views/ui/material/list.html',
                        data: {title: 'List'}
                    })
                    .state('ui.material.ngmaterial', {
                        url: '/ngmaterial',
                        templateUrl: 'views/ui/material/ngmaterial.html',
                        data: {title: 'NG Material'}
                    })
                    // form routers
                    .state('ui.form', {
                        url: '/form',
                        template: '<div ui-view></div>'
                    })
                    .state('ui.form.layout', {
                        url: '/layout',
                        templateUrl: 'views/ui/form/layout.html',
                        data: {title: 'Layouts'}
                    })
                    .state('ui.form.element', {
                        url: '/element',
                        templateUrl: 'views/ui/form/element.html',
                        data: {title: 'Elements'}
                    })
                    .state('ui.form.validation', {
                        url: '/validation',
                        templateUrl: 'views/ui/form/validation.html',
                        data: {title: 'Validations'}
                    })
                    .state('ui.form.select', {
                        url: '/select',
                        templateUrl: 'views/ui/form/select.html',
                        data: {title: 'Selects'},
                        controller: 'SelectCtrl',
                        resolve: load(['ui.select', 'scripts/controllers/select.js'])
                    })
                    .state('ui.form.editor', {
                        url: '/editor',
                        templateUrl: 'views/ui/form/editor.html',
                        data: {title: 'Editor'},
                        controller: 'EditorCtrl',
                        resolve: load(['textAngular', 'scripts/controllers/editor.js'])
                    })
                    .state('ui.form.slider', {
                        url: '/slider',
                        templateUrl: 'views/ui/form/slider.html',
                        data: {title: 'Slider'},
                        controller: 'SliderCtrl',
                        resolve: load('scripts/controllers/slider.js')
                    })
                    .state('ui.form.tree', {
                        url: '/tree',
                        templateUrl: 'views/ui/form/tree.html',
                        data: {title: 'Tree'},
                        controller: 'TreeCtrl',
                        resolve: load('scripts/controllers/tree.js')
                    })
                    .state('ui.form.file-upload', {
                        url: '/file-upload',
                        templateUrl: 'views/ui/form/file-upload.html',
                        data: {title: 'File upload'},
                        controller: 'UploadCtrl',
                        resolve: load(['angularFileUpload', 'scripts/controllers/upload.js'])
                    })
                    .state('ui.form.image-crop', {
                        url: '/image-crop',
                        templateUrl: 'views/ui/form/image-crop.html',
                        data: {title: 'Image Crop'},
                        controller: 'ImgCropCtrl',
                        resolve: load(['ngImgCrop', 'scripts/controllers/imgcrop.js'])
                    })
                    .state('ui.form.editable', {
                        url: '/editable',
                        templateUrl: 'views/ui/form/xeditable.html',
                        data: {title: 'Xeditable'},
                        controller: 'XeditableCtrl',
                        resolve: load(['xeditable', 'scripts/controllers/xeditable.js'])
                    })
                    // table routers
                    .state('ui.table', {
                        url: '/table',
                        template: '<div ui-view></div>'
                    })
                    .state('ui.table.static', {
                        url: '/static',
                        templateUrl: 'views/ui/table/static.html',
                        data: {title: 'Static', theme: {primary: 'blue'}}
                    })
                    .state('ui.table.smart', {
                        url: '/smart',
                        templateUrl: 'views/ui/table/smart.html',
                        data: {title: 'Smart'},
                        controller: 'TableCtrl',
                        resolve: load(['smart-table', 'scripts/controllers/table.js'])
                    })
                    .state('ui.table.datatable', {
                        url: '/datatable',
                        data: {title: 'Datatable'},
                        templateUrl: 'views/ui/table/datatable.html'
                    })
                    .state('ui.table.footable', {
                        url: '/footable',
                        data: {title: 'Footable'},
                        templateUrl: 'views/ui/table/footable.html'
                    })
                    .state('ui.table.nggrid', {
                        url: '/nggrid',
                        templateUrl: 'views/ui/table/nggrid.html',
                        data: {title: 'NG Grid'},
                        controller: 'NGGridCtrl',
                        resolve: load(['ngGrid', 'scripts/controllers/nggrid.js'])
                    })
                    .state('ui.table.uigrid', {
                        url: '/uigrid',
                        templateUrl: 'views/ui/table/uigrid.html',
                        data: {title: 'UI Grid'},
                        controller: "UiGridCtrl",
                        resolve: load(['ui.grid', 'scripts/controllers/uigrid.js'])
                    })
                    .state('ui.table.editable', {
                        url: '/editable',
                        templateUrl: 'views/ui/table/editable.html',
                        data: {title: 'Editable'},
                        controller: 'XeditableCtrl',
                        resolve: load(['xeditable', 'scripts/controllers/xeditable.js'])
                    })
                    // chart
                    .state('ui.chart', {
                        url: '/chart',
                        templateUrl: 'views/ui/chart/chart.html',
                        data: {title: 'Charts'},
                        resolve: load('scripts/controllers/chart.js')
                    })
                    // map routers
                    .state('ui.map', {
                        url: '/map',
                        template: '<div ui-view></div>'
                    })
                    .state('ui.map.google', {
                        url: '/google',
                        templateUrl: 'views/ui/map/google.html',
                        data: {title: 'Gmap'},
                        controller: 'GoogleMapCtrl',
                        resolve: load(['ui.map', 'scripts/controllers/load-google-maps.js', 'scripts/controllers/googlemap.js'], function () {
                            return loadGoogleMaps();
                        })
                    })
                    .state('ui.map.vector', {
                        url: '/vector',
                        templateUrl: 'views/ui/map/vector.html',
                        data: {title: 'Vector'},
                        controller: 'VectorMapCtrl',
                        resolve: load('scripts/controllers/vectormap.js')
                    })

                    .state('page', {
                        url: '/page',
                        views: {
                            '': {
                                templateUrl: layout
                            },
                            'aside': {
                                templateUrl: aside
                            },
                            'content': {
                                templateUrl: content
                            }
                        }
                    })
                    .state('page.profile', {
                        url: '/profile',
                        templateUrl: 'views/pages/profile.html',
                        data: {title: 'Profile', theme: {primary: 'green'}}
                    })
                    .state('page.settings', {
                        url: '/settings',
                        templateUrl: 'views/pages/settings.html',
                        data: {title: 'Settings'}
                    })
                    .state('page.blank', {
                        url: '/blank',
                        templateUrl: 'views/pages/blank.html',
                        data: {title: 'Blank'}
                    })
                    .state('page.document', {
                        url: '/document',
                        templateUrl: 'views/pages/document.html',
                        data: {title: 'Document'}
                    })
                    .state('404', {
                        url: '/404',
                        templateUrl: 'views/pages/404.html'
                    })
                    .state('505', {
                        url: '/505',
                        templateUrl: 'views/pages/505.html'
                    })
                    .state('access', {
                        url: '/access',
                        template: '<div class="bg-big"><div ui-view class="fade-in-down smooth"></div></div>'
                    })
                    .state('access.signin', {
                        url: '/signin',
                        templateUrl: 'views/pages/signin.html',
                        controller: 'AuthController',
                        params :{
                            message: ''
                        }
                    })
                    .state('access.signup', {
                        url: '/signup',
                        templateUrl: 'views/pages/signup.html'
                    })
                    .state('access.forgot-password', {
                        url: '/forgot-password',
                        controller: 'AuthController',
                        templateUrl: 'views/pages/forgot-password.html'
                    })
                    .state('access.lockme', {
                        url: '/lockme',
                        templateUrl: 'views/pages/lockme.html'
                    })
                ;


                function load(srcs, callback) {
                    return {
                        deps: ['$ocLazyLoad', '$q',
                            function ($ocLazyLoad, $q) {
                                var deferred = $q.defer();
                                var promise = false;
                                srcs = angular.isArray(srcs) ? srcs : srcs.split(/\s+/);
                                if (!promise) {
                                    promise = deferred.promise;
                                }
                                angular.forEach(srcs, function (src) {
                                    promise = promise.then(function () {
                                        angular.forEach(MODULE_CONFIG, function (module) {
                                            if (module.name == src) {
                                                if (!module.module) {
                                                    name = module.files;
                                                } else {
                                                    name = module.name;
                                                }
                                            } else {
                                                name = src;
                                            }
                                        });
                                        return $ocLazyLoad.load(name);
                                    });
                                });
                                deferred.resolve();
                                return callback ? promise.then(function () {
                                    return callback();
                                }) : promise;
                            }]
                    }
                }

                function getParams(name) {
                    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
                    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
                        results = regex.exec(location.search);
                    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
                }

            }
        ]
    );
