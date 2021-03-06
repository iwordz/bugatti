/*global define, angular */

'use strict';

requirejs.config({
    urlArgs: "bust=" + app_version,
    paths: {
        "ace": webjars.path('ace', 'src-min-noconflict/ace'),
        "ext-language-tools": webjars.path('ace', 'src-min-noconflict/ext-language_tools'),
        "angular-ui-ace" : webjars.path('angular-ui-ace', 'ui-ace'),
        "angular-ui-tree": webjars.path('angular-ui-tree', 'angular-ui-tree'),
        "angular-loading-bar": webjars.path('angular-loading-bar', 'loading-bar'),
        "angular-growl": webjars.path('angular-growl', 'angular-growl'),
        "angular-chosen": webjars.path('angular-chosen', 'chosen'),
        "chosen": webjars.path('chosen', 'chosen.jquery.min'),
        "bindonce": webjars.path('bindonce', 'bindonce'),
        'icon-identicon': './directive/icon-identicon',
        'identicon-canvas': './thirdparty/identicon-canvas'
    },
    shim: {
        "angular-ui-ace": [ "angular", "ace"],
        "angular-ui-tree": [ "angular"],
        "ext-language-tools": ['ace'],
        "angular-loading-bar": [ "angular"],
        "angular-growl": [ "angular"],
        "chosen": [ "jquery"],
        "angular-chosen": [ "angular", "chosen"],
        "bindonce": [ "angular"],
        "icon-identicon": ["angular"]
    }
});

require(['jquery', 'angular', 'chosen', './controller/main-controller', './directive/main-directive', './filter/main-filter', './service/main-service', './routes/main-routes',
        'angular-ui-router', 'angular-loading-bar', 'angular-animate',
        'ui-bootstrap-tpls', 'angular-sanitize', 'angular-cookies', 'angular-ui-ace',
        'angular-growl', 'angular-chosen', 'bindonce',
        'angular-ui-tree', 'ext-language-tools',
        './thirdparty/angular-file-upload', 'angular-file-upload-shim', 'icon-identicon'],
    function($, angular) {

        // Declare app level module which depends on filters, and services
        var module = angular.module('bugattiApp', [
            'ui.router',
            'ui.ace',
            'ui.bootstrap',
            'ui.tree',
            'ngSanitize',
            'angular-loading-bar',
            'ngAnimate',
            'ngCookies',
            'angular-growl',
            'localytics.directives',
            'pasvaz.bindonce',
            'bugattiApp.routes',
            'bugattiApp.filters',
            'bugattiApp.directives',
            'bugattiApp.services',
            'bugattiApp.controllers',
            'icon-identicon'
            ]);

        module.run(['$rootScope', '$state', '$stateParams', 'Auth', function($rootScope,   $state,   $stateParams, Auth) {
                $rootScope.$state = $state;
                $rootScope.$stateParams = $stateParams;

                $rootScope.app = {breadcrumb: ''};

                $rootScope.$on("$stateChangeStart", function (event, toState) {
                    Auth.ping(function() {
                        if (toState.data.access === 'anon') {
                            return
                        }
                        if (!Auth.authorize(toState.data.access)) {
                            event.preventDefault();
                            $state.go('login');
                        }
                    }, function() {
                        if (toState.data.access === 'anon') {
                            return
                        }
                        event.preventDefault();
                        $state.go('login');
                        $rootScope.error = "Unauthorized";
                    });
                });

            }]);

        module.config(["growlProvider", "$httpProvider", function(growlProvider, $httpProvider) {
            growlProvider.globalTimeToLive(3000);

            var interceptor = ["$rootScope", "$q", "growl", function($rootScope, $q, growl) {
                return function(promise) {
                    return promise.then(
                        function(response) {
                            return response;
                        },
                        function(response) { // error
                            if (response.status == 400) {
                                growl.addWarnMessage("校验错误");
                            } else if (response.status == 403) {
                                growl.addWarnMessage("没有权限");
                            } else if (response.status == 404) {
                                growl.addWarnMessage("资源不存在");
                            } else if (response.status == 409) {
                                growl.addWarnMessage("资源已存在");
                            }  else if (response.status == 423) {
                                growl.addWarnMessage("资源已锁定");
                            } else if (response.status == 500) {
                                growl.addErrorMessage("内部错误");
                            }
                            return $q.reject(response);
                        }
                    );
                };
            }];
            $httpProvider.responseInterceptors.push(interceptor);
        }]);

        angular.bootstrap(document, ['bugattiApp']);

    });