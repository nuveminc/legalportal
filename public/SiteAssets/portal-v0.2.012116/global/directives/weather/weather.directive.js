/* WEATHER WIDGET DIRECTIVE */
LegalPortal.directive('weatherWidget', ['$http', 'authorization', 'BASE_PATH', 'PORTLET', function ($http, authorization, BASE_PATH, PORTLET) {
    return {
        restrict: 'A',
        templateUrl: BASE_PATH.globalDirectivesUrl + 'weather/weather.template.html',
        link: function(scope,element,attributes){
            $http({
              url : 'https://api.wunderground.com/api/64e1e8b6125c1705/geolookup/conditions/q/IA/{0}.json'.format(PORTLET.weatherCity),
              dataType : 'jsonp',
              method: 'GET'
            }).then(function(response) {
              scope.location = response.data.location.city;
              scope.weather = '{0}, {1}'.format(PORTLET.weatherCity, response.data.current_observation.weather);
              scope.temp_f = response.data.current_observation.temp_f;
              scope.icon = response.data.current_observation.icon;
              scope.icon_url = response.data.current_observation.icon_url;
              //scope.weatherString = scope.temp_f+'&degF, '+scope.weather+', '+scope.location;
              //element.html();
            }, function(){
                // error
            });
        }
       
    };
}]);