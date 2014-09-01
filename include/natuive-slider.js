/* natUIve Slider */

_swipeEvents = function(el) {

	var startX,
		startY;

	el.addEventListener("touchstart", touchstart);  
	
	function touchstart(event) {

		var touches = event.touches;
		if (touches && touches.length) {
			startX = touches[0].pageX;
			startY = touches[0].pageY;
			el.addEventListener("touchmove", touchmove);
		}
	}

	function touchmove(event) {
		var touches = event.touches;
		if (touches && touches.length) {

			var deltaX = startX - touches[0].pageX;
			var deltaY = startY - touches[0].pageY;

			event.preventDefault();

			if (deltaX >= 50) {
			  var event = new Event('swipeLeft');
			  el.dispatchEvent(event);
			}
			if (deltaX <= -50) {
			  var event = new Event('swipeRight');
			  el.dispatchEvent(event);
			}
			if (Math.abs(deltaY) >= 10) {
				document.body.scrollTop += deltaY;
			}

			if (Math.abs(deltaX) >= 50 || Math.abs(deltaY) >= 50) {
				el.removeEventListener('touchmove', touchmove);
			}

		}
	}

};

function sliderElement (e) {
	
	var event = e || window.event; 
	el = event.target || event.srcElement;

	if ( hasClass(el, 'slider-container')) {

		el = el.querySelector('.slider');

	} else {

		while ( !hasClass(el,'slider') ) {
			
			el = el.parentNode;
			
		}

	}
	
	return el;
	
}

var lastAnimation = 0;

_init_scroll = function(event, delta) {

	var deltaOfInterest = delta,
		timeNow = new Date().getTime();

	// Cancel scroll if currently animating or within quiet period
	if( (timeNow - lastAnimation) < 500) {
		event.preventDefault();
		return;
	}

	var el = sliderElement (event);

	if (deltaOfInterest < 0) {
		slide(el, 'right');
	} else {
		slide(el, 'left');
	}
	
	lastAnimation = timeNow;
}

_mouseWheelHandler = function(event) {

	var delta = event.wheelDelta || -event.detail;
	if ( Math.abs(event.wheelDeltaX) < 9 ) return;
	event.preventDefault();
	_init_scroll(event, delta);
}

function slide ( e, method ) {

	var event = e || window.event; 
	stopEvent(event);
	el = event.target || event.srcElement;

	if (typeof el == 'undefined' ) { 

		el = e; 

	}

	var index = 0, slider = 0;
	
	if ( method == 'index' ) {
		
		slider = el.parentNode.parentNode.querySelector('.slider');
		
		index = thisIndex(el);

		pos = index * 100;

	}
	
	if ( method == 'left' || method == 'right' ) {

		slider = el.parentNode.querySelector('.slider');

		var index = thisIndex ( slider.parentNode.querySelector('.slider-nav a.active') );

		pos = ( method == 'left' ? --index : ++index ) * 100;

		if ( (index<0) || (index >= slider.children.length) ) {
			
			return;
	
		}
	
	}
	
    removeClass( slider.parentNode.querySelector('.slider-nav .active'), 'active');
    addClass( slider.parentNode.querySelector('.slider-nav').children[index], 'active');

    slider.style.cssText = ( navigator.userAgent.indexOf('MSIE 8') != -1 ) ? ("overflow-y: visible; left: -" + pos + "%;") : ("overflow-y: visible; -webkit-transform: translateX(-" + pos + "%); -webkit-transition: -webkit-transform 400ms ease; -moz-transform: translateX(-" + pos + "%); -moz-transition: -moz-transform 400ms ease; -ms-transform: translateX(-" + pos + "%); -ms-transition: -ms-transform 400ms ease; transform: translateX(-" + pos + "%); transition: transform 400ms ease;");
    
}

function sliderKeyboard (e) {

	var event = e || window.event;
	el = event.target || event.srcElement;
	if (document.querySelector('.slider') == null ) {
	
		return;
		
	}
	
	var tag = el.tagName.toLowerCase();

	switch(event.which) {
		case 37:
			if (tag != 'input' && tag != 'textarea') slide(e, 'left');
			break;
		case 39:
			if (tag != 'input' && tag != 'textarea') slide(e, 'right');
			break;
		default: return;
	}

};

function makeSlider (el, current_slide) {

	addClass (el, 'slider');
	el.insertAdjacentHTML('beforebegin', '<div class="slider-container"></div>'); // Create a container and move the slider in it
	container = el.previousSibling;
	container.insertAdjacentHTML('afterbegin', '<a class="slider-arrow left">←</a>' + el.outerHTML/* .replace( new RegExp( "\>[\n\t ]+\<" , "g" ) , "><" ) */ + '<a class="slider-arrow right">→</a><div class="slider-nav"></div>');
	container.nextSibling.outerHTML = '';
	el = container.querySelector('.slider');
	el.style.overflowY = 'visible';
	
	// Generate controls

	for (var i = 0; i < el.children.length; i++) {
		
		if ( el.children[i].nodeName == '#comment' ) {
			
			continue;
		
		}
		
		if ( el.children[i].querySelector('.thumbnail') ) {

			slider_nav = el.parentNode.querySelector('.slider-nav');
			addClass( slider_nav, 'thumbnails' );
			addClass( slider_nav, 'row' );
			slider_nav.insertAdjacentHTML('beforeend', ( !i ? '<a class="active">' : '<a>' ) + el.children[i].querySelector('.thumbnail').innerHTML + '</a>' );
			
		} else {
			
			container.querySelector('.slider-nav').insertAdjacentHTML('beforeend', ( !i ? '<a class="active">' : '<a>' ) + (i + 1) + '</a>');

		}
		
		container.querySelector('.slider-nav').lastChild.onclick = function (e) {

			slide(e, 'index');

		};
		
	}

	container.querySelector('.slider-arrow.left').onclick = function (e) {

		slide(e, 'left');

	}
	
	container.querySelector('.slider-arrow.right').onclick = function (e) {

		slide(e, 'right');

	}
	
	if (current_slide) {
		
		removeClass(el.parentNode.querySelector('.slider-nav .active'), 'active');
		addClass(el.parentNode.querySelector('.slider-nav').children[current_slide], 'active');
		pos = current_slide*100;
		el.style.cssText = ( navigator.userAgent.indexOf('MSIE 8') != -1 ) ? ("overflow-y: visible; left: -" + pos + "%;") : ("overflow-y: visible; -webkit-transform: translateX(-" + pos + "%); -moz-transform: translateX(-" + pos + "%);-ms-transform: translateX(-" + pos + "%);transform: translateX(-" + pos + "%);");
		
	}
	
	document.onkeydown = sliderKeyboard;

	if ( navigator.userAgent.indexOf('MSIE 8') != -1 ) {
	
		return el;
	
	}

	el.parentNode.addEventListener('mousewheel', _mouseWheelHandler);
	el.parentNode.addEventListener('DOMMouseScroll', _mouseWheelHandler);

	_swipeEvents(el.parentNode);
  	el.parentNode.addEventListener("swipeLeft",  function(event){

	  	el = sliderElement(event);
  		slide(el, 'right');

  	});

  	el.parentNode.addEventListener("swipeRight", function(event){

	  	el = sliderElement(event);
  		slide(el, 'left');

  	});

	return el;
	
}

/* Start */

/* Initialise JS extras: create arrows/numbers navigation */
forEach('.slider', function(el, i) {

	makeSlider(el);
	
});
