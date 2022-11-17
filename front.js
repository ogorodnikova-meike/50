jQuery(function ($) {

	$('.mw_element_item_popup .mw_element_item_title a, .mw_element_item_popup .mw_element_item_image_hover').mwElementPopup();

	// TODO JQMIGRATE: jQuery.hover is deprecated, use "mouseenter" and "mouseleave" events (https://stackoverflow.com/a/13004732)
	$("#member_user_avatar").hover(
		function () {
			$(this).addClass('member_user_menu_open');
			$(this).removeClass('member_user_menu_close');
		},
		function () {
			$(this).removeClass('member_user_menu_open');
			$(this).addClass('member_user_menu_close');
		});

	//show user profile
	$("#member_show_profile").click(function () {
		$("#member_profile_background").show();
		$("#member_profile").show();
		return false;
	});
	$("#member_close_profile").click(function () {
		$("#member_profile_background").hide();
		$("#member_profile").hide();
		return false;
	});

	//news
	$(".member_new_show_text").click(function () {
		$(this).closest(".mw_element_item_description").find(".member_new_short").toggle();
		$(this).closest(".mw_element_item_description").find(".member_new_text").toggle();
		return false;
	});

	$('.el_mem_checklist').on('click', 'li', function () {
		var checkbox = this;
		$('.mem_checklist_checkbox', checkbox).toggleClass('mem_checklist_checkbox_checked');

		if ($('.mem_checklist_checkbox', checkbox).hasClass('mem_checklist_checkbox_checked')) {
			$('input', checkbox).attr('checked', true);
		} else {
			$('input', checkbox).attr('checked', false);
		}
		var form = $(this).closest('form');
		$.post(ajaxurl, 'action=save_element_data&' + form.serialize(), function (data) {
		});
	});

	mw_init_register_form('.mw_member_register_form');
});

function mw_init_register_form(target) {
	jQuery(target).mwForm({
		onsubmit: function (self, $form) {
			var form = $form.serialize();
			var loading = self.$el.find("button span.loading");
			loading.show();
			jQuery.post(ajaxurl, 'action=send_registration_form&' + form, function (data) {
				console.log(data);
				if (data.redirect) {
					if (data.target) {
						window.parent.location = data.redirect;
					} else {
						window.location = data.redirect;
					}
				}

				self.showMessage(data);
				loading.hide();

			}).fail(function (data) {
				self.showMessage({'sended': 'error', 'message': mem_front_texts.reg_nosended});
				loading.hide();

			});

		}
	});
}
