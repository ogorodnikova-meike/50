jQuery(function ($) {

	$('.background_video iframe').mwBackgroundVideo();
	$('.open_video_lightbox').mwVideoPopup();
	$('.open_element_lightbox').mwElementPopup();
	$('.open_mw_popup').mwPopup();

	$('.mw_cookie_management_container').mwCookieBar();

	mw_init_contact_form('.ve_contact_form');
	mw_init_form('.ve_check_form');


	$(window).on('scroll', function (e) {
		setParallaxScroll();
	});
	setParallaxScroll();


	setFixedHeader();

	// delay show
	$(".row_container_delay").each(function () {
		var $this = $(this);
		setTimeout(function () {
			/** Fade in to "flex" instead of "block" @see https://stackoverflow.com/a/28906733 */
			$this
				.css("display", "flex")
				.hide()
				.fadeIn("slow");
		}, $this.attr('data-delay') * 1000);
	});

	$(".element_container_delay").each(function () {
		var $this = $(this);
		setTimeout(function () {
			$this.fadeIn("slow");
		}, $this.attr('data-delay') * 1000);
	});

	$(".video_element_gdpr_agree_but").click(function () {
		var container = $(this).closest('.video_element_gdpr_content');
		if(container.find('input').prop('checked'))
		{
			$('.video_element_gdpr_content').remove();
			var date = new Date();
			date.setDate(date.getDate() + 365);
			document.cookie = "mw_allow_video_youtube=1;expires=" + date.toGMTString() + "; path=/";
		}
		else
		{
			container.remove();
		}
		return false;
	});

	/* ********************* Scroll  ******************** */
	$('body').on('click', '.mw_scroll_tonext', function () {
		var position = $(this).offset().top + 66;


		// Subtract fixed header height
		if (jQuery('.ve_fixed_header').length) {
			position -= jQuery('#header').height()
		}

		$('html,body').animate({
			scrollTop: position
		}, 1000);
		return false;
	});

	/* ********************* Tabulators  ******************** */
	$(".mw_tabs").on('click', 'a', function () {
		var target = $(this).attr('href');
		var group = $(this).attr('data-group');
		$(".mw_tabs_" + group + " a").removeClass("active");
		$(this).addClass("active");
		$("." + group + "_container > li").hide();
		$(target).show();
		return false;
	});

	/* ********************* Toggle target ******************** */
	$('body').on('click', '.mw_toggle_container', function (event) {
		var $this = $(this);
		var tar = $this.attr('data-target');
		if ($this.is('input[type=checkbox]')) {
			var checked = $this.prop('checked');
			if (checked)
				$('#' + tar).show();
			else
				$('#' + tar).hide();
		} else {
			$('#' + tar).toggle();
		}
	});

	$(window).resize(mw_debouncer(mw_recalculate_fb_page_plugin_width, 500))
});

function mw_recalculate_fb_page_plugin_width() {
	var $fb = jQuery('.fb-page');
	if (!$fb.length) {
		return;
	}

	var init = false;

	$fb.each(function () {
		var $this = jQuery(this);
		var elementWidth = parseInt($this.width());
		var containerWidth = parseInt($this.parent().width());

		if (containerWidth && elementWidth) {
			var maxWidth = $this.attr('data-max-width') || 500;
			var minWidth = 180;

			containerWidth = Math.max(Math.min(containerWidth, maxWidth), minWidth);
			if (elementWidth !== containerWidth) {
				$this.attr('data-width', containerWidth);
				$this.removeAttr('fb-iframe-plugin-query');
				$this.html('');

				init = true;
			}
		}
	});

	if (init) {
		mw_init_facebook();
	}
}

function mw_debouncer(func, timeout) {
	var timeoutID, timeout = timeout || 200;
	return function () {
		var scope = this, args = arguments;
		clearTimeout(timeoutID);
		timeoutID = setTimeout(function () {
			func.apply(scope, Array.prototype.slice.call(args));
		}, timeout);
	}
}

function mw_init_contact_form(target) {
	jQuery(target).mwForm({
		onsubmit: function (self, $form) {
			var form = $form.serialize();
			var loading = self.$el.find("button span.loading");
			loading.show();
			jQuery.post(ajaxurl, 'action=ve_send_contact_form&' + form, function (data) {

				self.showMessage(data);
				loading.hide();

			}).fail(function () {

				self.showMessage({'sended': 'error', 'message': front_texts.nosended});
				loading.hide();

			});
		}
	});
}

