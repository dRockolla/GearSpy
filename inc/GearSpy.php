<?php

require_once('Secret.php');
require_once('Deploy.php');
require_once('StravaApi.php');
require_once('Ride_Point.php');
require_once('Ride_Point_Processor.php');
require_once('Gear.php');
require_once('Drive_Train.php');
require_once('Moving_Average.php');

$strava = new StravaApi( CLIENT_ID, CLIENT_SECRET );
$code = null;
$accessToken = null;
$authLink = "";
$types = array();

session_start();

//$response = $strava->deauthorize( $accessToken );
//session_unset();
//session_destroy();

if ( isset($_GET['action']) ) {
	$action = $_GET['action'];
	$accessToken = $_SESSION['accessToken'];
	$code = (isset($_GET['code'])) ? $_GET['code'] : null;
	switch ($action) {
		case "auth":
			echo auth($strava, $code);
			die();
			break;
		case "initui":
			echo initUi($strava, $accessToken);

			die();
			break;
		case "connect":
			break;
		case "loadride":
			echo loadride($_GET['id'], $strava, $accessToken);
			die();
			break;
		case "activity":
			echo load_activity($_GET['id'], $strava, $accessToken);
			die();
			break;
		case "spy":
			$data = json_decode(file_get_contents("php://input"));
			echo spy($data, $strava, $accessToken);
			die();
			break;
		case "spyharder":
			$data = json_decode(file_get_contents("php://input"));
			echo spy_harder($data, $strava, $accessToken);
			die();
			break;
		case "logout":
			echo logout($strava, $accessToken);
			die();
			break;
	}

}

function auth($strava, $code) {
	if ( $code ) {
		$response = $strava->tokenExchange( $code );
		$_SESSION['accessToken'] = $response->access_token;
		$_SESSION['athlete'] = $response->athlete;
	}	
	if (!isset($_SESSION['accessToken'])) {
		$retUrl = $strava->authenticationUrl(RETURN_URL);
		//error_log($retUrl);
		return json_encode(array("status" => "401", "retUrl" => $retUrl));
	} else {
		if ( !isset($_SESSION['athlete']) ) $_SESSION['athlete'] = $strava->get( 'athlete', $_SESSION['accessToken'] );
		$athlete = $_SESSION['athlete'];
		return json_encode(array("status" => "200", "athlete" => $athlete));
	}
}

function logout($strava, $accessToken) {
	$retUrl = $strava->authenticationUrl(RETURN_URL);
	if ($accessToken) {
		$response = $strava->deauthorize( $accessToken );
		if ($response && $response->access_token == $accessToken) {
			session_unset();
			session_destroy();
			return json_encode(array("status" => "401", "retUrl" => $retUrl));
		} else {
			return json_encode(array("status" => "200", "retUrl" => $retUrl));
		}
	} else {
		return json_encode(array("status" => "200", "retUrl" => $retUrl));
	}
}

function initUi($strava, $accessToken) {
	if ( !isset($_SESSION['athlete']) ) $_SESSION['athlete'] = $strava->get( 'athlete', $accessToken );
	$athlete =  $_SESSION['athlete'];  //$strava->get( 'athlete', $accessToken );
	$activities = $strava->get( 'activities', $accessToken );
	foreach ($activities as $activity) {
		$activity->distance = ($athlete->measurement_preference == "feet") ? number_format($activity->distance / 1609.344, 1) . " miles" : number_format($activity->distance / 1000, 1) . " kilometers" ;
		$activity->total_elevation_gain = ($athlete->measurement_preference == "feet") ? number_format($activity->total_elevation_gain * 3.28084) . " ft": $activity->total_elevation_gain . " m";
	}
	//usort($activities, function($a, $b) {
	//	return $b->distance - $a->distance;
	//});
	//error_log($activities[0]->id . " & " . $activities[1]->id . " & " . $activities[2]->id);
	$_SESSION['ref_activities'] = [$activities[0]->id, $activities[floor(count($activities) / 2)]->id, $activities[count($activities) - 1]->id];
	
	return json_encode(array("activities" => $activities, "athlete" => $athlete));
}

function loadActivities($strava, $accessToken) {
	$activities = $strava->get( 'activities', $accessToken );
	$athlete =  $_SESSION['athlete'];  //$strava->get( 'athlete', $accessToken );
	foreach ($activities as $activity) {
		$activity->distance = ($athlete->measurement_preference == "feet") ? number_format($activity->distance / 1609.344, 1) . " miles" : number_format($activity->distance / 1000, 1) . " kilometers" ;
		$activity->total_elevation_gain = ($athlete->measurement_preference == "feet") ? number_format($activity->total_elevation_gain * 3.28084) . " ft": $activity->total_elevation_gain . " m";
	}
	return json_encode(array("activities" => $activities));
}

function loadride($id, $strava, $accessToken) {
	$activity = $strava->get( 'activities/' . $id, $accessToken );
	$activity_stream = $strava->get( 'activities/' . $id . '/streams/velocity_smooth,cadence,time,altitude/', $accessToken );
	$types = array();
	if ( empty($activity_stream) ) {
		error_log("Activity stream not returned");
	} else {
		error_log("Activity stream returned");
	}

	for ($i = 0; $i < count($activity_stream); $i++) {
		$types[$activity_stream[$i]->type] = $i;
		//error_log("Activity stream: activity[" . $types["cadence"] . "] = " . $activity_stream[$types["cadence"]]->type);
	}
	return process_activity_stream( $activity_stream, $types, $activity );
}

