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
            , {token: '@token', id: '@id'})
    }])
    .factory('StoreService', ['$resource', 'APPLICATION', function ($resource, APPLICATION) {
        return $resource(APPLICATION.CONFIG.API.URL + APPLICATION.CONFIG.API.RESOURCES.STORE + ':token/:id'
            , {token: '@token', id: '@id'})
    }])
    .factory('ProductService', ['$resource', 'APPLICATION', function ($resource, APPLICATION) {
        return $resource(APPLICATION.CONFIG.API.URL + APPLICATION.CONFIG.API.RESOURCES.PRODUCT + ':token/:id'
            , {token: '@token', id: '@id'})
    }])
    .factory('RecordService', ['$resource', 'APPLICATION', function ($resource, APPLICATION) {
        return $resource(APPLICATION.CONFIG.API.URL + APPLICATION.CONFIG.API.RESOURCES.RECORD + ':token/:product/:id'
            , {token: '@token', product:'@product', id: '@id'})
    }])
    .factory('CertificateService', ['$resource', 'APPLICATION', function ($resource, APPLICATION) {
        return $resource(APPLICATION.CONFIG.API.URL + APPLICATION.CONFIG.API.RESOURCES.CERTIFICATE + ':token/:id'
            , {token: '@token', id: '@id'})
    }])
    .factory('ExternalService', ['$resource', 'APPLICATION', function ($resource, APPLICATION) {
        return $resource(APPLICATION.CONFIG.API.URL + APPLICATION.CONFIG.API.RESOURCES.EXTERNAL + ':token/:id'
            , {token: '@token', id: '@id'})
    }])
    .factory('UserService', ['$resource', 'APPLICATION', function ($resource, APPLICATION) {
        return $resource(APPLICATION.CONFIG.API.URL + APPLICATION.CONFIG.API.RESOURCES.USER + ':token/:id'
            , {token: '@token', id: '@id'})
    }])
    .factory('ProfileService', ['$resource', 'APPLICATION', function ($resource, APPLICATION) {
        return $resource(APPLICATION.CONFIG.API.URL + APPLICATION.CONFIG.API.RESOURCES.PROFILE + ':token/:id'
            , {token: '@token', id: '@id'})
    }])
;
