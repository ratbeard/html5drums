/*
 * HTML 5 Drum Kit
 * Copyright (c) 2009 Brian Arnold
 * Software licensed under MIT license, see http://www.randomthink.net/lab/LICENSE
 * Original drum kit samples freely used from http://bigsamples.free.fr/
 */
$(document).ready(function(){
	$.drumz.tracker._init();
	$.drumz.sounds._init();
	// $.drumz.controls._init();
	bind_buttons();
	parse_location_hash();
	init_state();
	return;
	/////
	function parse_location_hash() {
		if (location.hash.length > 0)
			$.drumz.deserialize(location.hash.substring(1));
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
			var time = 60000 / $.drumz.tempo / 4;
			$.drumz.playing = true;
			$.drumz.loop = setInterval($.drumz._play, time);
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
		_play: function () {
			// debugger
			var beat = $.drumz.tracker.activate_next();
			var column = $(".soundrow[id^=control] li.pip:nth-child("+(beat+2).toString()+")");

			column.active().each(function (){
				$.drumz.sounds.play( $(this).data('sound') );
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
		
		_make_pips: function (opts) {
			return $($.map(new Array($.drumz.beats), 
				function (nil, i) {
					return $('<li class="pip"></li>')[0];
				}));
		},

		// § Components that make up the drumz §
		tracker: {
			_init: function () {
				this.pips = $.drumz._make_pips().
					appendTo("#tracker").
					filter(':nth-child(4n+1)').
						addClass('space').
					end();
			},
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
			get: function (id) {
				return $('audio[title="'+id+'"]')[0];
			},
			play: function (id) {
				var audio = this.get(id)
				if ( !audio.paused ) {
					audio.pause();
					audio.currentTime = 0.0;
				}
				audio.play();
			},
			_init: function () {
				$("audio").each(function(i){
					var $ul = $('<ul id="control_' + this.id + '" class="soundrow">');
					$ul.append('<li class="header">' + this.title + '</li>');

					$.drumz._make_pips().
						data('sound', this.title).
						click(function(){
							$(this).toggleClass('active');
							buildHash();
						}).
						appendTo($ul).
						filter(':nth-child(4n+1)').
							addClass('space');
						

					$('#lights').append($('<li>').append($ul));
				});
			},
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