<?php
class Gear {
	var $chainring = 0;
	var $cog = 0;
	var $ratio = 0;
	var $use_count = 0;
	var $percent = 0;
	var $distance = 0;

	public function Gear($chainring, $cog) {
		$this->chainring = $chainring;
		$this->cog = $cog;
		$this->ratio = $chainring / $cog;
	}

	public function use_it($counts, $distance) {
		$this->distance += $distance;
		$this->percent = round(($this->use_count++ / $counts) * 100);
	}
}
?>