function mw_init_facebook() {
	if (typeof FB.XFBML.parse === "undefined") {
		console.log('Function "FB.XFBML.parse" is undefined')
		return;
	}

	FB.XFBML.parse();
}

function mw_init_form(target) {
	jQuery(target).mwForm();
}

function mw_load_added_ss_form(target, content) {
	var $target = jQuery(target);

	var old = window.document.write;
	window.document.write = function (html) {
		$target.html(html);
		window.document.write = old;
	}

	$target.html(content);
}

function mw_load_added_script(target, url, html) {
	var $target = jQuery(target);

	if(html)
		$target.html(html);

	var script = document.createElement("script");
	script.async = true;
	script.src = url;
	$target.append(script);
}

function mw_load_added_fapi_form(target, but_class, content, clientDetails) {
	var $target = jQuery(target);

	var old = window.document.write;
	window.document.write = function (html) {
		$target.html(html);
		window.document.write = old;

		mw_fill_fapi_form_old(clientDetails);
		$target.find("#frm-submit").addClass(but_class);
	}

	mw_fill_fapi_form_new(clientDetails)

	var wrapper = document.createElement('div');
	wrapper.innerHTML= content;
	var script = document.createElement('script');
	script.src = wrapper.firstChild.src;
	script.type = 'text/javascript';

	$target.html('');
	document.querySelector(target).append(script);

	// Remove possibly loaded Fapi scripts because Fapi will load them again in it's internal initialization
	var fapiInternalScripts = ['https://form.fapi.cz/js/jQueryFapi.js', 'https://form.fapi.cz/js/netteFormsFapi.js'];
	jQuery('script').each(function () {
		if (fapiInternalScripts.indexOf(this.src) !== -1) {
			this.parentNode.removeChild(this);
		}
	});
}

function mw_load_fapi_form(target, but_class, clientDetails) {
	var $target = jQuery(target);
	mw_fill_fapi_form_old(clientDetails);
	mw_fill_fapi_form_new(clientDetails)
	$target.find("#frm-submit").addClass(but_class);
}

function mw_fill_fapi_form_old(clientDetails) {
	if (clientDetails && clientDetails !== 'null') {
		clientDetails = jQuery.parseJSON(clientDetails);
		var $form = jQuery("#frm-showUserForm");
		if (!$form.length) {
			return;
		}

		var inputNames = ["name", "surname", "email", "mobil", "street", "city", "postcode", "company", "ic", "dic"];
		for (var i in inputNames) {
			var name = inputNames[i];
			var value = clientDetails[name];
			if (value !== undefined) {
				$form.find("[name=" + name + "]").val(value);
			}
		}
	}
}

function mw_fill_fapi_form_new(clientDetails) {
	set_singleton_event_listener('fapiFormMounted', function (e) {
		if (clientDetails && clientDetails !== 'null') {
			var values = jQuery.parseJSON(clientDetails);
			var formWrapper = e.detail.formWrapper || null;
			if (formWrapper !== null) {
				var inputNames = ["email", "phone", "first_name", "last_name", "company", "ico", "dic", "street", "city", "zip"];
				for (var i in inputNames) {
					var name = inputNames[i];
					var value = values[name];
					if (value !== undefined) {
						var input = formWrapper.querySelector("[name=" + name + "]");
						if (input !== null) {
							input.value = value;
						}
					}
				}
			}
		}
	});
}

/** @see https://stackoverflow.com/a/17391426 */
var set_singleton_event_listener = (function(element){
	var handlers = {};
	return function(evtName, func){
		handlers.hasOwnProperty(evtName) && element.removeEventListener(evtName, handlers[evtName]);
		if (func) {
			handlers[evtName] = func;
			element.addEventListener(evtName, func);
		} else {
			delete handlers[evtName];
		}
	};
})(document);


