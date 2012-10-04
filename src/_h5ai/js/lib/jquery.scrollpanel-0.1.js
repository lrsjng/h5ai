/*! jQuery.scrollpanel 0.1 - //larsjung.de/scrollpanel - MIT License */

(function ($) {
	'use strict';

	var $window = $(window),

		name = 'scrollpanel',

		defaults = {
			prefix: 'sp-'
		},

		// Scrollpanel
		// ===========
		ScrollPanel = function (element, options) {

			var self = this;

			// Main reference.
			self.$el = $(element);

			self.settings = $.extend({}, defaults, options);
			var prefix = self.settings.prefix;

			// Mouse offset on drag start.
			self.mouseOffsetY = 0;
			// Interval ID for automatic scrollbar updates.
			self.updateId = 0;

			// Proxy to easily bind and unbind this method.
			self.scrollProxy = $.proxy(self.scroll, self);

			// Make content space relative, if not already.
			if (!self.$el.css('position') || self.$el.css('position') === 'static') {
				self.$el.css('position', 'relative');
			}


			// Create scrollbar.
			self.$scrollbar = $('<div class="' + prefix + 'scrollbar" />');
			self.$thumb = $('<div class="' + prefix + 'thumb" />').appendTo(self.$scrollbar);

			// Wrap element's content and add scrollbar.
			self.$el
				.addClass(prefix + 'host')
				.wrapInner('<div class="' + prefix + 'viewport"><div class="' + prefix + 'container" /></div>')
				.append(self.$scrollbar);

			// // Get references.
			self.$viewport = self.$el.find('> .' + prefix + 'viewport');
			self.$container = self.$viewport.find('> .' + prefix + 'container');


			// Host
			// ----
			self.$el

				// Handle mouse wheel.
				.on('mousewheel', function (event, delta, deltaX, deltaY) {

					self.$viewport.scrollTop(self.$viewport.scrollTop() - 50 * deltaY);
					self.update();
					event.preventDefault();
					event.stopPropagation();
				})

				// Handle scrolling.
				.on('scroll', function () {

					self.update();
				});


			// Viewport
			// --------
			self.$viewport

				// Basic styling.
				.css({
					paddingRight: self.$scrollbar.outerWidth(true),
					height: self.$el.height(),
					overflow: 'hidden'
				});


			// Container
			// ---------
			self.$container

				// Basic styling.
				.css({
					overflow: 'hidden'
				});


			// Srollbar
			// --------
			self.$scrollbar

				// Basic styling.
				.css({
					position: 'absolute',
					top: 0,
					right: 0,
					overflow: 'hidden'
				})

				// Handle mouse buttons.
				.on('mousedown', function (event) {

					self.mouseOffsetY = self.$thumb.outerHeight() / 2;
					self.onMousedown(event);
				})

				// Disable selection.
				.each(function () {

					self.onselectstart = function () {

						return false;
					};
				});


			// Scrollbar Thumb
			// ---------------
			self.$thumb

				// Basic styling.
				.css({
					position: 'absolute',
					left: 0,
					width: '100%'
				})

				// Handle mouse buttons.
				.on('mousedown', function (event) {

					self.mouseOffsetY = event.pageY - self.$thumb.offset().top;
					self.onMousedown(event);
				});

			// Initial update.
			self.update();
		};

		// Scrollpanel methods
		// ===================
		$.extend(ScrollPanel.prototype, {

			// Rerender scrollbar.
			update: function (repeat) {

				var self = this;

				if (self.updateId && !repeat) {
					clearInterval(self.updateId);
					self.updateId = 0;
				} else if (!self.updateId && repeat) {
					self.updateId = setInterval(function() {
						self.update(true);
					}, 50);
				}

				self.$viewport.css('height', self.$el.height());

				var visibleHeight = self.$el.height(),
					contentHeight = self.$container.outerHeight(),
					scrollTop = self.$viewport.scrollTop(),
					scrollTopFrac = scrollTop / contentHeight,
					visVertFrac = Math.min(visibleHeight / contentHeight, 1),
					scrollbarHeight = self.$scrollbar.height();

				if (visVertFrac < 1) {
					self.$scrollbar
						.css({
							height: self.$el.innerHeight() + scrollbarHeight - self.$scrollbar.outerHeight(true)
						})
						.fadeIn(50);
					self.$thumb
						.css({
							top: scrollbarHeight * scrollTopFrac,
							height: scrollbarHeight * visVertFrac
						});
				} else {
					self.$scrollbar.fadeOut(50);
				}
			},

			// Scroll content according to mouse position.
			scroll: function (event) {

				var self = this,
					clickFrac = (event.pageY - self.$scrollbar.offset().top - self.mouseOffsetY) / self.$scrollbar.height();

				self.$viewport.scrollTop(self.$container.outerHeight() * clickFrac);
				self.update();
				event.preventDefault();
				event.stopPropagation();
			},

			// Handle mousedown events on scrollbar.
			onMousedown: function (event) {

				var self = this;

				self.scroll(event);
				self.$scrollbar.addClass('active');
				$window
					.on('mousemove', self.scrollProxy)
					.one('mouseup', function (event) {

						self.$scrollbar.removeClass('active');
						$window.off('mousemove', self.scrollProxy);
						self.scroll(event);
					});
			}
		});


	// Register the plug in
	// --------------------
	$.fn[name] = function (options, options2) {

		return this.each(function () {

			var $this = $(this),
				scrollpanel = $this.data(name);

			if (!scrollpanel) {
				scrollpanel = new ScrollPanel(this, options);
				scrollpanel.update();
				$this.data(name, scrollpanel);
			}

			if (options === 'update') {
				scrollpanel.update(options2);
			}
		});
	};

}(jQuery));
