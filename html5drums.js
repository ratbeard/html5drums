/*
 * HTML 5 Drum Kit
 * Copyright (c) 2009 Brian Arnold
 * Software licensed under MIT license, see http://www.randomthink.net/lab/LICENSE
 * Original drum kit samples freely used from http://bigsamples.free.fr/
 */

$(document).ready(function(){  $.drum.init();   ':)'  });


// extend jQuery with drum plugin
;;;(function ($) {
  
	$.extend({drum: {
	  
		defaults: {
			playing: false,
			tempo: 120,
			beats: 16
		},

    pips: {
      // ugly... too bad new Array(10).map|reduce|forEach don't work :/
      make: function (num) {
        num = num || $.drum.beats;
        var str = '';
        for (var i=0; i<num; i++)
			    str += $.drum.pips.html;
			  return str;
      },
      html: '<td class="pip"></td>'
    },
    
		init: function () {
		  this.build_board( $('audio') );
      setup_controls();
    	parse_location_hash();
    	/////
    	function setup_controls () {
        $.drum._tempo._init();
        $.drum.kit.find('.drum-play').toggle($.drum.start, $.drum.stop);
      	$.drum.kit.find('.drum-clear').click($.drum.board.clear);
    		$.drum.kit.find('.drum-reload').click(parse_location_hash);
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
			if ('tempo' in config)  change_tempo();
			/////
			function change_tempo () {
				$.drum.tempo = config.tempo;
				if ( $.drum.playing ) {
					$.drum.stop(); 
					$.drum.start(); 
				}				
			}
		},
		_play: function () {
      // $.drum.sounds.beat(1).now()
      $.
      drum.
        board.
          pips().
            active().
              on().
                sound().
                  play().
                end().
              end().
            move_beat();
		},
		serialize: function () {
			return $(".pip").map(function () {  return $(this).on().length;  }).
			  get().
  				concat('|', $.drum.tempo).
  				join('');
		},
		deserialize: function (str) {
			var parts = str.split('|'), 
				notes = parts[0],					
				tempo = parseInt(parts[1]);
				
			$(".pip").each(function(i){
				if ( i < notes.length && notes[i] === '1') 
					$(this).turn_on();
			});
			
			if ( tempo ) {
				$('#tempovalue').innerHTML = tempo;
				$.drum.tempo = tempo;
				$('#temposlider').slider('value', tempo);
			}	
		},
    
    build_board: function ($audio) {
  	  $audio.
  	    wrap('<th></th>').
  	    each(add_title).
  	    parent().
  	      wrap('<tr></tr>').
  	      parent().
            each(add_sound_data).
  	        append($.drum.pips.make()).
    	        wrapAll('<table class="drum-board"></table>')

		  $.drum.board = $('.drum-board'); 
		  
			$.drum.board.pips().live('click', function () {
				$(this).toggleClass('on');
				buildHash();
			});
			
      $.drum.board.clear = function () { $(".pip.on").turn_off(); }  
      
      $.drum.kit = $.drum.board.parents('section'); 
			///// 
			function add_title () {
  	    $(this).parent().append('<span>'+this.title+'</span>');
  	  }
  	  function add_sound_data () {
  	    $(this).data('sound', $(this).find('audio')[0].title)
  	  }
	  },
    
    sound: function (name) {
      var sound = $('audio').filter('[title="'+name+'"]');
      sound.pips = function () { return this.parents('tr').pips(); };
      sound.addpip = function (num) { 
        num = num || 1;
        return this.parents('tr').append($.drum.pips.make(num)).end();
      }
      return sound;
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
	
	// override add to add pips when given a number:
	// in progress…
	var _original_add_ = $.fn.add;
  $.fn.add = function (arg) {
    if (typeof arg === 'number') {
      console.log('NUM');
      console.log(this.selector);
      w = this
    }
    else {
      console.log('add');
      return _original_add_.call(this, arg);
    }
      
  };
	
	// add jQuery element helper methods
	$.fn.extend({
	  play: function () {
	    return this.each(function() {  
	      if ( !this.play )  return;
	      if ( !this.paused ) {
					this.pause();
					this.currentTime = 0.0;
				}
				this.play();
	    });
	  },
	  sound: function () {
	    var sounds = $(this).closest('tr').find('audio');
      sounds.prevObject = this;
      return sounds;
	  },
	  pips: function () {
	   var pips = this.find('.pip');
	   return pips;
	  },
		on: function () {
			return this.filter('.on');
		},
		turn_on: function () {
			return this.addClass('on');
		},
		turn_off: function () {
			return this.removeClass('on');
		},
    active: function () {
      return this.filter('.drum-now');
    },
    move_beat: function () {
      return this.
        removeClass('drum-now').
        succ().
          addClass('drum-now');
    },
    // next(), but last sibling wrapps around to the first 
    succ: function () {
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