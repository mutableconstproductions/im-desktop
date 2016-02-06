var myApp = angular.module('myApp', []);

myApp.factory('Contact', function($http) {
    function getContacts(uuid) {
        return $http({
            method: 'GET',
            url: 'http://localhost:8080/getContacts?' + 'uuid=' + uuid
        }).success(function(response) {
            return response;
        }).error(function() {
            return null;
        });
    };



    return {
        getContacts: getContacts
    };
});

myApp.factory('Message', function($http) {
    function sendMessage(uuid, mobile, text) {
        var packet = {
            text: text,
            mobile: mobile,
            clientFrom: uuid
        };

        return $http({
            method: 'POST',
            url: 'http://localhost:8080/sendMessage',
            data: packet
        }).success(function(response) {
            return response;
        }).error(function() {
            return null;
        });
    };

    return {
        sendMessage: sendMessage
    };
});


myApp.controller('MyCtrl', function($scope, Contact, Message) {
    var self = this;
    self.identity = uuidIdentity;
    self.contacts = null;

    Contact.getContacts(self.identity).then(function(response) {
        self.contacts = response.data.data;
    });

    self.send = function() {
        Message.sendMessage(self.identity, '555-5555', self.currentMessage);
        self.currentMessage = null;
    }
});
