<?php
class Ride_Point_Processor {

	public static function fillGaps($points) {
		$newPoints = array();
		error_log("in fillGaps, count: " . count($points));
		for ($i = 1; $i < count($points); $i++) {
			$previous = $points[$i - 1];
			$current = $points[$i];

			array_push($newPoints, $previous);

			$seconds = $current->time - $previous->time;
			//error_log("seconds: " . $seconds);

			if ($seconds > 1 && $seconds <= 50) {
				$deltaSpeed = ($current->speed - $previous->speed) / $seconds;
				$deltaCadence = ($current->cadence - $previous->cadence) / $seconds;
				$deltaDistance = ($current->distance - $previous->distance) / $seconds;
				$deltaAltitude = ($current->altitude - $previous->altitude) / $seconds;

				for ($j = 0; $j < $seconds; $j++) {
					$newPoint = $previous->replicate();

					$newPoint->time += ($j + 1);
					$newPoint->speed += ($j + 1) * $deltaSpeed;
					$newPoint->cadence += ($j + 1) * $deltaCadence;
					$newPoint->distance += ($j + 1) * $deltaDistance;
					$newPoint->altitude += ($j + 1) * $deltaAltitude;

					if ($newPoint->cadence < 0) {
						$newPoint->cadence = 0;
					}

					array_push($newPoints, $newPoint);
				}
			}
			//if ($i == (count($points) - 1)) {
			//	array_push($newPoints, $current);
			//}
		}
		error_log("ending fillGaps, count: " . count($newPoints));

		return $newPoints;
	}
}
?>