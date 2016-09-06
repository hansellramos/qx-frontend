angular
    .module('app')
    .factory('LoginService', ['$resource', 'APPLICATION', function ($resource, APPLICATION) {
        return $resource(APPLICATION.CONFIG.API.URL + APPLICATION.CONFIG.API.RESOURCES.AUTH + ':token'
            , {token: '@token'}, {
                login: {
                    method: 'POST'
                },
                logout: {
                    method: 'DELETE'
                },
                info: {
                    method: 'GET'
                }
            })
    }])
    .factory('SubsidiaryService', ['$resource', 'APPLICATION', function ($resource, APPLICATION) {
        return $resource(APPLICATION.CONFIG.API.URL + APPLICATION.CONFIG.API.RESOURCES.SUBSIDIARY + ':token/:id'
            , {token: '@token', id: '@id'}, { update: { method: 'PUT' }})
    }])
    .factory('StoreService', ['$resource', 'APPLICATION', function ($resource, APPLICATION) {
        return $resource(APPLICATION.CONFIG.API.URL + APPLICATION.CONFIG.API.RESOURCES.STORE + ':token/:id'
            , {token: '@token', id: '@id'}, { update: { method: 'PUT' }})
    }])
    .factory('ProductService', ['$resource', 'APPLICATION', function ($resource, APPLICATION) {
        return $resource(APPLICATION.CONFIG.API.URL + APPLICATION.CONFIG.API.RESOURCES.PRODUCT + ':token/:id'
            , {token: '@token', id: '@id'}, { update: { method: 'PUT' }})
    }])
    .factory('RecordService', ['$resource', 'APPLICATION', function ($resource, APPLICATION) {
        return $resource(APPLICATION.CONFIG.API.URL + APPLICATION.CONFIG.API.RESOURCES.RECORD + ':token/:product/:id'
            , {token: '@token', product:'@product', id: '@id'}, { update: { method: 'PUT' }})
    }])
    .factory('CertificateService', ['$resource', 'APPLICATION', function ($resource, APPLICATION) {
        return $resource(APPLICATION.CONFIG.API.URL + APPLICATION.CONFIG.API.RESOURCES.CERTIFICATE + ':token/:id'
            , {token: '@token', id: '@id'})
    }])
    .factory('ExternalService', ['$resource', 'APPLICATION', function ($resource, APPLICATION) {
        return $resource(APPLICATION.CONFIG.API.URL + APPLICATION.CONFIG.API.RESOURCES.EXTERNAL + ':token/:id'
            , {token: '@token', id: '@id'}, { update: { method: 'PUT' }})
    }])
    .factory('UserService', ['$resource', 'APPLICATION', function ($resource, APPLICATION) {
        return $resource(APPLICATION.CONFIG.API.URL + APPLICATION.CONFIG.API.RESOURCES.USER + ':token/:id'
            , {token: '@token', id: '@id'}, { update: { method: 'PUT' }})
    }])
    .factory('ProfileService', ['$resource', 'APPLICATION', function ($resource, APPLICATION) {
        return $resource(APPLICATION.CONFIG.API.URL + APPLICATION.CONFIG.API.RESOURCES.PROFILE + ':token/:id'
            , {token: '@token', id: '@id'}, { update: { method: 'PUT' }})
    }])
    .factory('LightService', ['$resource', 'APPLICATION', function ($resource, APPLICATION) {
        return $resource(APPLICATION.CONFIG.API.URL + APPLICATION.CONFIG.API.RESOURCES.LIGHT + ':token/:id'
            , {token: '@token', id: '@id'}, { update: { method: 'PUT' }})
    }])
    .factory('PermissionsService', ['$resource', 'APPLICATION', function ($resource, APPLICATION) {
        return $resource(APPLICATION.CONFIG.API.URL + APPLICATION.CONFIG.API.RESOURCES.PERMISSIONS + ':token/:id'
            , {token: '@token', id: '@id'})
    }])
    .factory('DueListFactory', function(){
        var $get = function(){
            return [
                {name:'1 Semana', value:1}
                , {name:'2 Semanas', value:2}
                , {name:'1 Mes', value:4}
                , {name:'2 Meses', value:8}
                , {name:'3 Meses', value:13}
                , {name:'4 Meses', value:17}
                , {name:'5 Meses', value:21}
                , {name:'6 Meses', value:26}
                , {name:'1 año', value:52}
                , {name:'2 años', value:104}
                , {name:'3 años', value:156}
                , {name:'4 años', value:208}
                , {name:'5 años', value:260}
                , {name:'6 años', value:312}
                , {name:'7 años', value:364}
                , {name:'8 años', value:416}
                , {name:'9 años', value:468}
                , {name:'10 años', value:520}
            ];
        }

        return {
            get: $get
        };
    })
    .factory('PropertyTypeFactory', function(){
        return {
            get: function(){
                return [
                    {name:'Texto', value:'text'}
                    , {name:'Boleano', value:'boolean'}
                    , {name:'Lista', value:'list'}
                    , {name:'Rango', value:'range'}
                ];
            }
        };
    })
;
