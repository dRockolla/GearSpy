<?php
class Ride_Point {
	var $altitude;
	var $cadence;
	var $distance;
	var $gear;
	var $ratio;
	var $speed;
	var $time;
	var $slope;

	public function Ride_Point($properties) {
		$this->altitude = $properties['altitude'];
		$this->cadence = $properties['cadence'];
		$this->distance = $properties['distance'];
		$this->gear = (isset($properties['gear'])) ? $properties['gear'] : null;
		$this->ratio = $properties['ratio'];
		$this->speed = $properties['speed'];
		$this->time = $properties['time'];
		$this->slope = $properties['slope'];
	}

	public function replicate() {
		return new Ride_Point(array(
				"time"		=> $point->time,
				"speed"		=> $point->speed,
				"cadence"	=> $point->cadence,
				"distance"	=> $point->distance,
				"altitude"	=> $point->altitude,
				"slope"		=> $point->slope,
				"ratio"		=> $point->ratio
		)
		);
	}
}
?>