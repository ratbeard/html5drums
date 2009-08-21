Bugs
====
None!

Features
========

## More semantic markup ##

- Table instead of a list? No, I like a `ol`, since different tracks can have different number of beats.
- Checkbox, not css class.  Probabilities and volume can be additional info in the element, but 'degrades' to a simple beat.
- Sounds should probably be an `ol` too.
- Look more at `container` and other new elements semantics

## jQuery UI ##

This makes sense as a widget.  Need to figure out how to make one - though it looks like much less investment than extjs.  

At a minimum, tell it a container to render to.  Audio to use can be given as urls through js config, audio tags in a selector (default is page), or perhaps by default link to common set of sounds on the internet?

- http://jqueryui.com/docs/Developer_Guide
- http://bililite.com/blog/understanding-jquery-ui-widgets-a-tutorial/

## Get Online w/ github pages ##
rake script to copy in to `gh-pages` repo.  

- Shell out, or use grit?

## Keyboard ##

Control Fully.  I've got a decent idea how I want the controls to function - gmail style, with multi-key commands.  Hands on the home row, right hand sets the mode, left hand for selecting.  

Since only 4 numbers to select w/o movement can use recursive style selection - first select block, then select element.  So 16 numbers can be reached in 2 strokes - perfect for 4/4 tracker, and having 16 sounds.
    
    a   1
    s   2 
    d   3
    f   4

    j   column (beat)
    k   row (sound)
    l   hit
    ;   volume
    
    # Examples
    jaa     move to beat 1
    jad     move to beat 3
    jfa     move to beat 13
    jff     move to beat 16
    …
    
    kaa     move to sound 1
    kaf     move to sound 4
    …
    
    la      current cell hit w/ prob 0%
    ls      current cell hit w/ prob 33%
    ld      current cell hit w/ prob 66%
    lf      current cell hit w/ prob 100%

    ;a      current cell volume  0%
    ;s      current cell volume 33%
    ;d      current cell volume 66%
    ;f      current cell volume 100%
    
    # Lots of room for shortcuts!
    shift+j down one row
    shift+k up one row
    …
    

Need to look at keyboard libs, and see if any support buffering, or if I need to do that.

## Advanced Drum Kit ##

- Volume
- Probability of hit
- Make some tracks have differing number of notes - one with 18.  instead of 1 timing tracker, every track has there own.  Embedding state in the UI w/ css classes etc should make this quite possible, with one global timer still.

I have just dinked around with drum kits like fruity loops in the past, and while its fun, I'd like more of an element of exploration about it.  If it has 1% of the features of real software drum kits, using it to explore simple emergent phenomenon would make it much more fun to me.  Also, the possibilities of having native HTTP and an easy, interactive GUI environment are much more interesting than awesome sound quality, fine-grained control, etc.

It would be interesting if cells could have other rules that could affect themselves and neighboring cells.  For example, a 'trap' cell that has a 33% of catching the passing tick, and holding it there for a measure.  Another cell when entered would make any beats in the neighboring rows jump ahead 3 beats.  Each row has its own 'brain', e.g. its current tempo, position, etc.  It receives info from a global clock and can proceed as it wishes.  See Web Worker discussion below. Music with the game of life.  

More Archaeopteryx than Reason.

## Kits ##

Usage:

- Make a "Standard" kit concept - snare, base drum, hh closed, hh open, crash, tom 1, tom 2, tom 3.  Swap out for other kits, marked up properly.

- Add sounds on the fly

## Jetpack ##

Usage:

- Can record Audio in jetpack now - use that to record samples.  That would be awesome.
- Page watcher to look for microdata-style embedded kits on pages, and ask you to install them.  That be cool.
- Page watcher to look for microdata-style embedded beats on pages, and ask you to install them.  That be wicked.

@TODO:

- How sounds are accessible through API?
- Think more about using as installation mechanism



## Webworkers ##

Useful for long running processes in the background.  Would not help to move loop code there?  Depends on speed of messaging, which would be worth testing.  Cannot interact with page DOM.  Looks pretty straightforward.  Would be fun to use more parts of html5!

String message passing looks interesting - like Erlang as Chris Andersen comments.  Half baked thought - seems like roughly the same protocol as using $().data, i.e. all string based.  Could an interface be put over these that a process intercepts and can determine whether to offload processing to web workers?  Off topic, but what are jquery's thoughts about the `data-X` attributes (html5!)?  What exactly is an expando, is that an expando, how do they lead to memory leaks, and could the data be stored there?

Uses:

- Offload drum engine core to a worker?
- start a worker for each track?  Cool, but need to synchronize
- Build up DOM fragments there and send back?  can import jquery and other scripts

I can see them useful for improving speed once other extensions to the drum machine are made:

- In a probabilistic drum machine, compute play/skip for a given note ahead of time.  Could even compile as functions to be evaled by main script.
+ coordinate between windows - sequencer, sound importer, chat room :)


- http://ejohn.org/blog/web-workers/
- https://developer.mozilla.org/En/Using_DOM_workers#Performing_web_I.2fO_in_the_background
- https://developer.mozilla.org/En/Using_workers_in_extensions

## Storage ##

Know very little about storage, and its support.  I'm quite against the idea of writing SQL in the browser (and in general).  Maybe a more key/value-ish, JSON storage mechanism is available?

More html5!

Usage:

- Store tracks and compositions
- Store sounds 

## Web Sockets ##
html5!

Chat and multi-user capabilities.  See collab project below.

- http://dev.w3.org/html5/websockets/

Projects
========

## Online Version ##

Share Beats.  No server storage needed, really, with urls.

## Collab ##
gives you a beat.  You are allowed to make X number of tweaks (turning on/off a pip).  Try and find the best sounding progression of the current beat.  Can aggregrate results, even turning into a probabilistic beat.  

This could be done in real time.  Bring your iphone and headphones to a concert.  You can run the current measure as the DJ is playing it, and then tweak and come up with where the tune should go.  Once you've found it, submit it.  