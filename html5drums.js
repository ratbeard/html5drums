/*
 * HTML 5 Drum Kit
 * Copyright (c) 2009 Brian Arnold
 * Software licensed under MIT license, see http://www.randomthink.net/lab/LICENSE
 * Original drum kit samples freely used from http://bigsamples.free.fr/
 */

$(document).ready(function(){
	make_playlist();
	bind_buttons();
	parse_location_hash();
	init_state();
	return;
	/////
	function parse_location_hash() {
		if (location.hash.length > 0)
			$.drumz.deserialize(location.hash.substring(1));
	}
	function make_playlist() {
		// Process each of the audio items, creating a playlist sort of setup
		$("audio").each(function(i){
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
		$("#soundstart").toggle($.drumz.start, $.drumz.stop);
		$('#clearall').click($.drumz.notes.clear);
		$('#reload').click(parse_location_hash);
	}
	function init_state () {		
		$('#tempovalue').html($.drumz.tempo);
		$('#temposlider').slider({
			'min': 30, 'max': 180, 'step': 10, 
			'value': $.drumz.tempo,
			'slide': function(e, ui) {
				$('#tempovalue').html(ui.value);
				$.drumz.change({tempo: ui.value});
			},
			'stop': buildHash
		});
	}
});

// extend jQuery with drumz plugin
(function ($) {
	$.extend({drumz: {
		defaults: {
			playing: false,
			tempo: 120,
			beats: 16
		},
		start: function () {
			$.drumz.playing = true;
			$.drumz.loop = setInterval($.drumz.play, 60000 / $.drumz.tempo / 4);
		},
		stop: function () {
			$.drumz.playing = false;
			clearInterval($.drumz.loop);
			$("#tracker li.pip").removeClass("active");
			$("audio").each(function(){
				this.pause();
				this.currentTime = 0.0;
			});
		},
		change: function (config) {
			if ('tempo' in config) {
				$.drumz.tempo = config.tempo;
				if ( $.drumz.playing ) {
					$.drumz.stop(); 
					$.drumz.start(); 
				}				
			}
		},
		play: function () {
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
		},
		serialize: function () {
			return $(".soundrow[id^=control] li.pip").map(function () {
				return $(this).active().length;
			}).get().
			concat('|', $.drumz.tempo).
			join('');
		},
		deserialize: function (str) {
			var notes = str.split('|')[0],
				tempo = str.split('|')[1];
				tempo = parseInt(tempo);
					
			$(".soundrow[id^=control] li.pip").each(function(i){
				if ( i < notes.length && notes.charAt(i) == '1') 
					$(this).activate();
			});
			
			if ( tempo ) {
				$('#tempovalue').innerHTML = tempo;
				$.drumz.tempo = tempo;
				$('#temposlider').slider('value', tempo);
			}	
		},

		// § Components that make up the drumz §
		tracker: {
			pips: $("#tracker .pip"),
			// deactivates the current pip and activates the next pip
			// starts at pip 0, wraps around to pip 0
			// returns the index of the newly activated pip
			activate_next: function () {
				var pips = this.pips;
				return pips.index(
					$(pips.active().deactivate().next()[0] || pips[0]).activate()
				);
			},
		}, 
		sounds: {
			
		},
		notes: {
			clear: function () {
				$(".soundrow[id^=control] li.active").deactivate();
			}
		}
	}});
	
	// apply defaults
	$.extend($.drumz, $.drumz.defaults);
	
	// add element helper methods
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


// Make a new hash
function buildHash() {
	location.hash = $.drumz.serialize();
} 