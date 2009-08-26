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

		pip: '<td class="pip"></td>',

		_init: function (root) {
		  $.drum.root = root;
		  build_board();
      setup_controls();  		
    	parse_location_hash();
    	return;
    	/////
    	function build_board () {
      	$.drum.board = root.find('.drum-board');
        $.drum.board.clear = function () { 
            $(".pip.on").deactivate_pip();
  			}    	  
        $.drum.sounds._init();
    	}
    	function setup_controls () {
        $.drum._tempo._init();
        root.find('.drum-play').toggle($.drum.start, $.drum.stop);
      	root.find('.drum-clear').click($.drum.board.clear);
    		root.find('.drum-reload').click(parse_location_hash);
    	}
    	function parse_location_hash() {
    		if (location.hash.length > 0)
    			$.drum.deserialize(location.hash.substring(1));
    	}
		},
		start: function () {
		  $.drum.board.find('tr td:nth-child(2)').addClass('drum-now');
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
      // $.drum.sounds.beat(1).now()
      $.drum.board.
        current_beat().
        turned_on().
          play_sound().
        end().
        move_beat();

		},
		serialize: function () {
			return $(".pip").map(function () {
					return $(this).active_pips().length;
				}).get().
				concat('|', $.drum.tempo).
				join('');
		},
		deserialize: function (str) {
			var parts = str.split('|'), 
				notes = parts[0],					
				tempo = parseInt(parts[1]);
				
			$(".pip").each(function(i){
				if ( i < notes.length && notes[i] == '1') 
					$(this).activate_pip();
			});
			
			if ( tempo ) {
				$('#tempovalue').innerHTML = tempo;
				$.drum.tempo = tempo;
				$('#temposlider').slider('value', tempo);
			}	
		},
		
    sound: function (name) {
      return $('audio.sound-'+name);
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
			  console.log('play', id);
				var audio = $.drum.sounds.get(id);
				if ( !audio.paused ) {
					audio.pause();
					audio.currentTime = 0.0;
				}
				audio.play();
			},
			_init: function () {
			  var pips_str = '';
			  for (var i=0; i<$.drum.beats; i++)
			    pips_str += $.drum.pip;
			    
				$("audio").map(function() {
				  return $('<tr><th>'+this.title+'</th>'+pips_str+'</tr>').data('sound', this.title);
				}).appendTo($.drum.board);
				
				$.drum.board.find('.pip').live('click', function () {
				  console.log('clack');
				  console.log(this);
				  console.log($(this).parent().data('sound'))
					$(this).toggleClass('on');
					buildHash();
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
	}});
	
	// apply defaults options
	$.extend($.drum, $.drum.defaults);
	
	// add jQuery element helper methods (with sufficiently obscure names)
	$.fn.extend({
    drum: function (config) {
    	$.drum._init(this);
    },
		active_pips: function () {
			return this.filter('.on');
		},
		activate_pip: function () {
			return this.addClass('on');
		},
		deactivate_pip: function () {
			return this.removeClass('on');
		},
    current_beat: function () {
      return this.find('.drum-now');
    },
    turned_on: function () {
      return this.filter('.on');
    },
    play_sound: function () {
      xX = this
      return this.each(function () {
        $.drum.sounds.play( $(this).parent().data('sound') );
      })
    },
    move_beat: function () {
      return this.
        removeClass('drum-now').
        next_in_ring().
        // add('.soundrow[id^=control] li:first-child').
          // eq(0).
            addClass('drum-now');
      
    },
    next_in_ring: function () {
      var $this, $next;
      return this.map(function () {
        $this = $(this);
        $next = $this.next();
        return ($next.length > 0 ? $next : $this.siblings('td:first')).get();
      });
    }
	})
})(jQuery);

// Make a new hash
function buildHash() {
	location.hash = $.drum.serialize();
} 