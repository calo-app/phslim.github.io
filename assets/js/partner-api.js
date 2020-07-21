function CPA (params) {
	// this.server = 'http://localhost:1212/lead';
	 this.server = 'http://139.59.141.218:1212/lead';
	//this.server = 'http://31.31.201.90:1212/lead';
	this.url = params.url;
	this.data = params.data;
	this.method = params.method;

	var waitWindow = document.createElement('div');
	waitWindow.innerHTML = 'Пожалуйста, подождите...';
	waitWindow.style.background = '#fff';
	waitWindow.style.color = '#000';
	waitWindow.style.width = '90%'; 
	waitWindow.style.maxWidth = '400px'; 
	waitWindow.style.padding = '20px 5%'; 
	waitWindow.style.position = 'fixed';
	waitWindow.style.top = screen.height / 2 - 30 + 'px'; 
	waitWindow.style.left = screen.width / 2 - 200 + 'px';
	if (screen.width < 400) {
		waitWindow.style.left = 0;
	} 

	this.xhr = new XMLHttpRequest();
	var self = this;
	this.xhr.onload = function() {
		console.log(waitWindow);
		waitWindow.style.display = 'none'; 
		params.callback.bind(self.xhr)();
	};
	this.dumpXHR = new XMLHttpRequest();
	this.dumpXHR.onload = function() {
		waitWindow.style.display = 'none'; 
		alert("Ваша заявка принята!");
	};

	this.dumpXHR.onerror = function() {
		alert("Ошибка выполнения запроса.")
	};

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
		document.body.appendChild(waitWindow);
		self.xhr.open('POST', self.server, true);
		self.xhr.setRequestHeader('Content-Type', 'application/json');
		for (var key in data) {
			self.data[key] = data[key];
			if (callback) {
				self.xhr.onload = function() {
					waitWindow.style.display = 'none'; 
					callback.bind(self.xhr)();
				}
			}
		}
		if (!self.data.name || !self.data.phone) {
			alert("Введены некорректные данные.")
			return;
		}
		self.xhr.send(JSON.stringify({
			url : self.url,
			data : self.data,
			method : self.method
		}));
	}
}
