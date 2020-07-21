(function ($, window, document, undefined) {
	"use strict";
	var pluginName = 'countDown';
	var defaults = {
		  css_class:        'countdown'
		, always_show_days: false
		, with_labels:      true
		, with_seconds:     true
		, with_separators:  true
		, label_dd:         'дней'
		, label_hh:         'часов'
		, label_mm:         'минут'
		, label_ss:         'секунд'
		, separator:        ':'
		, separator_days:   ','
	};
	function CountDown(element, options) {
		this.element = $(element);
		this.options = $.extend({}, defaults, options);
		this._defaults = defaults;
		this._name = pluginName;
		this.init();
	}
	CountDown.prototype = {
		init: function () {
			if (this.element.children().length) {
				return;
			}
			if (this.element.attr('datetime')) {
				this.end_date = this.parseEndDate(this.element.attr('datetime'));
			}
			if (this.end_date === undefined) {
				this.end_date = this.parseEndDate(this.element.text());
			}
			if (this.end_date === undefined) {
				return;
			}
			if (this.element.is('time')) {
				this.time_element = this.element;
			} else {
				this.time_element = $('<time></time>');
				this.element.html(this.time_element);
			}
			this.markup();
			this.set_timeout_delay = this.sToMs(1);
			this.time_element.bind('time.elapsed', this.options.onTimeElapsed);
			this.doCountDown();
		}
		, sToMs: function (s) {
			return parseInt(s, 10) * 1000;
		}
		, mToMs: function (m) {
			return parseInt(m, 10) * 60 * 1000;
		}
		, hToMs: function (h) {
			return parseInt(h, 10) * 60 * 60 * 1000;
		}
		, dToMs: function (d) {
			return parseInt(d, 10) * 24 * 60 * 60 * 1000;
		}
		, msToS: function (ms) {
			return parseInt((ms / 1000) % 60, 10);
		}
		, msToM: function (ms) {
			return parseInt((ms / 1000 / 60) % 60, 10);
		}
		, msToH: function (ms) {
			return parseInt((ms / 1000 / 60 / 60) % 24, 10);
		}
		, msToD: function (ms) {
			return parseInt((ms / 1000 / 60 / 60 / 24), 10);
		}
		, parseEndDate: function (str) {
			var d, dd, hh, mm, ss, time_array;
			time_array = str.match(/^P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
			if (time_array) {
				 d = new Date();
				dd = time_array[1] ? this.dToMs(time_array[1]) : 0;
				hh = time_array[2] ? this.hToMs(time_array[2]) : 0;
				mm = time_array[3] ? this.mToMs(time_array[3]) : 0;
				ss = time_array[4] ? this.sToMs(time_array[4]) : 0;
				d.setTime(d.getTime() + dd + hh + mm + ss);
				return d;
			}
			time_array = str.match(
				/^(\d{4,})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2})(?:\:(\d{2}))?(?:\.(\d{1,3}))?([Z\+\-\:\d]+)?$/);
			if (time_array) {
				var offset = time_array[8] ? time_array[8].match(/^([\+\-])?(\d{2}):?(\d{2})$/) : undefined;
				var ms_offset = 0;
				if (offset) {
					ms_offset = this.hToMs(offset[2]) + this.mToMs(offset[3]);
					ms_offset = (offset[1] === '+') ? -ms_offset : ms_offset;
				}
				var now = new Date();
				now.setUTCHours(time_array[4] || 0);
				now.setUTCMinutes(time_array[5] || 0);
				now.setUTCSeconds(time_array[6] || 0);
				now.setUTCMilliseconds(time_array[7] || 0);
				now.setUTCDate(time_array[3]);
				now.setUTCMonth(time_array[2] - 1);
				now.setUTCFullYear(time_array[1]);
				now.setTime(now.getTime() + ms_offset);
				var local_offset = this.mToMs(new Date().getTimezoneOffset());
				if (local_offset !== ms_offset) {
					now.setTime(now.getTime() + local_offset);
				}
				return now;
			}
			time_array = str.match(/^(?:(\d+).+\s)?(\d+)[h:]\s?(\d+)[m:]?\s?(\d+)?[s]?(?:\.\d{1,3})?$/);
			if (time_array) {
				d = new Date();
				dd = time_array[1] ? this.dToMs(time_array[1]) : 0;
				hh = time_array[2] ? this.hToMs(time_array[2]) : 0;
				mm = time_array[3] ? this.mToMs(time_array[3]) : 0;
				ss = time_array[4] ? this.sToMs(time_array[4]) : 0;
				d.setTime(d.getTime() + dd + hh + mm + ss);
				return d;
			}
			d = Date.parse(str);
			if (!isNaN(d)) {
				return new Date(d);
			}
		}
		, markup: function () {
			var html = [];
			html.push(
				'<span class="item item-dd">',
					'<span class="dd"></span>',
					'<span class="label label-dd">', this.options.label_dd, '</span>',
				'</span>',
				'<span class="separator separator-dd">', this.options.separator_days, '</span>',
				'<span class="item item-hh">',
					'<span class="hh-1"></span>',
					'<span class="hh-2"></span>',
					'<span class="label label-hh">', this.options.label_hh, '</span>',
				'</span>',
				'<span class="separator">', this.options.separator, '</span>',
				'<span class="item item-mm">',
					'<span class="mm-1"></span>',
					'<span class="mm-2"></span>',
					'<span class="label label-mm">', this.options.label_mm, '</span>',
				'</span>',
				'<span class="separator separator-ss">', this.options.separator, '</span>',
				'<span class="item item-ss">',
					'<span class="ss-1"></span>',
					'<span class="ss-2"></span>',
					'<span class="label label-ss">', this.options.label_ss, '</span>',
				'</span>'
			);
			this.time_element.html(html.join(''));
			// Customize HTML according to options.
			if (!this.options.with_labels) {
				this.time_element.find('.label').remove();
			}
			if (!this.options.with_separators) {
				this.time_element.find('.separator').remove();
			}
			if (!this.options.with_seconds) {
				this.time_element.find('.item-ss').remove();
				this.time_element.find('.separator').last().remove();
			}
			this.item_dd       = this.time_element.find('.item-dd');
			this.separator_dd  = this.time_element.find('.separator-dd');
			this.remaining_dd  = this.time_element.find('.dd');
			this.remaining_hh1 = this.time_element.find('.hh-1');
			this.remaining_hh2 = this.time_element.find('.hh-2');
			this.remaining_mm1 = this.time_element.find('.mm-1');
			this.remaining_mm2 = this.time_element.find('.mm-2');
			this.remaining_ss1 = this.time_element.find('.ss-1');
			this.remaining_ss2 = this.time_element.find('.ss-2');
			this.time_element.addClass(this.options.css_class);
		}
		, doCountDown: function () {
			var ms = this.end_date.getTime() - new Date().getTime();
			var ss = this.msToS(ms);
			var mm = this.msToM(ms);
			var hh = this.msToH(ms);
			var dd = this.msToD(ms);
			if (ms <= 0) {
				ss = mm = hh = dd = 0;
			}
			this.displayRemainingTime({
				  'ss': ss < 10 ? '0' + ss.toString() : ss.toString()
				, 'mm': mm < 10 ? '0' + mm.toString() : mm.toString()
				, 'hh': hh < 10 ? '0' + hh.toString() : hh.toString()
				, 'dd': dd.toString()
			});
			if (!this.options.with_seconds && dd === 0 && mm === 0 && hh === 0) {
				this.time_element.trigger('time.elapsed');
				return;
			}
			if (dd === 0 && mm === 0 && hh === 0 && ss === 0) {
				this.time_element.trigger('time.elapsed');
				return;
			}
			var self = this;
			setTimeout(function () { self.doCountDown() }, self.set_timeout_delay);
		}
		, displayRemainingTime: function (remaining) {
			var attr = [];
			attr.push('P');
			if (remaining.dd !== '0') {
				attr.push(remaining.dd, 'D');
			}
			attr.push('T', remaining.hh, 'H', remaining.mm, 'M');
			if (this.options.with_seconds) {
				attr.push(remaining.ss, 'S');
			}
			this.time_element.attr('datetime', attr.join(''));
			if (!this.options.always_show_days && remaining.dd === '0') {
				this.item_dd.hide();
				this.separator_dd.hide();
			}
			this.remaining_dd.text(remaining.dd);
			this.remaining_hh1.text(remaining.hh[0]);
			this.remaining_hh2.text(remaining.hh[1]);
			this.remaining_mm1.text(remaining.mm[0]);
			this.remaining_mm2.text(remaining.mm[1]);
			this.remaining_ss1.text(remaining.ss[0]);
			this.remaining_ss2.text(remaining.ss[1]);
		}
	};
	$.fn[pluginName] = function (options) {
		if (options === undefined || typeof options === 'object') {
			return this.each(function () {
				if (!$.data(this, 'plugin_' + pluginName)) {
					$.data(this, 'plugin_' + pluginName, new CountDown(this, options));
				}
			});
		}
	};
})(window.jQuery, window, document);
