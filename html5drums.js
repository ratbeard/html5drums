/*
 * HTML 5 Drum Kit
 * Copyright (c) 2009 Brian Arnold
 * Software licensed under MIT license, see http://www.randomthink.net/lab/LICENSE
 * Original drum kit samples freely used from http://bigsamples.free.fr/
 */
$(document).ready(function(){
	$.drumz.tracker._init();
	$.drumz.sounds._init();
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
			$.drumz.tracker._load_columns();
			var time = 60000 / $.drumz.tempo / 4;
			//
			$.drumz.playing = true;
			$.drumz.loop = setInterval($.drumz._play, time);
		},
		stop: function () {
			$.drumz.playing = false;
			clearInterval($.drumz.loop);
			$("#tracker li.pip").deactivate();
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
			var beat = $.drumz.tracker.activate_next(),
				column = $.drumz.tracker.columns[beat],
				sounds = column.active().map(function () { 
							return $(this).data('sound');
						}).get();
			sounds.forEach($.drumz.sounds.play);
		},
		serialize: function () {
			return $(".soundrow[id^=control] li.pip").map(function () {
					return $(this).active().length;
				}).get().
				concat('|', $.drumz.tempo).
				join('');
		},
		deserialize: function (str) {
			var parts = str.split('|'), 
				notes = parts[0],					
				tempo = parseInt(parts[1]);
				
			$(".soundrow[id^=control] li.pip").each(function(i){
				if ( i < notes.length && notes[i] == '1') 
					$(this).activate();
			});
			
			if ( tempo ) {
				$('#tempovalue').innerHTML = tempo;
				$.drumz.tempo = tempo;
				$('#temposlider').slider('value', tempo);
			}	
		},
		
		// make an array of length == number of beats
		// pass in fn to build each element.  fn is passed beat index
		_map_beats: function (fn) {
			return $.map(new Array($.drumz.beats), function (nil, i) {
				return fn(i);
			});
		},
		
		_make_pips: function () {
			var items = $.drumz._map_beats(li);
			return $(items.join(''));
			/////
			function li () { return '<li class="pip"></li>'; }
		},
		
		// make pips, append to given spot, and space out every 4 pips
		// returns pips
		_append_pips: function (appendTo) {
			return $.drumz._make_pips().
						appendTo(appendTo).
						filter(':nth-child(4n+1)').
							addClass('space').
						end();
		},

		// § Components that make up the drumz §
		tracker: {
			_init: function () {
				this.pips = $.drumz._append_pips('#tracker');				
			},
			
			_load_columns: function () {
				this.columns = $.drumz._map_beats(function (i) {
					var sel = ".soundrow[id^=control] li.pip:nth-child("+(i+2).toString()+")";
					var el = $(sel);
					// console.log(sel, el)
					return el;
				});
			},
			
			// deactivates the current pip and activates the next pip
			// starts at pip 0, wraps around to pip 0
			// returns the index of the newly activated pip
			activate_next: function () {
				var p = this.pips;
				return p.index(
					$(p.active().deactivate().next()[0] || p[0]).activate()
				);
			},
			
		}, 
		sounds: {
			_cache: null,
			_build_cache: function () {
				var cache = {};
				$('audio').each(function () {
					cache[this.title] = this;
				});
				this._cache = cache;
				return cache;
			},
			get: function (id) {
				return (this._cache || this._build_cache())[id];
			},
			play: function (id) {
				var audio = $.drumz.sounds.get(id);
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

					$.drumz._append_pips($ul).
						data('sound', this.title).
						click(function(){
							$(this).toggleClass('active');
							buildHash();
						});

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
	
	// add element helper methods.  is this bad form??
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