<?php

class Moving_Average {
	
	public static function ahrens (
			$input_data,	// data to be smoothed
			$period,		// smoothing window
			$x_end) {		// end of input data
	
		//--------------------------------------------------------------
		// create the output array
	
		$avg = array();
	
		//--------------------------------------------------------------
		// the AMA may be used to smooth raw data or the output of
		// other calculations. since other calculations may introduce
		// significant phase lag so there is no guarantee that the
		// input data will actually start at the beginning of the
		// array passed to this function. this loop searches for the
		// first actual datapoint in the input series.
	
		$x_start = 1;
		for ($a = $x_start; $a <= $x_end; $a++) {
			if (isset($input_data[$a]) && is_numeric($input_data[$a])) {
				$x_start = $a;
				break;
			}
		}
	
		//--------------------------------------------------------------
		// the first raw data point in a series may be (significantly)
		// divergent from the data that follows. this loop creates a
		// reasonably representative set of initial values to seed the
		// average.  it uses an "expanding period" simple moving average
		// over the first N samples (where N equals the period of the
		// average)
	
		$count = 0;
		$total = 0;
		for ($a = $x_start; $a < $x_start + $period && $a <= $x_end; $a++) {
			$count++;
			$total += $input_data[$a];
			$avg[$a] = $total / $count;
		}
	
		//--------------------------------------------------------------
		// once the seed values have been calculated, shift gears and
		// calculate the AMA for $x_start + $period through $x_end
	
		for ($a = $x_start + $period; $a <= $x_end; $a++) {
			$numerator = $input_data[$a] - ($avg[$a-1] + $avg[$a-$period]) / 2;
			$avg[$a]   = $avg[$a-1] + $numerator / $period;
		}
	
		return $avg;
	}

}
?>