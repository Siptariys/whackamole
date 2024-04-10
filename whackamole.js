var whackamole = whackamole || (function(window, undefined) {
	
	// booleans, ints, and timers
	var game, score, popping, startTime, currentTime, clicked, moles, gameTimeout, hits = 0;
	

	var	liveClass = "wam-pesky-mole",
		deadClass = "wam-pesky-mole-dead",
		hidingInterval = 1500,
		poppingInterval = 750,
		moleLimit = 10;

	// utility function to get computed style
	function getStyle(el, cssprop){
		if (el.currentStyle) {
			return el.currentStyle[cssprop];
		} else if (document.defaultView && document.defaultView.getComputedStyle) {
			return document.defaultView.getComputedStyle(el, "")[cssprop];
		}
	}
	
	// main game methods
	game = {
		mode: "start",
		// is it live? or live?
		live: function() {
			this.mole.className = liveClass;
			this.mole.clicked = false;
			this.mode = "main";
		},
		// the violence or smth
		kill: function() {
			var currentTime = (new Date).getTime();
			score += (Math.floor( ( ( poppingInterval - (currentTime - startTime) ) / poppingInterval) * 100 )) * 10;
			hits++;
			this.mole.className = deadClass;
			this.mode = "dead";
		},
		move: function() {
			moles++;
			clicked = false;
			this.mole.style.top = Math.floor(Math.random() * (parseInt(getStyle(this.stage, "height")) - parseInt(getStyle(this.mole, "height")) ) ) + "px";
			this.mole.style.left = Math.floor(Math.random() * (parseInt(getStyle(this.stage, "width")) - parseInt(getStyle(this.mole, "width")) ) ) + "px";
			startTime = (new Date).getTime();
		},
		togglePop: function() {
			this.mole.style.display = (popping) ? "block" : "none";
		},
		reset: function() {
			game.mode = "main";
			popping = false;
			hits = score = moles = 0;
		},
		showStart: function() {
			this.startScreen.style.display = "block";
		},
		showScoreboard: function() {
			this.sb.style.display = "block";
		}
	}
	
	// main setup run once, instantiates three entities:
	// the "pesky" mole, the scoreboard, and the game stage
	function setup(elementId) {
		
		var mole, sb, stage;
		
		// the mole
		mole = game.mole = document.createElement("div");
		mole.className = liveClass;
		mole.style.display = "none";
		// cross-browser event handling
		mole.onclick = function() {
			if (!game.mole.clicked) {
				game.kill();
				game.mole.clicked = true;
				game.scoreboard.update();
				window.clearTimeout(gameTimeout);
				step();
			}
		};
		
		// the scoreboard
		sb = game.scoreboard = document.createElement("div");
		sb.className = "wam-scoreboard";
		sb.update = function() {
			this.innerHTML = "points: " + score + "<br />Moles: " + hits + " / " + moles;
		}
		
		// the start screen
		ss = game.startScreen = document.createElement("div");
		ss.className = "wam-startScreen";
		ss.innerHTML = "start";
		ss.style.display = "none";
		ss.onclick = function() {
			game.mode = "main";
			this.style.display = "none";
			step();
		}
		
		// the end screen
		es = game.endScreen = document.createElement("div");
		es.className = "wam-endScreen";
		es.style.display = "none";
		es.innerHTML = "Play again?";
		es.onclick = function() {
			game.reset();
			game.mode = "main"
			this.style.display = "none";
			game.startScreen.display = "none";
			step();
			
		}
		
		// the game stage
		stage = game.stage = document.getElementById(elementId);
		stage.style.position = "relative";
	
		// build the thing FOR loop
		stage.appendChild(ss);
		stage.appendChild(sb);
		stage.appendChild(mole);
		stage.appendChild(es);
		
	}
	
	// at first I was calling this "loop", but it wasn't really a loop
	// but more like a controller for the game, that various
	// objects would call to "step" the game forward
	// this could probably be refactored into something much more elegant
	function step() {
		switch(game.mode) {
			case "start":
				game.showStart();
				break;
			case "dead":
				gameTimeout = setTimeout(function(){
					
					step();
				}, 500);
				game.mode = "main";
				break;
			case "main":
				game.scoreboard.update();
				if (moles >= moleLimit) {
					game.mode = "end";
					gameTimeout = setTimeout(step, 10);
					break;
				}
				game.live();
				game.togglePop();
				if (popping) game.move();
				popping = (popping) ? false : true;
				gameTimeout = setTimeout(step, (popping) ? hidingInterval : poppingInterval);
				break;
			case "end":
			default:
				game.scoreboard.innerHTML = "Final Score: " + score + "<br />Moles: " + hits + " / " + moles;
				game.endScreen.style.display = "block";
				break;
		}
	}
	
	// public interface
	// not really sure I need anything but "setup"
	// but it just seems any self respecting game should at least
	return {
		setup: function(element) {
			setup(element);
			this.start();
		},
		start: function() {
			game.reset();
			game.mode = "start";
			step();
		},
		stop: function() {
			game.mode = "dead";
			moles = moleLimit + 1;
			window.clearTimeout(gameTimeout);
			step();
		}
	};
	
})(window);