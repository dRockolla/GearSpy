<?php

class Drive_Train {
	
	static $ten_spd_cassettes = array(
			[11, 12, 13, 14, 15, 16, 17, 19, 21, 23],
			[11, 12, 13, 14, 15, 17, 19, 21, 23, 25],
			[11, 12, 13, 14, 15, 17, 19, 21, 23, 26],
			[11, 12, 13, 14, 15, 17, 19, 22, 25, 28],
			//[11, 12, 13, 14, 16, 18, 21, 24, 28, 32],
			//[11, 12, 14, 16, 18, 21, 24, 28, 32, 36],
			[12, 13, 14, 15, 16, 17, 19, 21, 23, 25],
			[12, 13, 14, 15, 16, 17, 19, 21, 23, 26],
			[12, 13 ,14, 15, 16, 17, 19, 21, 24, 27],
			[12, 13, 14, 15, 16, 17, 19, 22, 25, 28],
			//[12, 13, 14, 15, 17, 19, 22, 25, 28, 32],
			//[12, 13, 15, 17, 19, 22, 25, 28, 32, 36]
	);

	static $eleven_spd_cassettes = array(
			[11,12,13,14,15,16,17,19,21,23,25],
			[11,12,13,14,15,16,17,19,21,23,26],
			[11,12,13,14,15,16,17,19,22,25,28]
			//[11,12,13,14,15,17,19,22,25,28,32],
			//[11,12,13,14,15,17,19,21,24,27,30]
	);
	static $cranksets = array(
			//[46, 36],
			[50, 34],
			[50, 36],
			//[52, 36],
			[53, 39],
			[53, 42]
	);

	private static function combine_gears() {
		$retArr = array();
		foreach (self::$cranksets as $cr) {
			if (self::$speed == 10 ) {
				foreach (self::$ten_spd_cassettes as $c) {
					array_push($retArr, [$cr, $c]);
				}
			}
			if (self::$speed == 11 ) {
				foreach (self::$eleven_spd_cassettes as $c) {
					array_push($retArr, [$cr, $c]);
				}
			}
		}
		return $retArr;
	}

	static $speed = 10;
	static $wheel = 700;
	//static $development = 2096; // my bike 700c x 25c as rolled out
	static $development = 2105; // my bike 700c x 25c from cateye chart
	static $MINUTES_PER_HOUR = 60;
	var $chainrings = array();
	var $cassette = array();
	var $gears = array();
	var $previous_gear = NULL;
	var $count = 0;
	var $distance = 0;
	var $previous_distance = 0;

	public function Drive_Train($chainrings, $cassette) {
		$this->chainrings = $chainrings;
		$this->cassette = $cassette;
		foreach ( $chainrings as $chainring ) {
			foreach ( $cassette as $cog ) {
				array_push($this->gears, new Gear($chainring, $cog));
			}
		}

		usort($this->gears, function($a, $b) {
			if ($a->ratio < $b->ratio) return -1;
			if ($a->ratio > $b->ratio) return +1;
			return 0;
		});
	}

	public static function generate_slopes($chainrings, $cassette) {
		$slopes = array();
		foreach ( $chainrings as $chainring ) {
			foreach ( $cassette as $cog ) {
				array_push($slopes, Drive_Train::generate_slope($chainring, $cog) );
			}
		}
		sort($slopes);
		return $slopes;
	}

	public static function generate_slope($chainring, $cog) {
		$multiplier = (1000 * 1000) / self::$MINUTES_PER_HOUR;
		return $multiplier / (($chainring / $cog) * self::$development);
	}

	private static function calculate_cost($X, $slopes, $index) {
		$groupings = array_fill_keys($slopes, array());
		$sqrErr = 0;

		$sqrErrFun = function($v) {
			return pow( $v, 2);
		};

		foreach($X as $point) {
			$closest = (string)self::get_closest_value($point->slope, $slopes);
			/*
				As cadence and speed approach 0, the sloped of the ratios converge at the origin making it more likely that
				the error variance of GPS and cadence data will be cause the resulting point to be closer to an incorrect
				ratio.
				
				For now we exclude cadences below 40 and speeds below 5 to prevent them from possibly indicating an incorrect ratio.
				Though I believe 40 rpm is a really slow cadence, and few that have a cadence meter and take the time
				to upload data to Strava would pedal that slowly, I may want to change that to a percentage of the average cadence,
				or something other to account for a ride where most of the time is in very low cadence. I spent a lot of time below
			*/
			if ( $point->slope && $point->cadence > 40 && $point->speed > 5) {
				array_push($groupings[$closest], $point->slope);
			}
		}
		foreach ($groupings as $key => $value) {
			//error_log("square of 2: " . pow(2, 2));
			if (array_sum($value) > 0 && count($value) > 0) {
				sort($value);
				$mean = array_sum($value) / count($value);
				$sqrs = array_map(
						function($a) use ($mean) {
							return pow( ($a - $mean), 2);
						},
						$value
				);
				
				//$sqrErr += sqrt(array_sum($sqrs) / count($sqrs));
				error_log("slope: " . $key . " max: " . max($value) . ", min: " . min($value) . ", count: " . count($value));// . " slopes: " . json_encode($value));
				//error_log("avg: " . $key . ", sqrErr: " . sqrt(array_sum($sqrs) / count($sqrs)) . ", summed: " . $sqrErr);

				$sqrErr += pow(((array_sum($value) / count($value)) - $key), 2);
				//$sqrErr += abs(((array_sum($value) / count($value)) - $key));
				//error_log("avg: " . $key . " ~= " . (array_sum($value) / count($value)) . ", sqrErr: " . pow(((array_sum($value) / count($value)) - $key), 2) . ", summed: " . $sqrErr);
			}
			//}
		}
		//error_log("json: " . json_encode($groupings));
		//$maxKey = array_keys($groupings, max($groupings))[0];
		//if (in_array($index, [8, 34])) error_log("er i am jh: maxKey: " . $maxKey . " & " . json_encode($groupings));
		//error_log("sqrErr: $sqrErr");
		return $sqrErr;
	}

