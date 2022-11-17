/* global jQuery */
(function ($) {

	var FrontMenu = {

		init: function () {

			this.header_wrap = $('#header');
			this.menu_wrap = this.header_wrap.find('.header_nav_container');
			this.top_level_menu_items = this.menu_wrap.find('.menu > .menu-item');
			this.items_with_submenu = this.menu_wrap.find('.menu-item-has-children');
			this.items_with_submenu_anchors = this.items_with_submenu.children('span');
			this.submenus = this.top_level_menu_items.find('.sub-menu');
			this.mobile_nav_button = $('#mobile_nav');
			this.mobile_nav_close_button = $('#mobile_nav_close');

			this.tolerance_margin = 10;
			this.placeholders_added = false;
			this.is_mobile_menu = false;
			this.is_full_width_menu = this.header_wrap.hasClass('header_in_s2');

			this.bindEvents();

		},

		bindEvents: function () {

			this.checkForMobileMenu(); //DOM ready
			$(window).load($.proxy(this.checkForMobileMenu, this));
			$(window).on('resize', $.proxy(this.checkForMobileMenu, this));

		},

		checkForMobileMenu: function () {

			if (!this.menu_wrap.hasClass('open')) {

				var available_width = 0,
					all_items_width = 0;

				this.header_wrap.removeClass('is-mobile_menu');
				this.menu_wrap.removeClass('open');
				//$('body').off('wheel.mio__front_menu__noscroll mousewheel.mio__front_menu__noscroll');
				$('.mw_mobile_nav_close_overlay').remove();
				this.is_mobile_menu = false;

				for (var i = 0, length = this.top_level_menu_items.length; i < length; i++) {
					all_items_width = all_items_width + this.top_level_menu_items.eq(i).outerWidth(true);
				}

				var header_icons_width = $('.header_icons').outerWidth(true) || 0;
				all_items_width = all_items_width + header_icons_width;

				available_width = this.menu_wrap.width();

				var isTouch = ('ontouchstart' in document.documentElement);

				if (all_items_width && (((available_width - this.tolerance_margin) <= all_items_width) || isTouch)) {
					this.header_wrap.addClass('is-mobile_menu');
					this.is_mobile_menu = true;
				}

				//Bind specific events
				this.unbindDesktopEvents();
				this.unbindMobileEvents();

				if (this.is_mobile_menu) {
					this.bindMobileEvents();
				} else {
					this.bindDesktopEvents();
				}
			}

		},

		bindDesktopEvents: function () {

			this.checkForOverflowedSubmenus();
			$(window).on('load.mio_menu__desktop__checkoverflow', $.proxy(this.checkForOverflowedSubmenus, this));
			$(window).on('resize.mio_menu__desktop__checkoverflow', $.proxy(this.checkForOverflowedSubmenus, this));

			//Hovers
			var t = this;
			this.items_with_submenu.on('mouseenter.mio_menu__desktop__hovers', function () {
				t.showHideSubmenu($(this), 'show');
			});
			this.items_with_submenu.on('mouseleave.mio_menu__desktop__hovers', function () {
				t.showHideSubmenu($(this), 'hide');
			});

			//Click on parent item
			this.items_with_submenu_anchors.on('touchstart.mio_menu__desktop__taps', function () {
				var el = $(this);
				el.data('scrolling', false);
			});
			this.items_with_submenu_anchors.on('touchmove.mio_menu__desktop__taps', function () {
				var el = $(this);
				el.data('scrolling', true);
			});
			this.items_with_submenu_anchors.on('touchend.mio__front_menu__open_submenu', function (evt) {
				var el = $(this);
				if (el.data('scrolling') !== true) {
					t.checkForTap(evt, el);
				}
				el.data('scrolling', false);
			});

		},

		unbindDesktopEvents: function () {

			$(window).off('load.mio_menu__desktop__checkoverflow');
			$(window).off('resize.mio_menu__desktop__checkoverflow');

			//Hovers
			this.items_with_submenu.off('mouseenter.mio_menu__desktop__hovers');
			this.items_with_submenu.off('mouseleave.mio_menu__desktop__hovers');

			//Click on parent item
			this.items_with_submenu_anchors.off('touchstart.mio_menu__desktop__taps');
			this.items_with_submenu_anchors.off('touchmove.mio_menu__desktop__taps');
			this.items_with_submenu_anchors.off('touchend.mio__front_menu__open_submenu');

			//Runtimes
			this.items_with_submenu_anchors.off('click.mio_menu__desktop__prevent_click');
			$(document).off('click.mio__front_menu__close_submenu');


		},

		bindMobileEvents: function () {

			var t = this;
			this.items_with_submenu_anchors.on('click.mio_menu__mobile__toggle_submenu', function (evt) {
				evt.preventDefault();
				t.showHideSubmenu($(this).parent(), 'toggle', true);
			});
			this.mobile_nav_button.on('click.mio_menu__mobile__open_menu', function (evt) {
				evt.preventDefault();
				t.openMobileMenu();
			});
			this.mobile_nav_close_button.on('click.mio_menu__mobile__close_menu', function (evt) {
				evt.preventDefault();
				t.closeMobileMenu();
			});

		},

		unbindMobileEvents: function () {

			this.items_with_submenu_anchors.off('click.mio_menu__mobile__toggle_submenu');
			this.mobile_nav_button.off('click.mio_menu__mobile__open_menu');
			this.mobile_nav_close_button.off('click.mio_menu__mobile__close_menu');

		},

		checkForOverflowedSubmenus: function () {


			var body = $('html');
			body.css('overflow-x', '');

			var document_width = $(window).width();

			this.items_with_submenu.removeClass('is-submenu_on_left');

			this.submenus.show();

			var t = this;
			this.submenus.each(function () {
				var submenu = $(this);
				var adjusted = false;

				var is_top_level_on_s2 = (t.is_full_width_menu && submenu.parents('.sub-menu').length === 0);

				if (is_top_level_on_s2) { //Only on top-level menus on s2 header style
					submenu.css({
						'left': '50%',
						'right': '',
						'margin-left': ''
					});
				} else {
					submenu.css({
						'left': '',
						'right': ''
					});
				}

				var submenu_right_side_offset = (submenu.offset().left + submenu.outerWidth(true));

				if (submenu_right_side_offset > document_width) {
					adjusted = true;

					var is_third_level = ($(this).parents('.sub-menu').length > 0);

					if (is_third_level) {
						$(this).parent().addClass('is-submenu_on_left');
					}

					if (is_top_level_on_s2) {
						submenu.css({
							'margin-left': (document_width - submenu_right_side_offset)
						});
					} else {
						submenu.css({
							'left': 'auto',
							'right': (is_third_level) ? '100%' : '0'
						});
					}

				}

				//Additional check for S2 menus on left side
				if (is_top_level_on_s2 && adjusted === false) {

					var submenu_left_offset = submenu.offset().left,
						menu_left_offset = t.menu_wrap.offset().left;


					if (submenu_left_offset < menu_left_offset) {
						submenu.css({
							'margin-left': (menu_left_offset - submenu_left_offset)
						});
					}

				}

			});

			this.submenus.hide();

			body.css('overflow-x', 'hidden');

		},

		/*
		 * @param action 'show'|'hide'|'toggle'
		 */
		showHideSubmenu: function (element, action, slide) {
			slide = typeof slide === 'undefined' ? false : true;

			if (action === 'toggle') {
				action = (element.data('mio_hovering') === true) ? 'hide' : 'show'; //If submenu is open, close it and vice versa
			}

			element.data('mio_hovering', (action === 'show'));

			var submenu = element.children('.sub-menu');

			element.children('span').toggleClass('opened');


			//submenu.velocity( 'stop' ).velocity( velocity_action, { duration: 200, complete: complete_function } );

			if (action === 'show') {
				submenu.show();

			} else {
				submenu.hide();
			}

		},


		/*
		 * If we detect click on parent and submenu is not visible at this time - it was probably tap and we want just to show submenu
		 */
		checkForTap: function (evt, anchor_element) {

			//Prevent clicks legacy event
			evt.preventDefault();
			anchor_element.on('click.mio_menu__desktop__prevent_click', function (evt) {
				evt.preventDefault();
			});

			//Add placeholder items
			if (this.placeholders_added === false) {
				this.addPlaceholderItems();
			}

			//Close all other parent submenus - only on desktop menu
			if (this.is_mobile_menu === false) {
				this.closeAllOpenSubmenus(anchor_element.parent());
			}

			//Open submenu
			this.showHideSubmenu(anchor_element.parent(), 'show');


			//Close on tap outside menu
			this.bindCloseSubmenuOnClickOutside(anchor_element.parent());

		},

		bindCloseSubmenuOnClickOutside: function (submenu_parent) {

			this.items_with_submenu.on('click', function (evt) {
				evt.stopPropagation();
			});

			var t = this;
			$(document).on('click.mio__front_menu__close_submenu', function () {
				t.showHideSubmenu(submenu_parent, 'hide');
				$(document).off('click.mio__front_menu__close_submenu');
			});

		},

		/*
		 * @param jQuery li-element of currently clicked submenu - it's parent submenu won't be closed
		 */
		closeAllOpenSubmenus: function (clicked_parent) {
			clicked_parent = clicked_parent || false;

			var open_menus = this.items_with_submenu.filter(function () {
				var submenu_parent = $(this);
				if (clicked_parent !== false) {
					if (submenu_parent.is(clicked_parent.parents('ul:first').parent('li'))) return false; //We don't want to close parent submenu_wrapper of current submenu wrapper
				}
				return submenu_parent.data('mio_hovering'); //Mio hovering is also indicating, if current menu is open
			});

			var t = this;
			open_menus.each(function () {
				t.showHideSubmenu($(this), 'hide');
			});
		},

		addPlaceholderItems: function () {

			this.items_with_submenu.each(function () {
				var parent = $(this),
					new_element = parent.clone().empty().removeClass('menu-item-has-children');
				new_element.append(parent.clone().children('a'));
				parent.find('.sub-menu:first').prepend(new_element);
			});

			this.checkForOverflowedSubmenus();

			this.placeholders_added = true;

		},

		toggleMobileMenu: function () {

			var menu_open = this.menu_wrap.is(':visible');

			if (menu_open) this.menu_wrap.hide();
			else this.menu_wrap.show();

			if (menu_open) {
				$('.mobile_nav_menu').show();


			} else {
				$('.mobile_nav_close').show();

			}

		},

		openMobileMenu: function () {
			this.menu_wrap.addClass('open');
			this.menu_wrap.before('<div class="mw_mobile_nav_close_overlay"></div>');
			var t = this;
			$('.mw_mobile_nav_close_overlay').click(function () {
				t.closeMobileMenu();
			});
			$('body').addClass('mobile_menu_opened');
			//$('body').on('wheel.mio__front_menu__noscroll mousewheel.mio__front_menu__noscroll', function () {return false;});
		},

		closeMobileMenu: function () {
			this.menu_wrap.removeClass('open');
			$('.mw_mobile_nav_close_overlay').remove();
			$('body').removeClass('mobile_menu_opened');
			//$('body').off('wheel.mio__front_menu__noscroll mousewheel.mio__front_menu__noscroll');
		}


	};


	//Dom ready
	$(function () {
		FrontMenu.init();
	});

	//Menu changed in editor
	$(document).on('mio_editor__replaced_menu', function () {
		FrontMenu.unbindDesktopEvents();
		FrontMenu.unbindMobileEvents();
		FrontMenu.init();
	});


})(jQuery);

function reload_replaced_header_menu() {
	jQuery(document).trigger("mio_editor__replaced_menu");
}