function spy($data, $strava, $accessToken) {
	$activity_stream = $strava->get( 'activities/' . $data->id . '/streams/velocity_smooth,cadence,time,altitude/', $accessToken );
	$types = array();
	if ( empty($activity_stream) ) {
		error_log("Activity stream not returned");
	} else {
		error_log("Activity stream returned");
	}
	
	error_log("Number of streams: " . count($activity_stream) . " & type: " . $activity_stream->data[0]);
	for ($i = 0; $i < count($activity_stream); $i++) {
		$types[$activity_stream[$i]->type] = $i;
		//error_log("Activity stream: activity[" . $types["cadence"] . "] = " . $activity_stream[$types["cadence"]]->type);
	}
	return process_activity_stream( $activity_stream, $types, $data);
}

function spy_harder($data, $strava, $accessToken) {
	$activity_stream = [];
	$ref_activities = $_SESSION['ref_activities'];
	error_log("ref_activities: " . count($ref_activities));
	foreach ($ref_activities as $activity) {
		array_push($activity_stream, $strava->get( 'activities/' . $activity->id . '/streams/velocity_smooth,cadence,time,altitude/', $accessToken ));
	}
	
	$types = array();
	if ( empty($activity_stream) ) {
		error_log("Activity stream not returned");
	} else {
		error_log("Activity stream returned");
	}

	error_log("Number of streams: " . count($activity_stream) . " & type: " . $activity_stream->data[0]);
	for ($i = 0; $i < count($activity_stream); $i++) {
		$types[$activity_stream[$i]->type] = $i;
		//error_log("Activity stream: activity[" . $types["cadence"] . "] = " . $activity_stream[$types["cadence"]]->type);
	}
	return process_activity_stream( $activity_stream, $types, $data);
}

function load_activity($id, $strava, $accessToken) {
	//error_log("in load_activity: " . $id);
	$activity = $strava->get( 'activities/' . $id, $accessToken );
	return json_encode(array("activity" => $activity));
}

function process_activity_stream( $activity_stream, $types, $users_data) {
	//error_log(json_encode($users_data));
	$timer_start = microtime(true);
	$data_points = array();
	$id = 0;
	$counter = array();
	$athlete =  $_SESSION['athlete'];

	$rough_ratios = array();
	$gps_points = array();
	
	Drive_Train::$speed = $users_data->speed;

	//$file = fopen("speed_vs_cadence.csv","w");

	for ($i = 0; $i < count($activity_stream[0]->data); $i++) {
		$mps = $activity_stream[$types["velocity_smooth"]]->data[$i]; // = velocity in meters / second
		$kph = Drive_Train::mps_kph($mps);
			
		$point = new Ride_Point(array(
				"time"		=> $activity_stream[$types["time"]]->data[$i],
				"speed"		=> $kph,
				"cadence"	=> $activity_stream[$types["cadence"]]->data[$i], // = cadence in RPM
				"altitude"	=> $activity_stream[$types["altitude"]]->data[$i],
				"distance"	=> $activity_stream[$types["distance"]]->data[$i],
				"ratio"		=> Drive_Train::ratio_from_speed_cadence($kph, $activity_stream[$types["cadence"]]->data[$i]),
				"slope"		=> ($kph == 0) ? 0 : ($activity_stream[$types["cadence"]]->data[$i] / $kph)
			)
		);
			
		//error_log("time: " . $point->time . ", and distance: " . $point->distance);
			
		array_push($gps_points, $point);
		array_push($rough_ratios, $point->ratio);
		//array_push($rough_slopes, $point->slope);
			
		//fwrite($file, $point->speed . ", " . $point->cadence . "\n");
	}

		//fclose($file);
		$smooth_ratios = Moving_Average::ahrens($rough_ratios, 4, (count($rough_ratios) - 1) );
		//error_log("points[1]: " . $gps_points[1]->ratio . ", smooth[1]:" . $smooth_ratios[1]);
		$smooth_ratios[0] = $gps_points[0]->ratio;
		if (false) {
			for ($i = 0; $i < count($gps_points); $i++) {
				$gps_points[$i]->ratio = ($smooth_ratios[$i] > 0) ? $smooth_ratios[$i] : 0 ;
			}
		}

		$dt = null;
		if (isset($users_data->chainrings) && isset($users_data->cassette)) {
			$dt = new Drive_Train(preg_split("/[\s,]/", $users_data->chainrings), preg_split("/[\s,]/", $users_data->cassette));
		} else {
			$dt = Drive_Train::detect($gps_points);
		}

		$full_points = $gps_points;

		//$full_points = Ride_Point_Processor::fillGaps($gps_points);

		$dt->count = count($full_points);

		foreach ($full_points as $point) {
			$data_point = array(
				'speed'		=> ($athlete->measurement_preference == "feet") ? $dt->kph_mph($point->speed) : $point->speed,
				'cadence'	=> $point->cadence,
				'ratio'		=> $point->ratio,
				'gear'		=> $dt->get_gear($point),
				'altitude'	=> $point->altitude,
				'distance'	=> $point->distance
			);
			array_push($data_points, $data_point);
		}

		$dt->distance = $gps_points[count($gps_points) - 1]->distance - $gps_points[0]->distance;
		$dt->calculate_percentages();
		$timer_end = microtime(true);
		error_log("Time to detect, assign and return gears: " . ($timer_end - $timer_start));
		return json_encode(array('gears' => $dt->gears, 'points' => $data_points, 'chainrings' => $dt->chainrings, 'cassette' => $dt->cassette));
}

?>