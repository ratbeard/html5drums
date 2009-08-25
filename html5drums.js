/*
 * HTML 5 Drum Kit
 * Copyright (c) 2009 Brian Arnold
 * Software licensed under MIT license, see http://www.randomthink.net/lab/LICENSE
 * Original drum kit samples freely used from http://bigsamples.free.fr/
 */
$(document).ready(function(){
  $('#drumkit').drum();
});

// extend jQuery with drum plugin
(function ($) {
	$.extend({drum: {
		defaults: {
			playing: false,
			tempo: 120,
			beats: 16
		},
		_init: function () {
    	$.drum.sounds._init();
    	$.drum._tempo._init();
		},
		start: function () {
      $('.soundrow[id^=control] li:first-child', this).addClass('drum-now');
			$.drum.playing = true;
			$.drum.loop = setInterval($.drum._play, 60000 / $.drum.tempo / 4);
		},
		stop: function () {
			$.drum.playing = false;
			clearInterval($.drum.loop);
		},
		change: function (config) {
			if ('tempo' in config) {
				$.drum.tempo = config.tempo;
				if ( $.drum.playing ) {
					$.drum.stop(); 
					$.drum.start(); 
				}				
			}
		},
		_play: function () {
			$('.drum-now').
			  filter('.active').
			    each(function () {
			      $.drum.sounds.play( $(this).data('sound') );
			    }).end().
        removeClass('drum-now').
        next().
          // add('.soundrow[id^=control] li:first-child').
            // eq(0).
              addClass('drum-now');
		},
		serialize: function () {
			return $(".soundrow[id^=control] li.pip").map(function () {
					return $(this).active_pips().length;
				}).get().
				concat('|', $.drum.tempo).
				join('');
		},
		deserialize: function (str) {
			var parts = str.split('|'), 
				notes = parts[0],					
				tempo = parseInt(parts[1]);
				
			$(".soundrow[id^=control] li.pip").each(function(i){
				if ( i < notes.length && notes[i] == '1') 
					$(this).activate_pip();
			});
			
			if ( tempo ) {
				$('#tempovalue').innerHTML = tempo;
				$.drum.tempo = tempo;
				$('#temposlider').slider('value', tempo);
			}	
		},
		
		// make an array of length == number of beats
		// pass in fn to build each element.  fn is passed beat index
		_map_beats: function (fn) {
			return $.map(new Array($.drum.beats), function (nil, i) {
				return fn(i);
			});
		},
		
		_make_pips: function () {
			var items = $.drum._map_beats(li);
			return $(items.join(''));
			/////
			function li () { return '<li class="pip"></li>'; }
		},
		
		// make pips, append to given spot, and space out every 4 pips
		// returns pips
		_append_pips: function (appendTo) {
			return $.drum._make_pips().
						appendTo(appendTo).
						filter(':nth-child(4n+1)').
							addClass('space').
						end();
		},

		// § Components that make up the drum §
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
				var audio = $.drum.sounds.get(id);
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

					$.drum._append_pips($ul).
						data('sound', this.title).
						click(function(){
							$(this).toggleClass('active');
							buildHash();
						});

					$('#lights').append($('<li>').append($ul));
				});
			},
		},
		
		_tempo: {
		  _init: function () {
		    $('#tempovalue').html($.drum.tempo);
    		$('#temposlider').slider({
    			'min': 30, 'max': 180, 'step': 10, 
    			'value': $.drum.tempo,
    			'slide': function(e, ui) {
    				$('#tempovalue').html(ui.value);
    				$.drum.change({tempo: ui.value});
    			},
    			'stop': buildHash
    		});
		  },
		},
		
		notes: {
			clear: function () {
				$(".soundrow[id^=control] li.active").deactivate_pip();
			}
		}
	}});
	
	// apply defaults options
	$.extend($.drum, $.drum.defaults);
	
	// add jQuery element helper methods (with sufficiently obscure names)
	$.fn.extend({
    drum: function (config) {
    	$.drum._init();
    	$.drum.root = this;
      //
    	this.find('.drum-play').toggle($.drum.start, $.drum.stop);
    	this.find('.drum-clear').click($.drum.notes.clear);
  		this.find('.drum-reload').click(parse_location_hash);
    	parse_location_hash();
    	return;
    	/////
    	function parse_location_hash() {
    		if (location.hash.length > 0)
    			$.drum.deserialize(location.hash.substring(1));
    	}
    },
		active_pips: function () {
			return this.filter('.active');
		},
		activate_pip: function () {
			return this.addClass('active');
		},
		deactivate_pip: function () {
			return this.removeClass('active');
		},
	})
})(jQuery);

// Make a new hash
function buildHash() {
	location.hash = $.drum.serialize();
} 