/* ********************* Fixed header  ******************** */
function setFixedHeader() {
	if (jQuery('.ve_fixed_header').length) {
		var header_position = jQuery(".ve_fixed_header").offset();

		jQuery(window).on('scroll load', function (e) {
			var header_height = jQuery('#header').height();
			var padding_bottom = header_height;
			if (jQuery('.ve_fixed_header').length === 0) padding_bottom = 0;
			if (jQuery('.mw_transparent_header').length) padding_bottom = 0;

			var scroll = jQuery(window).scrollTop();
			var fixed_desktop_only = jQuery(".ve_fixed_header").hasClass('ve_fixed_desktop_only');
			if (scroll > header_position.top && (!fixed_desktop_only || jQuery(window).width() >= 767)) {
				jQuery(".ve_fixed_header").addClass("ve_fixed_header_scrolled");
				jQuery("header").css('paddingBottom', padding_bottom);

				if (e.type === 'load' && window.location.hash) {
					var anchor = document.querySelector(window.location.hash);
					if (anchor !== null) {
						var isScrolledToAnchor = Math.floor(anchor.getBoundingClientRect().top) === 0;
						if (isScrolledToAnchor) {
							// jQuery(window).scrollTop(scroll - header_height);
							jQuery('html, body').animate({scrollTop: '-=' + header_height + 'px'}, 0);
						}
					}
				}
			} else {
				jQuery(".ve_fixed_header_scrolled").removeClass("ve_fixed_header_scrolled");
				jQuery("header").css('paddingBottom', '0');
				//jQuery("header").height('auto');
			}
		});
	}
}

function setParallaxScroll() {
	if (jQuery('.background_parallax').length) {
		jQuery('.background_parallax').each(function () {
			var $el = jQuery(this);
			updateParallax($el);
		});
	}
}

function updateParallax($el) {

	var diff = jQuery(window).scrollTop() - $el.closest('.row').offset().top;
	var yPos = +(diff * 0.4);

	var coords = yPos + 'px';

	$el.css({
		backgroundPositionY: coords
	});
}


/* ********************* FAQ  ******************** */
function faqClick(element, cssid) {
	jQuery(element).toggleClass('ve_faq_question_open');
	jQuery(element).toggleClass('ve_faq_question_close');
	jQuery(element).next(cssid + " .ve_faq_answer").slideToggle();
}

// smooth link scroll

jQuery(function () {
	jQuery('.menu a[href*="#"]:not([href="#"]),.ve_content_button[href*="#"]:not([href="#"]),.element_image a[href*="#"]:not([href="#"]),.entry_content a[href*="#"]:not([href="#"]),.mw_feature_title_link[href*="#"],.mw_icon_text a[href*="#"], .link_element_container a[href*="#"]:not([href="#"]), .title_element_container a[href*="#"]:not([href="#"])').on('click', function () {
		if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
			var target = jQuery(this.hash);
			var $fixedHeader = jQuery('.ve_fixed_header');
			var fixedHeaderHeight = $fixedHeader.height() || 0;
			var fixedAndNotScrolled = $fixedHeader.hasClass('mw_transparent_header') && !$fixedHeader.hasClass('ve_fixed_header_scrolled');

			if (fixedAndNotScrolled) {
				// Because transparent header has absolute position
				$fixedHeader.removeClass('mw_transparent_header');
			}

			target = target.length ? target : jQuery('[name=' + this.hash.slice(1) + ']');
			if (target.length) {
				jQuery('html,body').animate({
					scrollTop: (target.offset().top - fixedHeaderHeight)
				}, 1000, 'swing', function() {
					if (fixedAndNotScrolled) {
						$fixedHeader.addClass('mw_transparent_header');
					}
				});
				if (jQuery('#mobile_nav').is(':visible')) {
					jQuery('#header .header_nav_container').removeClass('open');
					jQuery('.mw_mobile_nav_close_overlay').remove();
					jQuery('body').removeClass('mobile_menu_opened');
				}
				return false;
			}
		}
	});
});


function initialize_google_maps() {
	jQuery('.mw_google_map_container').each(function () {
		var def_setting = {
			address: 'Praha',
			zoom: 12,
			scrollwheel: false,
		};

		var setting = JSON.parse(jQuery(this).attr('data-setting'));

		setting = jQuery.extend(def_setting, setting);

		initialize_google_map(jQuery(this).attr('id'), setting);

	});
}

