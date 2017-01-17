function dealOps($rootScope, $scope, $http, $localStorage, $firebaseObject, $firebaseArray, $firebaseAuth, $location) {
	const apiUrl = "https://calcreator-d490f.firebaseio.com/";
	const hostingUrl = "http://calcreator.me/";
	const storageRef = firebase.storage().ref();

	var urlStrArr = $location.path().split("/");

	const ss = $scope.$storage;

	ss.options = ss.options ? ss.options : {};

	var dealsRef = firebase.database().ref();

	var myDeals = $firebaseObject(dealsRef);

	$scope.deals = myDeals;

	$scope.dealImages = $scope.dealImages ? $scope.dealImages : [];

	function downloadImages(pos, dealsPage) {
		// Create a reference to the file we want to download
		if (dealsPage) {
			for (var i = 1; i <= 5; i++) {
				var userImagesRefHead = storageRef.child(pos + i);
				// Get the download URL
				userImagesRefHead.getDownloadURL().then(function(url) {
					$scope.dealImages.push(url);
					console.log(url);
				}).catch(function(error) {
					console.log(error);
				});
			}
		} else {
			var userImagesRefHead = storageRef.child(pos);
			// Get the download URL
			userImagesRefHead.getDownloadURL().then(function(url) {
				ss.options.logo = url;
				console.log(ss.options.logo);
			}).catch(function(error) {
				console.log(error);
			});
		}
	};

	ss.options.bizNameFromUrl = decodeURIComponent(urlStrArr[urlStrArr.length - 1]);
	var nameToUse = ss.options.BizName;
	downloadImages(nameToUse + '/logo', false);
	if (urlStrArr[urlStrArr.length - 1] === 'make') {
		if (ss.options.BizName) {
			var lRef = firebase.database().ref(ss.options.BizName);

			var lDeals = $firebaseObject(lRef);

			$scope.loadedDeal = lDeals;

			$scope.loadedDeal = $scope.loadedDeal ? $scope.loadedDeal : {};
			// $scope.loadedDeal["$resolved"] = true;
		} else {
			$scope.loadedDeal = $scope.loadedDeal ? $scope.loadedDeal : {};
			$scope.loadedDeal["$resolved"] = true;
		}
	} else {
		nameToUse = urlStrArr[urlStrArr.length - 1];
		downloadImages(nameToUse + '/gal/', true);
		$http.get(apiUrl + nameToUse + ".json").then(function(response) {
			$scope.loadedDeal = response.data;
			$scope.loadedDeal.gal = $scope.loadedDeal;
			// success callback
		}, function(response) {
			// failure callback
			console.log(response.data);
		});
	}

	$scope.dealUrl = function() {
		return hostingUrl + '%23!/d/' + encodeURIComponent(ss.options.BizName) + "/";
	};

	$scope.uploadFiles = function(file, errFiles, pos) {
		window.setTimeout(function() {
			var url = file["$ngfBlobUrl"];
			console.log(url);
			console.log(file.size);

			var img = new Image();

			img.setAttribute('crossOrigin', 'anonymous');

			img.onload = function() {
				var canvas = document.createElement("canvas");
				canvas.width = this.width;
				canvas.height = this.height;
				if (file.size > 1000000) {
					canvas.width = this.width / 2;
					canvas.height = this.height / 2;
				}

				var ctx = canvas.getContext("2d");
				ctx.drawImage(this, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height);

				var dataURL = canvas.toDataURL("image/png");
				var cleaned = dataURL.replace(/^data:image\/(png|jpg);base64,/, "");

				firebase.storage().ref(pos).putString(cleaned, 'base64').then(function(snapshot) {
					console.log('Uploaded a base64 string!');
					console.log(snapshot);
					downloadImages(nameToUse + '/logo', false);
				});

				var lRef = firebase.database().ref(ss.options.BizName);
				var lDeals = $firebaseObject(lRef);
				$scope.loadedDeal = lDeals;
			};
			img.src = url;
		}, 2000);
	};

	$scope.deleteAllDeals = function() {

	};

	$scope.updateDeal = function(dealDescription, savings, dealStart, dealEnd) {
		var newDeal = {
			"description" : dealDescription,
			"savings" : savings,
			"start" : dealStart,
			"end" : dealEnd,
			"phone" : ss.options.pNum,
			"name" : ss.options.BizName,
			"logo" : $scope.loadedDeal.logo ? $scope.loadedDeal.logo : "-"
		};
		firebase.database().ref(ss.options.BizName).set(newDeal);
	};
}
