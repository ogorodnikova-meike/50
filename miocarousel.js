/*
 * We trigger the factory() function is different
 * ways to support modular JavaScript libraries. See
 * the 'Wrapping Up' section of the tutorial for
 * more information
 *
 */
;(function (factory) {

	if (typeof define === 'function' && define.amd) {
		define(['jquery'], factory);
	} else if (typeof exports !== 'undefined') {
		module.exports = factory(require('jquery'));
	} else {
		factory(jQuery);
	}

})(function ($) {

	/*
	   * We define Zippy as a variable of type ‘function’.
	 * Here, we use an anonymous function to ensure
	 * that the logic inside the function is executed immediately.
	   *
	   */
	var MioCarousel = (function (element, settings) {

		var instanceUid = 0;

		/*
		 * The constructor function for Zippy
		 *
		 */
		function _MioCarousel(element, settings) {
			var duration = 3000;
			var speed = 500;
			var autoplay = 1;
			var indicators = 1;
			var animation = 'fade';
			var height = 0;

			if ($(element).is('[data-duration]')) duration = $(element).attr("data-duration");
			if ($(element).is('[data-speed]')) speed = parseInt($(element).attr("data-speed"));
			if ($(element).is('[data-autoplay]')) autoplay = parseInt($(element).attr("data-autoplay"));
			if ($(element).is('[data-indicators]')) indicators = parseInt($(element).attr("data-indicators"));
			if ($(element).is('[data-animation]')) animation = $(element).attr("data-animation");
			if ($(element).is('[data-height]')) height = $(element).attr("data-height");

			this.defaults = {
				slideDuration: duration,
				speed: speed,
				indicators: indicators,
				animation: animation,
				arrowRight: '.mc_arrow_container-right',
				arrowLeft: '.mc_arrow_container-left',
				autoplay: autoplay,
				height: height,
			};

			// We create a new property to hold our default settings after they
			// have been merged with user supplied settings
			this.settings = $.extend({}, this, this.defaults, settings);

			// This object holds values that will change as the plugin operates
			this.initials = {
				currSlide: 0,
				$currSlide: null,
				totalSlides: false,
				csstransitions: false
			};

			// Attaches the properties of this.initials as direct properties of MioCarousel
			$.extend(this, this.initials);

			// Here we'll hold a reference to the DOM element passed in
			// by the $.each function when this plugin was instantiated
			this.$el = $(element);
			var obj = this;

			// Set height to carousel
			this.resize();
			$(window).resize(function () {
				obj.resize();
			});


			// Ensure that the value of 'this' always references MioCarousel
			this.changeSlide = $.proxy(this.changeSlide, this);

			// We'll call our initiator function to get things rolling!
			this.init();

			// A little bit of metadata about the instantiated object
			// This property will be incremented everytime a new MioCarousel carousel is created
			// It provides each carousel with a unique ID
			this.instanceUid = instanceUid++;
		}

		return _MioCarousel;

	})();

	MioCarousel.prototype.resize = function () {
		var height = 0;
		var real_height = 0;
		this.$el.addClass('recount_slider');
		if (this.settings.height == 'full') {

			var editorPanelHeight = 0;
			if (jQuery('#ve_editor_top_panel').length) editorPanelHeight = 40;

			height = jQuery(window).height() - editorPanelHeight;

			var inrow = this.$el.closest('.row');

			if (inrow.is('.row:first') && $('#header').length) {
				height = height - $('#header').height();
			}
			real_height = height;
			this.$el.find('.slide').css('min-height', height);
		}
		this.$el.find('.slide').each(function () {
			if ($(this).outerHeight() > height) {
				height = $(this).outerHeight();
				var padding_top = $(this).find('.row_fix_width').css("padding-top") || 0;
				real_height = $(this).outerHeight() - parseInt(padding_top);
			}
		});
		this.$el.height(height);
		this.$el.attr('data-height', real_height);
		this.$el.removeClass('recount_slider');
	};

	/**
	 * Called once per instance
	 * Calls starter methods and associate the '.mio-carousel' class
	 * @params void
	 * @returns void
	 *
	 */
	MioCarousel.prototype.init = function () {
		//Test to see if cssanimations are available
		this.csstransitionsTest();
		// Add a class so we can style our carousel
		this.$el.addClass('mio-carousel');
		// Build out any DOM elements needed for the plugin to run
		// Eg, we'll create an indicator dot for every slide in the carousel
		this.totalSlides = this.$el.find('.slide').length;

		this.build();

		if (this.totalSlides > 1) {
			// Eg. Let the user click next/prev arrows or indicator dots
			this.events();
			// Bind any events we'll need for the carousel to function
			this.activate();
			// Start the timer loop to control progression to the next slide
			this.initTimer();
		} else this.$el.find('.slide').eq(0).addClass('active');
	};

	/**
	 * Appropriated out of Modernizr v2.8.3
	 * Creates a new DOM element and tests existence of properties on it's
	 * Style object to see if CSSTransitions are available
	 * @params void
	 * @returns void
	 *
	 */
	MioCarousel.prototype.csstransitionsTest = function () {
		var elem = document.createElement('modernizr');
		//A list of properties to test for
		var props = ["transition", "WebkitTransition", "MozTransition", "OTransition", "msTransition"];
		//Iterate through our new element's Style property to see if these properties exist
		for (var i in props) {
			var prop = props[i];
			var result = elem.style[prop] !== undefined ? prop : false;
			if (result) {
				this.csstransitions = result;
				break;
			}
		}
	};

	/**
	 * Add the CSSTransition duration to the DOM Object's Style property
	 * We trigger this function just before we want the slides to animate
	 * @params void
	 * @returns void
	 *
	 */
	MioCarousel.prototype.addCSSDuration = function () {
		var _ = this;
		this.$el.find('.slide').each(function () {
			this.style[_.csstransitions + 'Duration'] = _.settings.speed + 'ms';
		});
	}

	/**
	 * Remove the CSSTransition duration from the DOM Object's style property
	 * We trigger this function just after the slides have animated
	 * @params void
	 * @returns void
	 *
	 */
	MioCarousel.prototype.removeCSSDuration = function () {
		var _ = this;
		this.$el.find('.slide').each(function () {
			this.style[_.csstransitions + 'Duration'] = '';
		});
	}

	/**
	 * Creates a list of indicators based on the amount of slides
	 * @params void
	 * @returns void
	 *
	 */
	MioCarousel.prototype.build = function () {
		this.$el.find('.indicators').remove();
		this.$el.addClass('miocarousel_' + this.settings.animation);
		if (this.settings.indicators) {
			var $indicators = this.$el.append('<ul class="indicators" >').find('.indicators');
			for (var i = 0; i < this.totalSlides; i++) $indicators.append('<li data-index=' + i + '>');
		}
	};

	/**
	 * Activates the first slide
	 * Activates the first indicator
	 * @params void
	 * @returns void
	 *
	 */
	MioCarousel.prototype.activate = function () {
		this.$el.find('.slide').removeClass('active');
		this.$el.find('.indicators li').removeClass('active');

		this.$currSlide = this.$el.find('.slide').eq(0);
		this.$el.find('.slide').eq(0).addClass('active');
		this.$el.find('.indicators li').eq(0).addClass('active');
	};

	/**
	 * Associate event handlers to events
	 * For arrow events, we send the placement of the next slide to the handler
	 * @params void
	 * @returns void
	 *
	 */
	MioCarousel.prototype.events = function () {
		this.unbindEvents();
		this.$el
			.on('click', this.settings.arrowRight, {direction: 'right'}, this.changeSlide)
			.on('click', this.settings.arrowLeft, {direction: 'left'}, this.changeSlide)
			.on('click', '.indicators li', this.changeSlide);
	};
	MioCarousel.prototype.unbindEvents = function () {
		this.$el.off('click', this.settings.arrowRight);
		this.$el.off('click', this.settings.arrowLeft);
		this.$el.off('click', '.indicators li');
	}

	/**
	 * TIMER
	 * Resets the timer
	 * @params void
	 * @returns void
	 *
	 */
	MioCarousel.prototype.clearTimer = function () {
		if (this.timer) clearInterval(this.timer);
	};

	/**
	 * TIMER
	 * Initialise the timer
	 * @params void
	 * @returns void
	 *
	 */
	MioCarousel.prototype.initTimer = function () {
		if (this.settings.autoplay) this.timer = setInterval(this.changeSlide, this.settings.slideDuration);
	};

	/**
	 * TIMER
	 * Start the timer
	 * Reset the throttle to allow changeSlide to be executable
	 * @params void
	 * @returns void
	 *
	 */
	MioCarousel.prototype.startTimer = function () {
		this.initTimer();
		this.throttle = false;
	};

	/**
	 * MAIN LOGIC HANDLER
	 * Triggers a set of subfunctions to carry out the animation
	 * @params	object	event
	 * @returns void
	 *
	 */
	MioCarousel.prototype.changeSlide = function (e) {

		//Ensure that animations are triggered one at a time
		if (this.throttle) return;
		this.throttle = true;

		//Stop the timer as the animation is getting carried out
		this.clearTimer();

		// Returns the animation direction (left or right)
		var direction = this._direction(e);

		// Selects the next slide
		var animate = this._next(e, direction);
		if (!animate) return;

		//Active the next slide to scroll into view
		var $nextSlide = this.$el.find('.slide').eq(this.currSlide).addClass(direction + ' active');

		if (!this.csstransitions) {
			this._jsAnimation($nextSlide, direction);
		} else {
			this._cssAnimation($nextSlide, direction);
		}
	};

	/**
	 * Returns the animation direction, right or left
	 * @params	object	event
	 * @returns strong	animation direction
	 *
	 */
	MioCarousel.prototype._direction = function (e) {
		var direction;

		// Default to forward movement
		if (typeof e !== 'undefined') {
			direction = (typeof e.data === 'undefined' ? 'right' : e.data.direction);
		} else {
			direction = 'right';
		}
		return direction;
	};

	/**
	 * Updates our plugin with the next slide number
	 * @params	object	event
	 * @params	string	animation direction
	 * @returns boolean continue to animate?
	 *
	 */
	MioCarousel.prototype._next = function (e, direction) {

		// If the event was triggered by a slide indicator, we store the data-index value of that indicator
		var index = (typeof e !== 'undefined' ? $(e.currentTarget).data('index') : undefined);

		//Logic for determining the next slide
		switch (true) {
			//If the event was triggered by an indicator, we set the next slide based on index
			case(typeof index !== 'undefined'):
				if (this.currSlide == index) {
					this.startTimer();
					return false;
				}
				this.currSlide = index;
				break;
			case(direction == 'right' && this.currSlide < (this.totalSlides - 1)):
				this.currSlide++;
				break;
			case(direction == 'right'):
				this.currSlide = 0;
				break;
			case(direction == 'left' && this.currSlide === 0):
				this.currSlide = (this.totalSlides - 1);
				break;
			case(direction == 'left'):
				this.currSlide--;
				break;
		}
		return true;
	};

	/**
	 * Executes the animation via CSS transitions
	 * @params	object	Jquery object the next slide to slide into view
	 * @params	string	animation direction
	 * @returns void
	 *
	 */
	MioCarousel.prototype._cssAnimation = function ($nextSlide, direction) {
		//Init CSS transitions
		setTimeout(function () {
			this.$el.addClass('transition');
			this.addCSSDuration();
			this.$currSlide.addClass('shift-' + direction);
			this._updateIndicators();
		}.bind(this), 100);

		//CSS Animation Callback
		//After the animation has played out, remove CSS transitions
		//Remove unnecessary classes
		//Start timer
		setTimeout(function () {
			this.$el.removeClass('transition');
			this.removeCSSDuration();
			this.$currSlide.removeClass('active shift-left shift-right');
			this.$currSlide = $nextSlide.removeClass(direction);
			this.startTimer();
		}.bind(this), 100 + this.settings.speed);
	};

	/**
	 * Executes the animation via JS transitions
	 * @params	object	Jquery object the next slide to slide into view
	 * @params	string	animation direction
	 * @returns void
	 *
	 */
	MioCarousel.prototype._jsAnimation = function ($nextSlide, direction) {
		//Cache this reference for use inside animate functions
		var _ = this;

		// See CSS for explanation of .js-reset-left
		if (direction == 'right') _.$currSlide.addClass('js-reset-left');

		var animation = {};
		var animationPrev = {};

		if (this.settings.animation == 'slide') {
			animation[direction] = '0%';
			animationPrev[direction] = '100%';
		} else {
			animation['opacity'] = '1';
			animationPrev['opacity'] = '0';
		}
		//Animation: Current slide
		this.$currSlide.animate(animationPrev, this.settings.speed);
		//Animation: Next slide
		$nextSlide.animate(animation, this.settings.speed, 'swing', function () {
			//Get rid of any JS animation residue
			_.$currSlide.removeClass('active js-reset-left').attr('style', '');
			//Cache the next slide after classes and inline styles have been removed
			_.$currSlide = $nextSlide.removeClass(direction).attr('style', '');
			_._updateIndicators();
			_.startTimer();
		});

	};

	/**
	 * Ensures the slide indicators are pointing to the currently active slide
	 * @params	void
	 * @returns	void
	 *
	 */
	MioCarousel.prototype._updateIndicators = function () {
		this.$el.find('.indicators li').removeClass('active').eq(this.currSlide).addClass('active');
	};

	/**
	 * Initialize the plugin once for each DOM object passed to jQuery
	 * @params	object	options object
	 * @returns void
	 *
	 */
	$.fn.MioCarousel = function (options) {

		return this.each(function (index, el) {

			el.MioCarousel = new MioCarousel(el, options);

		});

	};


});

jQuery(window).load(function () {
	jQuery('.miocarousel').MioCarousel({});
});
