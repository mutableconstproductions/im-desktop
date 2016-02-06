'use strict';

let myApp = angular.module('myApp', []);

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
        let packet = {
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
    let self = this;
    // globally set uuidIdentity from main process
    self.identity = uuidIdentity;
    self.contacts = [];
    self.messageThread = "";
    self.currentContact = null;

    Contact.getContacts(self.identity).then(function(response) {
        self.contacts = response.data.data;
        // TODO check to see if exists? 
        self.contacts.map(function(contact) { contact.thread = []; });
        // TODO dont do this
        self.currentContact = self.contacts[0];
    });

    self.send = function() {
        Message.sendMessage(self.identity, self.currentContact.mobile, self.currentMessage);
        let displayedMessage = 'Me: ' + self.currentMessage + "\n";
        self.currentContact.thread.push(displayedMessage);
        self.messageThread += displayedMessage;
        self.currentMessage = '';
    }

    self.switchContact = function(mobile) {
        self.currentContact = self.contacts.filter(function(contact) { return contact.mobile === mobile; })[0];
        self.messageThread = self.currentContact.thread.reduce(function(all, it) { return all + it; }, '');
    }
});
