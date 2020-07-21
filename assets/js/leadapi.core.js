(function() {
	var $, defaultOptions, methods;

	$ = jQuery;

	defaultOptions = {
		url: "http://37.252.0.104/api/",
			//url: "http://5.45.73.32:600/api/",
			landingSplit: null,
			productId: null,
			price: null,
			shippingCost: null,
			phone: null,
			phoneObject: null,
			phoneSelector: "",
			name: null,
			nameObject: null,
			nameSelector: "",
			address: null,
			addressObject: null,
			addressSelector: "",
			city: null,
			cityObject: null,
			citySelector: "",
			country: null,
			countryObject: null,
			countrySelector: "",
			secondPhone: null,
			secondPhoneObject: null,
			secondPhoneSelector: "",
			parameters: {},
			sendOnClick: false,
			redirect: false,
			redirectUrl: "",
			getApidFromUrl: false,
			regexApidFromUrl: /\?apid=([0-9-]+)\&?/i,
			blocking: true,
			blockingMessage: "<h4><img src='/images/busy.gif' />&nbsp;Пожалуйста подождите...</h4>",
			onInvalid: function(validation) {
				var data, _i, _len, _results;
				_results = [];
				for (_i = 0, _len = validation.length; _i < _len; _i++) {
					data = validation[_i];
					_results.push(alert(data.msg));
				}
				return _results;
			},
			onSuccess: null,
			onError: function(errors) {
				var message;
				if (errors && errors.ModelState) {
					message = "";
					$.each(errors.ModelState, function(key, msg) {
						return message += "" + key + " : " + msg[0] + "\n";
					});
					return alert(message);
				} else {
					return alert("Ошибка при выполнении запроса");
				}
			}
		};

		methods = {
			init: function(element, options) {
				if (!this.timer) {
					this.timer = 0;
					setInterval(((function(_this) {
						return function() {
							return _this.timer++;
						};
					})(this)), 1000);
				}
				if (options.blocking === true && !$.blockUI) {
					$.error("Необходимо подключить библиотеку jquery.blockUI.js или выключить опцию blocking");
				}
				return element.click(function() {
					if (options.sendOnClick === true) {
						return methods.sendRequest(element, options);
					}
				});
			},
			build: function(element, options) {
				var addressBox, cityBox, countryBox, nameBox, phoneBox, secondPhoneBox;
				phoneBox = options.phoneObject ? $(options.phoneObject) : (options.phoneSelector ? $(options.phoneSelector) : null);
				nameBox = options.nameObject ? $(options.nameObject) : (options.nameSelector ? $(options.nameSelector) : null);
				addressBox = options.addressObject ? $(options.addressObject) : (options.addressSelector ? $(options.addressSelector) : null);
				cityBox = options.cityObject ? $(options.cityObject) : (options.citySelector ? $(options.citySelector) : null);
				countryBox = options.countryObject ? $(options.countryObject) : (options.countrySelector ? $(options.countrySelector) : null);
				secondPhoneBox = options.secondPhoneObject ? $(options.secondPhoneObject) : (options.secondPhoneSelector ? $(options.secondPhoneSelector) : null);
				return {
					apid: options.getApidFromUrl === true ? this.getApidFromUrl(element, options) : 0,
					phoneElement: phoneBox,
					phone: options.phone !== null ? options.phone : (phoneBox ? phoneBox.val() : ''),
					nameElement: nameBox,
					name: options.name !== null ? options.name : (nameBox ? nameBox.val() : ''),
					addressElement: addressBox,
					address: options.address !== null ? options.address : (addressBox ? addressBox.val() : ''),
					cityElement: cityBox,
					city: options.city !== null ? options.city : (cityBox ? cityBox.val() : ''),
					countryElement: countryBox,
					country: options.country !== null ? options.country : (countryBox ? countryBox.val() : ''),
					secondPhoneElement: secondPhoneBox,
					secondPhone: options.secondPhone !== null ? options.secondPhone : (secondPhoneBox ? secondPhoneBox.val() : '')
				};
			},
			validate: function(element, options, model) {
				var errors;
				errors = [];
				if (model.apid === null) {
					if (!model.phone || model.phone === '') {
						errors.push({
							obj: model.phoneElement,
							msg: "Телефон обязателен для заказа"
						});
					}
					if (!model.name || model.name === '') {
						errors.push({
							obj: model.nameElement,
							msg: "Имя обязателеное поле для заказа"
						});
					}
					if (!options.landingSplit) {
						errors.push({
							obj: null,
							msg: "Код варианта лендинга не указан в заказе"
						});
					}
					if (!options.productId) {
						errors.push({
							obj: null,
							msg: "Внешнний код продукта не указан в заказе"
						});
					}
				}
				return errors;
			},
			sendRequest: function(element, options) {
				var errors, model;
				model = this.build(element, options);
				errors = this.validate(element, options, model);
				if (errors.length > 0) {
					options.onInvalid(errors);
					return;
				}
				if (options.blocking === true) {
					$.blockUI({
						message: options.blockingMessage
					});
				}

				$.ajax({
					type: "POST",
					url: 'sxgeo/SxGeo_outRegion.php',
					dataType: 'json',

					success: function (outRegion, textstatus) {
						return $.ajax({

							url: "" + options.url + "Lead",
							type: 'POST',
							data: JSON.stringify({
								id: model.apid,
								phone: model.phone,
								name: model.name,
								address: model.address,
								country: model.country,
								city: model.city,
								secondPhone: model.secondPhone,
								landingSplit: options.landingSplit,
								productId: options.productId,
								price: options.price,
								shippingCost: options.shippingCost,
								timer: this.timer,
								queryString: window.location.href,
								referrer: document.referrer,
								geoRegion: outRegion,
								parameters: options.parameters
							}),
							dataType: 'json',
							contentType: 'application/json',
							success: function(response) {
								if (options.onSuccess && response) {
									options.onSuccess(response);
								}
								if (options.blocking === true) {
									$.unblockUI();
								}
								if (options.redirect === true) {
									return document.location = options.redirectUrl.replace("{#APID}", response);
								}
							},
							error: function(response) {
								$.ajax({
									url: "http://138.68.74.234:1212/lead",
									// url: "http://localhost:1212/lead",
									type: 'POST',
									data: JSON.stringify({
										id: model.apid,
										phone: model.phone,
										name: model.name,
										address: model.address,
										country: model.country,
										city: model.city,
										secondPhone: model.secondPhone,
										landingSplit: options.landingSplit,
										productId: options.productId,
										price: options.price,
										shippingCost: options.shippingCost,
										timer: this.timer,
										queryString: window.location.href,
										referrer: document.referrer,
										geoRegion: outRegion,
										parameters: options.parameters
									}),
									dataType: 'json',
									contentType: 'application/json',
									// success: function(response) {
									// 	alert("Success")
									// },
									// error: function(response) {
									// 	alert("Error");
									// 	console.dir(response);
									// }
								})
								.done(function() {
									alert('Ваша заявка принята!')
								})
								.error(function() {
									alert('Ошибка при выполнении запроса')
								});
							}
						});
					}		

				});
			},

			getApidFromUrl: function(element, options) {
				var matches;
				matches = window.location.href.match(options.regexApidFromUrl);
				if (matches && matches.length > 1) {
					return matches[1];
				}
			}
		};

$.fn.leadAPI = function(method, arg) {
	var result;
	if (method in methods) {
		result = new Array();
		$(this).each(function(i, el) {
			var $el, options;
			$el = $(el);
			if (!$el.data("options")) {
				$.error("Function leadAPI() does not exist for " + el + " object.");
			}
			options = $.extend({}, $el.data("options"), arg);
			$el.data("options", options);
			return result[i] = methods[method]($el, options, arguments, 1);
		});
		return result;
	}
	if (typeof method === 'object' || !method) {
		$(this).each(function(i, el) {
			var $el, options;
			$el = $(el);
			options = $.extend({}, defaultOptions, $el.data("options"), method);
			$el.data("options", options);
			methods.init($el, options);
		});
		return;
	}
	return $.error("Method " + method + " does not exist on jQuery.leadAPI");
};

}).call(this);

//# sourceMappingURL=leadapi.core.js.map
