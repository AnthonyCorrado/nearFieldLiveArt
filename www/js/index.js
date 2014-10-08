var tapArt = angular.module('tapArtApp', ['ngAnimate', 'firebase']);

tapArt.controller('StyleCtrl', ['$scope', '$window', '$timeout', 'windowSize', 'stylesheetModel', '$firebase', function ($scope, $window, $timeout, windowSize, stylesheetModel, $firebase) {

var nfcRef = new Firebase('https://nfctest.firebaseio.com/liveVars');
var tagVar = 0;
var app = {
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    onDeviceReady: function() {
    app.receivedEvent('deviceready');

    // Read NDEF formatted NFC Tags
    nfc.addNdefListener (
        function (nfcEvent) {
            var tag = nfcEvent.tag,
                ndefMessage = tag.ndefMessage;

            tagVar = nfc.bytesToString(ndefMessage[0].payload).substring(3);
            if(tagVar < 5){
                nfcRef.update({
                    scene: tagVar
                });
            }
            else if (tagVar >= 10){
                nfcRef.update({
                    cloudScene: tagVar
                });
            }
        },
        function () { // success callback
            alert("Waiting for NDEF tag");
        },
        function (error) { // error callback
            alert("Error adding NDEF listener " + JSON.stringify(error));
        }
    );
},
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};
app.initialize();

    // firebase setup for real-time db sync
    var sync = $firebase(nfcRef);
    var syncObject = sync.$asObject();
    syncObject.$bindTo($scope, "scene");
    sync.$update({scene: tagVar});

    // triggers function call on nfc tag. 
    nfcRef.child('scene').on('value', function(snapshot) {
        var newScene = snapshot.val();
        $scope.sunStyle = stylesheetModel.theSun[newScene];
        if (newScene == 3) {
            var stringThis = stylesheetModel.fxScreen[newScene];
            $scope.fxScreen = stringThis.toString();
        }
        else {
            var stringThis = stylesheetModel.fxScreen[0];
            $scope.fxScreen = stringThis.toString();
        }
    });
    nfcRef.child('cloudScene').on('value', function(snapshot) {
        var newScene = snapshot.val();
        $scope.cloud1Style = stylesheetModel.cloud1[newScene];
        $scope.cloud2Style = stylesheetModel.cloud2[newScene];
    });

}]);

tapArt.factory('stylesheetModel', function() {
    var mainCSS = {
        cloud1: {
            10: '20%', 11: '50%'
        },
        cloud2: {
            10: '60%', 11: '10%'
        },
        theSun: {
            0: '100%', 1: '0%', 2:'10%', 3: '22%', 4: '40%'
        },
        fxScreen: {
            0: 'rgba(0, 0, 0, 0)', 3: 'rgba(160, 20, 160, 0.4)'
        }
    };
    return mainCSS;
});

// outputs window dimensions for active scaling
tapArt.factory('windowSize', function($window) {
    return function ($scope) {
        $scope.intialWindowSize = function () {
            var windowWide = $window.innerWidth;
            var windowHigh = $window.innerHeight;
            return { winWidth: windowWide, winHeight: windowHigh };
        };
        return angular.element($window).bind('resize', function() {
            $scope.initialWindowSize();
            console.log($scope.initialWindowSize());
            return $scope.$apply();
        });
    };

});

tapArt.directive('rescale', function($window, $timeout) {
    return function ($scope) {
        $scope.initializeWindowSize = function() {
            $scope.windowHeight = $window.innerHeight;
            return $scope.windowWidth = $window.innerWidth;
        };
        $scope.initializeWindowSize();
        return angular.element($window).bind('resize', function() {
            $scope.initializeWindowSize();
            return $scope.$apply();
        });
    };
});