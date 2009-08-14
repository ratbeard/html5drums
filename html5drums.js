/*
 * HTML 5 Drum Kit
 * Copyright (c) 2009 Brian Arnold
 * Software licensed under MIT license, see http://www.randomthink.net/lab/LICENSE
 * Original drum kit samples freely used from http://bigsamples.free.fr/
 */

$(document).ready(function(){
	make_playlist();
	bind_buttons();
	init_state();
	return;
	/////
	function make_playlist() {
		// Process each of the audio items, creating a playlist sort of setup
		$("audio").each(function(i){
			// Make a self reference for ease of use in click events
			var self = this;

			// Make a sub-list for our control
			var $ul = $('<ul id="control_' + this.id + '" class="soundrow">');
			$ul.append('<li class="header">' + this.title + '</li>');
			// Add 16 list items!
			for (j = 0; j < 16; j++) {
				var $li =
					$('<li class="pip col_'+j+'">'+self.id+'</li>')
					.click(function(){
						$(this).toggleClass('active');
						buildHash();
					})
					.data('sound_id', self.id);
				$ul.append($li);
			}
			// Append it up
			$('<li>').append($ul).appendTo('#lights');
		});
	}
	function bind_buttons() {
		// Bind up a click for our button
		$("#soundstart").click(function(){
			if (isPlaying === false) {
				// Start the playing!
				isPlaying = setInterval(playBeat, 60000 / tempo / 4);
				// Change our display
				this.innerHTML = "Stop!";
			} else {
				clearInterval(isPlaying);
				isPlaying = false;
				$("#tracker li.pip").removeClass("active");
				$("audio").each(function(){
					this.pause();
					this.currentTime = 0.0;
				});
				this.innerHTML = "Start!";
			}
		});
		$('#clearall').click(clearAll);
		$('#reload').click(parseHash);
	}
	function init_state () {
		parseHash();
		$('#tempovalue').html(tempo);

		$('#temposlider').slider({
			'value': tempo,
			'min': 30,
			'max': 180,
			'step': 10,
			'slide': function(e, ui) {
				tempo = ui.value;
				$('#tempovalue').html(tempo);
				if (isPlaying !== false) {
					clearInterval(isPlaying);
					isPlaying = setInterval(playBeat, 60000 / tempo / 4);
				}
			},
			'stop': function(e, ui) {
				buildHash();
			}
		});
	}
});


var isPlaying = false;
var tempo = 120;

(function ($) {
	var tracker = {
		pips: $("#tracker .pip"),

		// deactivates the current pip and activates the next pip
		// starts at pip 0 and wraps around to pip 0
		// returns the index of the newly activated pip
		activate_next: function () {
			var pips = this.pips;
			return pips.index(
				$(pips.active().deactivate().next()[0] || pips[0]).activate()
			);
		}
	};
	
	var sounds = {
		
	};
	// extend jQuery
	$.extend({drumz: {tracker: tracker, sounds: sounds}});
	
	$.fn.extend({
		active: function () {
			return this.filter('.active');
		},
		activate: function () {
			return this.addClass('active');
		},
		deactivate: function () {
			return this.removeClass('active');
		},
	})
})(jQuery);

function playBeat() {	
	var beat = $.drumz.tracker.activate_next();
	
	// Find each active beat, play it
	var audio;
	var column = $(".soundrow[id^=control] li.pip:nth-child("+(beat+1).toString()+")");
	
	column.active().each(function (){
		audio = document.getElementById($(this).data('sound_id'));
		if (!audio.paused) {
			// Pause and reset it
			audio.pause();
			audio.currentTime = 0.0;
		}
		audio.play();
	});

}

// Make a new hash
function buildHash() {
	var newhash =
	$(".soundrow[id^=control] li.pip").map(function () {
		return $(this).active().length;
	}).get().
	concat('|', $('#temposlider').slider('value')).
	join('');
	location.hash = newhash;
} 

// Read in our hash
function parseHash() {
	if (location.hash.length > 0) {
		// Split it up, work it out, removing the actual hashmark
		var pieces = location.hash.substring(1).split('|');
		// Set the lights
		var lights = pieces[0];
		$(".soundrow[id^=control] li.pip").each(function(i){
			// Make sure we haven't exceeded
			if (i >= lights.length) return false;
			// Check our location, turn on class if need be
			if (lights.charAt(i) == '1') {
				$(this).addClass('active');
			}
		});
		// Set the tempo
		if (typeof pieces[1] !== 'undefined') {
			$('#temposlider').slider('value', parseInt(pieces[1]));
			$('#tempovalue').innerHTML = pieces[1];
			tempo = parseInt(pieces[1]);
		}
	}
}

// Clear it!
function clearAll() {
	$(".soundrow[id^=control] li.active").deactivate();
}