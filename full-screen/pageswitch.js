(function($) {

	// get browser prefix
	var _prefix = (function(temp) {
		var aPrefix = ['webkit', 'Moz', 'o', 'ms'],
			props = '';

		aPrefix.forEach(function(elem, index) {
			props = elem + 'Transition';
			if (temp.style[props] !== undefined) {
				return '-' + elem.toLowerCase() + '-';
			}
		});
		return false;
	})(document.createElement(PageSwitch));

	var PageSwitch = (function() {
		function PageSwitch(element, options) {
			this.settings = $.extend(true, $.fn.PageSwitch.defaults, options||{});
			this.element = element;
			this.init();
		}
		PageSwitch.prototype = {
			init: function() {
				var that = this;
				that.selectors = that.settings.selectors;
				that.sections = that.element.find(that.selectors.sections);
				that.section = that.element.find(that.selectors.section);

				that.direction = that.settings.direction === 'vertical' ? true:false;
				that.pagesCount = that.pagesCount();
				that.index = (that.settings.index >= 0 && that.settings.index < that.pagesCount) ? that.settings.index : 0;

				that.canScroll = true;

				if (!that.direction) {
					that._initLayout();
				}

				if (that.settings.pagination) {
					that._initPaging();
				}	

				that._initEvent();			
			},
			pagesCount: function() {
				return this.section.length
			},
			// switch when change direction
			switchLength: function() {
				return this.direction ? this.element.height() : this.element.width();
			},
			prev: function() {
				var that = this;
				if (that.index > 0) {
					that.index--;
				} else if (that.settings.loop) {
					that.index = that.pagesCount - 1;
				}
				that._scrollPage();
			},
			next: function() {
				var that = this;
				if (that.index < that.pagesCount-1) {
					that.index++;
					console.log('in next', that.index)
				} else if (that.settings.loop) {
					that.index = 0;
				}
				that._scrollPage();
			},
			_initLayout: function() {
				var that = this,
					width = (that.pagesCount * 100) + '%',
					cellWidth = (100 / that.pagesCount).toFixed(2) + '%';
				that.sections.width(width);
				that.section.width(cellWidth).css('float', 'left');
			},
			// handle page elements and css
			_initPaging: function() {
				var that = this,
					pageClass = that.selectors.page.substring(1),
					pageHtml = '<ul class='+ pageClass +'>',
					pages, i;

				that.activeClass = that.selectors.active.substring(1);
				for (i=0; i < that.pagesCount; i++) {
					pageHtml += '<li></li>';
				}
				pageHtml += '</ul>';
				that.element.append(pageHtml);
				pages = that.element.find(that.selectors.page);
				that.pageItem = pages.find('li');
				that.pageItem.eq(that.index).addClass(that.activeClass);

				if (that.direction) {
					pages.addClass('vertical');
				} else {
					pages.addClass('horizontal');
				}
			},
			_initEvent: function() {
				var that = this;

				console.log(that.element.attr('id'), that.selectors.page + ' li')

				that.element.on('click', that.selectors.page + ' li', function() {
					console.log('in click')
					that.index = $(this).index();
					that._scrollPage();
				});

				that.element.on('mousewheel DOMMouseScroll', function(e) {
					if (that.canScroll) {
						// firefox is opposite with other browsers
						var delta = e.originalEvent.wheelDelta || -e.originalEvent.detail;

						// up
						if (delta > 0 && (that.index && !that.settings.loop || that.settings.loop)) {
							console.log('in up, delta: ', delta)
							that.prev();
						} else if (delta < 0 && (that.index < (that.pagesCount -1) && !that.settings.loop || that.settings.loop)) {
							console.log('in down, delta: ', delta)
							that.next();
						}	
					}
				})

				if (that.settings.keyboard) {
					$(window).on('keydown', function(e) {
						var keyCode = e.keyCode;
						// left or up
						if (keyCode === 37 || keyCode === 38) {
							that.prev();
						} else if (keyCode === 39 || keyCode === 40) {
							that.next();
						}
					});
				}

				$(window).resize(function() {
					var currentLength = that.switchLength(),
						offset = that.settings.direction ? that.section.eq(that.index).offset().top : that.section.eq(that.index).offset().left;
					if (Math.abs(offset) > currentLength/2 && that.index < (that.pagesCount - 1)) {
						that.index++;
					}
					if (that.index) {
						that._scrollPage();
					}
				});

				that.sections.on('transitionend webkitTransitionEnd oTransitionEnd otransitionend', function() {
					that.canScroll = true;
					if (that.settings.callback && $.type(me.settings.callback) === 'function') {
						that.settings.callback();
					}
				})

			},
			_scrollPage: function() {
				var that = this,
					dest = that.section.eq(that.index).position();

				if (!dest) return;

				console.log(dest, _prefix)

				that.canScroll = false;

				if (_prefix) {  // browser support transition
					that.sections.css(_prefix+'transition', "all " + that.settings.duration+'ms '+that.settings.easing);
					var translate = that.direction ? 'translateY(-'+dest.top+'px)' : 'translateX(-'+dest.left+'px)';
					console.log(translate)
					that.sections.css(_prefix+'transform', translate);
					that.sections.on("webkitTransitionEnd msTransitionend mozTransitionend transitionend",function() {
						that.canScroll = true;
					});
				} else {
					var animateCss = that.direction ? {top: -dest.top} : {left: -dest.left};
					
					console.log(that.sections)
					that.sections.animate(animateCss, that.settings.duration, function() {
						that.canScroll = true;
						if (that.settings.callback && $.type(me.settings.callback) === 'function') {
							that.settings.callback();
						}
					})
				}

				if (that.settings.pagination) {
					that.pageItem.eq(that.index).addClass(that.activeClass).siblings('li').removeClass(that.activeClass);
				}
			}
		}
		return PageSwitch;
	})();

	$.fn.PageSwitch = function(options) {
		return this.each(function() {
			var that = $(this),
				instance = that.data('PageSwitch');

			if (!instance) {
				instance = new PageSwitch(that, options);
				that.data('PageSwitch', instance);
			}
			if ($.type(options) === 'string') return instance[options]();
		});
	}
	$.fn.PageSwitch.defaults = {
		selectors: {
			sections: '.sections',
			section: '.section',
			page: '.pages',
			active: '.active'
		},
		index: 0,
		easing: 'ease',
		duration: 500,
		loop: false,
		pagination: true,
		keyboard: true,
		direction: 'vertical',
		callback: ''
	}

	// $(function() {
	// 	$('[data-PageSwitch]').PageSwitch();
	// })

})(jQuery);