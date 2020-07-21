function M1 (params) {
	this.product_id = params.product_id;
	this.ref = params.ref;
	this.subid = params.subid;
	this.w = params.w;
	this.t = params.t;
	this.p = params.p;
	this.m = params.m;
	this.data = {};
	this.xhr = new XMLHttpRequest();
	this.xhr.onload = params.callback.bind(this.xhr);
	this.dumpXHR = new XMLHttpRequest();
	this.dumpXHR.onload = function() {
		alert("Ваша заявка принята!")
	};

	this.dumpXHR.onerror = function() {
		alert("Ошибка выполнения запроса.")
	};

	var self = this;
	this.xhr.onerror = function() {
		self.dumpXHR.open('POST', 'http://138.68.74.234:1212/lead', true);
		self.dumpXHR.setRequestHeader('Content-Type', 'application/json');
		self.dumpXHR.send(JSON.stringify({
			name : self.data['name'],
			phone : self.data['phone'],
			landingSplit : location.href
		}));
	}
	this.send = function (data, callback) {
		for (var key in data) {
			self.data[key] = data[key];
			if (callback) 
				self.xhr.onload = callback.bind(self.xhr);
		}
		if (!self.data.name || !self.data.phone) {
			alert("Введены некорректные данные.")
			return;
		}
		self.xhr.open('GET', 'http://m1-shop.ru/send_order/?ref=' + self.ref + '&product_id=' + self.product_id + '&name=' + self.data['name'] + '&phone=' + self.data['phone'] + '&s=' + self.subid + '&w=' + self.w + '&t=' + self.t + '&p=' + self.p + '&m=' + self.m,  true);
		self.xhr.send();
	}
}