	public static function detect($points) {
		error_log("in Drive_Train::detect()");
		$possible_gears = Drive_Train::combine_gears();
		/*$possible_gears = [
			[[50, 34], [12, 13 ,14, 15, 16, 17, 19, 21, 24, 27]],
			//[[53, 39], [12, 13, 14, 15, 17, 19, 22, 25, 28, 32]]
		];*/
		
		$costs = array();
		$i = 0;
		foreach ($possible_gears as $gears) {
			$cost = self::calculate_cost($points, self::generate_slopes($gears[0], $gears[1]), $i);
			error_log($i++ . " ) cost: " . $cost);
			array_push($costs, $cost);
		}
		$selected_index = array_keys($costs, min($costs))[0];
		//error_log("selected_index: $selected_index");
		$detected_gears = $possible_gears[$selected_index];

		return new Drive_Train($detected_gears[0], $detected_gears[1]);
	}

	public function get_gear($point) {
		$gear = null;
		$distanceSinceLast = 0;

		$gear = self::get_closest($point, $this->gears, "ratio");

		if ($this->previous_gear != NULL) {
			if (
					( $point->ratio > ($this->gears[count($this->gears) - 1]->ratio * 1.05) || $point->ratio == 0)
			 	//|| ( ($gear->chainring != $this->previous_gear->chainring) && ($gear->cog != $this->previous_gear->cog) )
			) { // coasting,
				$gear = $this->previous_gear;
			}
		}
		$distanceSinceLast = $point->distance - $this->previous_distance;

		$this->previous_distance = $point->distance;

		$this->previous_gear = $gear;
		$gear->use_it($this->count, $distanceSinceLast);
		return $gear;
	}

	private static function get_closest_value($point, $arr) {
		$closest = null;
		foreach($arr as $item) {
			if($closest == null || abs($point - $closest) > abs($item - $point)) {
				$closest = $item;
			} else break; // we can do this because I know the array is already sorted
		}
		return $closest;
	}

	private static function binarySearch($array, $crit, $left, $right) {
		if($right > $left) {
			if(pow(($array[$right]-$crit), 2) > pow(($crit-$array[$left]), 2)) {
				return $array[$left];
			} else {
				return $array[$right];
			}
		} else {
			$mid=floor(($left+$right)/2);
			if($array[$mid]==$crit) {
				return $crit;
			} elseif($crit<$array[$mid]) {
				return binarySearch($array, $crit, $left, $mid-1);
			} else {
				return binarySearch($array, $crit, $mid+1, $right);
			}
		}
	}

	/*
		$point: Object of any kind
		$arr: array of those Objects must be sorted already
		$property: name of property to compare
	*/
	private static function get_closest($point, $arr, $property) {
		$closest = null;
		foreach ($arr as $item) {
			if ($closest == null || abs( $point->{$property} - $closest->{$property} ) > abs( $item->{$property} - $point->{$property} )) {
				$closest = $item;
			} else break;
		}
		return $closest;
	}

	public static function ratio_from_speed_cadence($kph, $cadence) {
		/*
			FORMULA - "easy" calculation.
			
			Speed / development = (distance/time)/(distance/revolution) = (distance/time)*(rev/distance) = rev/time
			development = gear ratio * wheel circumference
			gear ratio =  # of cog teeth / # of chainring teeth
			
			cadence * development / speed = gear ratio
		*/
		$ratio = ($cadence == 0 ) ? 0 : round(((($kph * 1000 * 1000) / self::$MINUTES_PER_HOUR) / ($cadence * self::$development)), 2);
		return $ratio;
	}

	public static function mps_kph($mps) {
		$kph = ($mps * 60 * 60) / 1000;
		return $kph;
	}

	public static function kph_mph($kph) {
		$mph = $kph * 0.621371;
		return $mph;
	}

	public function calculate_percentages() {
		foreach ($this->gears as $gear) {
			//$gear->percent = round(($gear->use_count / $this->count) * 100);
			//error_log($gear->chainring . " x " . $gear->cog . " - " . $gear->use_count . " / " . $this->count . " = " . $gear->percent);
			$gear->percent = round(($gear->distance / $this->distance) * 100, 2);
			//error_log($gear->chainring . " x " . $gear->cog . " - " . $gear->distance . " / " . $this->distance . " = " . $gear->percent);
		}
	}


}
?>