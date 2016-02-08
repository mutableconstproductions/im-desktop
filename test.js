'use strict';

let myApp = angular.module('myApp', []);

myApp.constant('Constants', {
    url: 'http://localhost:8080'
});

myApp.factory('Contact', function($http) {
    function getContacts(uuid) {
        return $http({
            method: 'GET',
            url: 'http://localhost:8080/getContacts?' + 'uuid=' + uuid
        }).success(function(response) {
            return response;
        }).error(function() {
            console.log('No response from getContacts.');
            return null;
        });
    };

    return {
        getContacts: getContacts
    };
});

myApp.factory('Message', function($http, Constants) {
    function sendMessage(uuid, mobile, text) {
        let packet = {
            text: text,
            mobile: mobile,
            clientId: uuid
        };

        return $http({
            method: 'POST',
            url: Constants.url + '/sendMessage',
            data: packet
        }).success(function(response) {
            return response;
        }).error(function() {
            return null;
        });
    };

    function getNewMessages(uuid, time) {
        return $http({
            method: 'GET',
            url: Constants.url + '/pollMessages?uuid=' + uuid + '&lastChecked=' + time
        }).success(function(response) {
            return response;
        }).error(function() {
            console.log('Error polling messages with uuid: ' + uuid + ' and time: ' + time);
            return null;
        });
    }

    return {
        sendMessage: sendMessage,
        getNewMessages: getNewMessages
    };
});


myApp.controller('MyCtrl', function($scope, Constants, Contact, Message) {
    let self = this;
    self.identity = uuidIdentity;
    self.contacts = [];
    self.contactsByMobile = {};
    self.messageThread = "";
    self.currentContact = null;
    self.lastSuccessFullMessagePoll = (new Date()).getTime();


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

    self.processNewMessages = function(messages) {
        self.lastSuccessFullMessagePoll = (new Date()).getTime();
        for (let msg of messages) {
            let contact = self.contactsByMobile[msg.mobile];
            let newMsg = contact.name + ': ' + msg.text + '\n';
            contact.thread.push(newMsg);
            if (self.currentContact.mobile === contact.mobile) {
                self.messageThread += newMsg;
            }
        }
    }

    Contact.getContacts(self.identity).then(function(response) {
        self.contacts = response.data.data;
        // TODO check to see if exists?
        self.contacts.map(function(contact) { contact.thread = []; });
        for (let contact of self.contacts) {
            self.contactsByMobile[contact.mobile] = contact;
        }
        // TODO dont do this
        self.currentContact = self.contacts[0];
    }).then(function() {
        window.setInterval(function() {
            Message.getNewMessages(self.identity, self.lastSuccessFullMessagePoll).then(function(response) {
                if (response !== null && response.data.length !== 0) {
                    self.processNewMessages(response.data);
                }
            });
        }, 2000);
    });
});
