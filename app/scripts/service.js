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
;