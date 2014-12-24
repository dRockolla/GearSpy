'use strict'

var gearSpyControllers = angular.module('gearSpyControllers', [])
	.run(['$anchorScroll', function($anchorScroll) {
		$anchorScroll.yOffset = 50;
}]);

gearSpyControllers.controller('ActivityListCtrl', ['$scope', 'ActivityList', '$location', function($scope, ActivityList, $location) {
		
	if (!$scope.activities) {
		ActivityList.get( function(data) {
			$scope.activities = data;
			//$scope.athlete = data.athlete;
			$scope.auth = true;
		});
		ActivityList.activities = $scope.activities;
	}
	
	$scope.getActivity = function(id) { 
		//$location.path("/activities/" + id)
		$scope.$parent.getActivity(id);
	}
}]);

gearSpyControllers.controller('ActivityCtrl', ['$scope', '$location', 'Activity', function($scope, $location, Activity) {
	Activity.get(function(data) {
		$scope.activityLoaded = true;
		$scope.activity = data.activity;
	});
	
	$scope.getActivity = function(id) {
		$scope.id = id;
		Activity.id = id;
		Activity.get(function(data) {
			$scope.activityLoaded = true;
			$scope.activity = data.activity;

		});
	}
}]);

gearSpyControllers.controller('UserCtrl', ['$scope', 'User', "$http", "$rootScope", "$location", function($scope, User, $http, $rootScope, $location) {
	if ($rootScope.athlete === undefined) {
			User.get(function(data) {
				$rootScope.athlete = data.athlete;
			});
	}
	
	$scope.logout = function() {
		$http.get("inc/GearSpy.php?action=logout").success(function(data) {
			//if (data.status == 401) {
				$scope.retUrl = data.retUrl;
				$rootScope.auth = false;
				$location.path("/");
			//}
		});
	}
}]);

gearSpyControllers.controller('GearCtrl', ['$scope', '$http', 'GearSpy', function($scope, $http, GearSpy) {
	$scope.wheel = 700;
	$scope.spd = 10;
	$scope.options = [
		{"text": "ratio", "value": "ratio"},
		{"text": "Percent Used", "value": "percent"},
		{"text": "gears", "value": "gears"}
	];
	$scope.mySort = $scope.options[0];
	$scope.showGearForm = false;
	
	$scope.selectSort = function() {
		GearSpy.reOrder($scope.mySort);
	};
	
	$scope.spy = function(id) {
		var params = {
				action: "spy",
				id: id,
				wheel: $scope.wheel,
				speed: $scope.spd,
				chainrings: $scope.chainrings,
				cassette: $scope.cassette
		}
		$http.post("inc/GearSpy.php?action=spy", params).success(function(data) {
			$scope.showGearForm = true;
			GearSpy.sort = $scope.mySort;
			GearSpy.dataset = data;
			$scope.chainrings = data.chainrings.toString();
			$scope.cassette = data.cassette.toString();
			GearSpy.plotSpdCadnc(data.points);
			GearSpy.plotGearPie(data.gears);
			GearSpy.plotClimbing(data.points)
		});
	};
	
	$scope.spyharder = function(id) {
		var params = {
				action: "spyharder",
				id: id,
				wheel: $scope.wheel,
				speed: $scope.spd,
				chainrings: $scope.chainrings,
				cassette: $scope.cassette
		}
		$http.post("inc/GearSpy.php?action=spyharder", params).success(function(data) {
			$scope.showGearForm = true;
			GearSpy.sort = $scope.mySort;
			GearSpy.dataset = data;
			$scope.chainrings = data.chainrings.toString();
			$scope.cassette = data.cassette.toString();
			GearSpy.plotSpdCadnc(data.points);
			GearSpy.plotGearPie(data.gears);
			//GearSpy.plotClimbing(data.points)
		});
	};

	//$scope.pattern = /^\d\d$|^\d\d\s/;
	//$scope.chainrings = "50 34";
	//$scope.cassette = "12 13 14 15 16 17 19 21 24 27";
}]);

gearSpyControllers.controller('HomeCtrl', ['$scope', '$http', '$location', '$rootScope', function($scope, $http, $location, $rootScope) {
	//angular.element(document).ready(function() {
		var q = (window.location.search) ? window.location.search + "&" : "?";
		$http.get("inc/GearSpy.php" + q + "action=auth").success(function(data) {
			if (data.status == 200) {
				if (window.location.search.match("code=")) window.location = "/"
				$rootScope.auth = true;
				$rootScope.athlete = data.athlete;
			} else {
				$scope.retUrl = data.retUrl;
				$rootScope.auth = false;
				delete $rootScope.athlete;
			}
		})
		.error(function() {
			//console.log("Unable to contact server");
		});
		
		$scope.logout = function() {
			$http.get("inc/GearSpy.php?action=logout").success(function(data) {
				//if (data.status == 401) {
					$scope.retUrl = data.retUrl;
					$rootScope.auth = false;
					delete $rootScope.athlete;
				//}
			});
		}
		
	//});
}]);