function initialize_google_map(map_id, setting) {
	var address = setting.address;
	var geocoder = new google.maps.Geocoder();
	var map = new google.maps.Map(document.getElementById(map_id), {
		zoom: setting.zoom,
		scrollwheel: setting.scrollwheel,
		center: {lat: -25.363, lng: 131.044}
	});
	if (geocoder) {
		geocoder.geocode({
			'address': address
		}, function (results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				if (status != google.maps.GeocoderStatus.ZERO_RESULTS) {
					map.setCenter(results[0].geometry.location);

					var infowindow = new google.maps.InfoWindow({
						content: '<b>' + address + '</b>',
						size: new google.maps.Size(150, 50)
					});

					var marker = new google.maps.Marker({
						position: results[0].geometry.location,
						map: map,
						title: address
					});
					google.maps.event.addListener(marker, 'click', function () {
						infowindow.open(map, marker);
					});

				} else {
					jQuery('#' + map_id + '_error').show();
				}
			} else {
				jQuery('#' + map_id + '_error').show();
			}
		});
	}
	var mapdata = {
		map: map,
		adress: address
	};
	jQuery('#' + map_id).data('map', mapdata);
}

;(function (factory) {

	if (typeof define === 'function' && define.amd) {
		define(['jquery'], factory);
	} else if (typeof exports !== 'undefined') {
		module.exports = factory(require('jquery'));
	} else {
		factory(jQuery);
	}

})(function ($) {
	// background video
	var MwBackgroundVideo = (function (element) {

		function _MwBackgroundVideo(element) {

			this.$el = $(element);
			this.$el.hide();
			var self = this;

			$(element).load(function () {
				self.sizeTheVideo();
				self.$el.show();
			});
			$(window).resize(function () {
				self.sizeTheVideo();
				console.log('resize');
			});

		}

		return _MwBackgroundVideo;

	})();

	MwBackgroundVideo.prototype.sizeTheVideo = function () {

		var w = this.$el.closest('div').width();
		var h = this.$el.closest('div').height();

		if (w > (h / 9 * 16)) {
			this.$el.css({
				'width': w + 'px',
				'height': w / 16 * 9 + 'px',
				'margin-left': -w / 2 + 'px',
				'margin-top': -w / 32 * 9 + 'px'
			});
		} else {
			this.$el.css({
				'width': h / 9 * 16 + 'px',
				'height': h + 'px',
				'margin-left': -h / 9 * 8 + 'px',
				'margin-top': -h / 2 + 'px'
			});
		}

	}

	$.fn.mwBackgroundVideo = function (options) {
		return this.each(function (index, el) {
			el.MwBackgroundVideo = new MwBackgroundVideo(el, options);
		});
	};

	// popup
	var MwPopup = (function (element) {

		/**
		 * Buffer of keys to open parent popups
		 * @type {Array}
		 */
		var buffer = [];

		function _MwPopup(element) {
			this.$el = $(element);
			var self = this;

			this.$el.click(function () {
				var key = $(this).attr('data-id');

				open(self, key);

				return false;
			});
		}

		function open(self, key) {
			var id = $("#ve_popup_container_" + key);
			var popup_width = id.attr('data-width');
			var background = id.attr('data-bg');
			buffer.push(key);

			var href = "#ve_popup_container_" + key;

			$.colorbox({
				width: "90%",
				maxWidth: popup_width,
				inline: true,
				opacity: 0.8,
				className: "colorbox_nobackground",
				href: href,
				onComplete: function () {
					$(this).colorbox.resize();
					$("#ve_popup_container_" + key + ' .ve_content_button').click(function () {
						self.setCookie(key);
					});
					// Resize colorbox when FB page plugin inside is loaded
					var observer = new MutationObserver(function(mutations) {
						var height = mutations[0].target.style.height || null;
						if (height !== null && height !== '0px') {
							$(this).colorbox.resize();
							observer.disconnect();
							mw_recalculate_fb_page_plugin_width()
						}
					});
					$(href + ' .fb-page > span').each(function () {
						observer.observe($(this)[0], { attributes: true, attributeFilter: ['style'] });
					});
				},
				onClosed: function () {
					self.setCookie(key);

					buffer.pop() // Remove current key
					if (buffer.length >= 1) {
						// Open parent popup if there is still some key in buffer
						open(self, buffer.pop())
					}
				}
			});

			$("#cboxOverlay").css("background-color", background);
		}

		return _MwPopup;
	})();

	MwPopup.prototype.setCookie = function (key) {
		var delay = $("#ve_popup_container_" + key).attr('data-delay');

		var now = new Date();
		var time = now.getTime();
		var expireTime = time + 1000 * 3600 * delay * 24;
		now.setTime(expireTime);
		if (delay > 0) document.cookie = "ve_popup_" + key + "=1;expires=" + now.toGMTString() + "; path=/";
	}

	$.fn.mwPopup = function (options) {
		return this.each(function (index, el) {
			el.MwPopup = new MwPopup(el, options);
		});
	};

	// video popup
	var MwVideoPopup = (function (element) {

		function _MwVideoPopup(element) {

			this.$el = $(element);

			this.$video = $(this.$el.attr('data-open')).find('iframe');

			var video_url = this.$video.attr("src");
			if (!this.$el.attr('data-mw-href') && video_url) this.$el.attr('data-mw-href', video_url);
			this.$video.attr("src", "");

			var self = this;

			this.$el.colorbox({
				inline: true,
				href: self.$el.attr('data-open'),
				maxWidth: "90%",
				width: "800px",
				onClosed: function () {
					self.$video.attr("src", "");
				},
				onComplete: function () {
					self.$video.attr("src", self.$el.attr('data-mw-href'));
				}
			});

		}

		return _MwVideoPopup;

	})();

	$.fn.mwVideoPopup = function (options) {
		return this.each(function (index, el) {
			el.MwVideoPopup = new MwVideoPopup(el, options);
		});
	};

	// element popup
	var MwElementPopup = (function (element) {

		function _MwElementPopup(element) {
			this.$el = $(element);
			var self = this;

			this.$el.colorbox({
				inline: true,
				href: self.$el.attr('data-popup'),
				maxWidth: "90%",
				width: "600px",
			});

		}

		return _MwElementPopup;

	})();

	$.fn.mwElementPopup = function (options) {
		return this.each(function (index, el) {
			el.MwElementPopup = new MwElementPopup(el, options);
		});
	};

	// contact form
	var MwForm = (function (element) {

		function _MwForm(element, settings) {
			this.$el = $(element);

			this.defaults = {
				onsubmit: null,
			};
			this.settings = $.extend({}, this, this.defaults, settings);

			var self = this;

			if (this.$el.hasClass("ve_content_form_antispam")) {
				this.$el.attr('action', this.$el.attr('data-action'));
			}

			this.$el.submit(function (e) {
				var error = false;
				var err_class = "ve_error_form";

				self.$el.find(".ve_error_form").removeClass("ve_error_form");
				self.$el.find(".ve_form_checkbox_container_error").removeClass("ve_form_checkbox_container_error");
				self.$el.find(".ve_form_error_message").remove();

				self.$el.find(".ve_form_required").each(function () {

					if ($(this).hasClass('ve_form_checkbox')) {
						if (!$(this).is(':checked')) error = true;
					} else if ($(this).hasClass('ve_form_checkbox_container')) {

						if ($('input:checkbox:checked', this).length < 1) {
							error = true;
							err_class = "ve_form_checkbox_container_error";
						}

					} else if ($(this).hasClass('ve_form_radio_container')) {

						if ($('input:radio:checked', this).length < 1) {
							error = true;
							err_class = "ve_form_checkbox_container_error";
						}

					} else {
						if ($(this).val() == "") error = true;
					}

					if (error) {
						$(this).addClass(err_class);
						var err = $(this).attr('data-errorm');
						if (!err) err = front_texts.required;

						if ($(this).hasClass('ve_form_checkbox')) {
							$(this).closest('label').after('<div class="ve_form_error_message">' + err + '</p>');
						} else $(this).after('<div class="ve_form_error_message">' + err + '</p>');

						if (($(this).offset().top - 50) < $(window).scrollTop()) {
							$('html, body').animate({
								scrollTop: ($(this).offset().top - 50)
							}, 500);
						}

						return false;
					}
				});

				//check number
				if (!error) {
					self.$el.find(".ve_form_number").each(function () {
						var value = $(this).val() || '';
						var number = value.trim();

						if (!$.isNumeric(number)) {
							$(this).addClass("ve_error_form");
							ret = false;
							alert(front_texts.wrongnumber);
							if (($(this).offset().top - 50) > $('body').offset().top) {
								$('html, body').animate({
									scrollTop: ($(this).offset().top - 50)
								}, 500);
							}
							return false;
						}
					});
				}

				if (!error) {
					var emailReg = /^([\w-+\.]+@([\w-]+\.)+[\w-]{2,10})?$/;
					self.$el.find(".ve_form_email").each(function () {
						var emailaddressVal = $(this).val().trim();
						$(this).val(emailaddressVal);
						if (!emailReg.test(emailaddressVal) || emailaddressVal == "") {
							$(this).addClass("ve_error_form");
							$(this).after('<div class="ve_form_error_message">' + front_texts.wrongemail + '</p>');
							if (($(this).offset().top - 50) > $('body').offset().top) {
								$('html, body').animate({
									scrollTop: ($(this).offset().top - 50)
								}, 500);
							}
							error = true;
						}
					});
				}

				if (error) {
					return false;
				}
				// contact form sending
				else {

					if (self.settings.onsubmit) {
						self.settings.onsubmit.call(this, self, $(this));
						return false;
					}

					if(self.$el.hasClass('mw_funnel_contact_conversion')) {
						var mail = self.$el.find(".ve_form_email").val();
						var funnel_id = self.$el.attr('data-funnel');
						$.ajax({
							type: 'POST',
							data: {"action": "mwSendMailConversion", "contact": mail, "funnel_id": funnel_id},
							url: ajaxurl,
							success: function (content) {
								self.$el.off("submit");
								self.$el.submit();
								//console.log(content);
							}
						});
						return false;
					}
				}


			});

			this.$el.on("click", ".ve_error_form", function () {
				$(this).removeClass("ve_error_form");
				$(this).closest('.ve_form_row').find('.ve_form_error_message').remove();
			});
			this.$el.find(".ve_form_message").click(function () {
				self.closeMessage();
			});

		}

		return _MwForm;

	})();

	MwForm.prototype.showMessage = function (data) {
		this.$el.find('.ve_form_message span').html(data.message);
		this.$el.find('.ve_form_message').removeClass('ve_form_message_error ve_form_message_ok').addClass('ve_form_message_' + data.sended).fadeIn(200);
		if (data.sended == 'ok') {
			this.clearForm();
		}
	}

	MwForm.prototype.closeMessage = function () {
		this.$el.find('.ve_form_message').fadeOut(200, function () {
			$(this).find('span').html('');
			$(this).removeClass('ve_form_message_error ve_form_message_ok');
		});
	}
	MwForm.prototype.clearForm = function () {
		this.$el.find(".ve_form_row input").each(function () {
			$(this).val("");
		});
		this.$el.find(".ve_form_row textarea").val('');
	}

	$.fn.mwForm = function (options) {
		return this.each(function (index, el) {
			el.MwForm = new MwForm(el, options);
		});
	};

	// element popup
	var MwCookieBar = (function (element) {

		function _MwCookieBar(element) {
			this.$el = $(element);
			var obj = this;

			if(this.showCookieBar()) {
				this.$el.show();
			}

			this.$el.find(".mw_cookie_open_setting").click(function () {
				obj.$el.find(".mw_cookie_bar").hide();
				obj.$el.find(".mw_cookie_setting_popup").show();

				var cookie = obj.getCookie();
				var preferences = false;
				var marketing = false;
				var analytics = false;

				if(cookie) {
					var cookieData = JSON.parse(cookie);
					preferences = Boolean(cookieData.permissions.preferences);
					marketing = Boolean(cookieData.permissions.marketing);
					analytics = Boolean(cookieData.permissions.analytics);
				}

				obj.$el.find(".mw_cookie_setting_switch_preferences input").prop('checked', preferences);
				obj.$el.find(".mw_cookie_setting_switch_marketing input").prop('checked', marketing);
				obj.$el.find(".mw_cookie_setting_switch_analytics input").prop('checked', analytics);

				return false;
			});

			this.$el.find(".mw_cookie_setting_form_item_head").click(function () {
				var container = $(this).closest('.mw_cookie_setting_form_item');
				container.find('.mw_cookie_setting_form_item_text').slideToggle();
				container.find('.mw_cookie_setting_arrow').toggleClass('opened');
			});

			this.$el.find(".mw_switch").click(function(e) {
		        e.stopPropagation();
			});

			// close popup
			this.$el.find(".mw_cookie_setting_popup_close").click(function(e) {
				obj.$el.find(".mw_cookie_bar").show();
				obj.$el.find(".mw_cookie_setting_popup").hide();
		        return false;
			});

			// allow all
			this.$el.find(".mw_cookie_allow_all_button").click(function () {
				obj.saveCookie();
				window.location.reload();
				obj.remove();
				return false;
			});

			// deny all
			this.$el.find(".mw_cookie_deny_all_button").click(function () {
				obj.saveCookie(0,0,0,0);
				if(obj.$el.hasClass('in_element_cookie_management')) {
					window.location.reload();
				}
				else {
					obj.remove();
				}

				return false;
			});

			// save setting
			this.$el.find(".mw_cookie_save_setting").click(function () {
				var preferences = 0;
				var marketing = 0;
				var analytics = 0;
				var others = 0;
				if(obj.$el.find('input:checked[name=preferences]').length)
				{
					preferences = 1;
				}
				if(obj.$el.find('input:checked[name=marketing]').length && obj.$el.find('input[name=marketing]'))
				{
					marketing = 1;
				}
				if(obj.$el.find('input:checked[name=analytics]').length)
				{
					analytics = 1;
				}
				obj.saveCookie(preferences, marketing, analytics, others);
				window.location.reload();
				obj.remove();
				return false;
			});
		}

		return _MwCookieBar;

	})();

	MwCookieBar.prototype.remove = function () {
		if(this.$el.hasClass('mw_cookie_bar_management_container'))
		{
			this.$el.remove();
		}
		else
		{
			this.$el.find(".mw_cookie_setting_popup").hide();
		}
	}

	MwCookieBar.prototype.showCookieBar = function () {
		var cookie = this.getCookie();
		if(cookie) {
			return false;
		}
		else {
			return true;
		}
	}

	MwCookieBar.prototype.getCookie = function() {
		const name = "mw_cookie_permissions=";
		const cDecoded = decodeURIComponent(document.cookie); //to be careful
		const cArr = cDecoded.split('; ');
		let res = null;
		cArr.forEach(val => {
			if (val.indexOf(name) === 0) res = val.substring(name.length);
		})
		return res
	}

	MwCookieBar.prototype.saveCookie = function (preferences = 1, marketing = 1, analytics = 1, others = 1) {
		var date = new Date();
		var id = this.getId();

		var json_str = JSON.stringify({
			'id': id,
			'date': date.toGMTString(),
			'permissions': {
				'preferences': preferences,
				'marketing': marketing,
				'analytics': analytics,
				'others': others,
			}
		});

		date.setDate(date.getDate() + 365);
		document.cookie = 'mw_cookie_permissions=' + json_str + '; path=/; expires=' + date.toGMTString();
		if(!analytics)
		{
			document.cookie = 'mw_allow_video_youtube=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
		}

		// save to db
		$.ajax({
			type: 'POST',
			data: {
				'action': 'mwSaveCookieConsent',
				'id': id,
				'preferences': preferences,
				'marketing': marketing,
				'analytics': analytics,
			},
			url: ajaxurl,
		});
	}

	MwCookieBar.prototype.getId = function ()
	{
		var cookie = this.getCookie();

		if(cookie) {
			var cookieData = JSON.parse(cookie);
			if(cookieData.id)
			{
				return cookieData.id;
			}
		}

		var d = new Date().getTime();
		if (window.performance && typeof window.performance.now === "function")
		{
			d += performance.now();
			// use high-precision timer if available
		}
		var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c)
		{
			var r = (d + Math.random() * 16) % 16 | 0;
			d = Math.floor(d / 16);
			return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
		});
	    return uuid;
	}

	$.fn.mwCookieBar = function (options) {
		return this.each(function (index, el) {
			el.MwCookieBar = new MwCookieBar(el, options);
		});
	};

});
