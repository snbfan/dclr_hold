/* global angular */
angular.module('doclerapp', ['ngTouch']).controller('MainController', function($scope) {
    'use strict';

    var self = this;

    // template that will be populated with model values
    self.imageUrlTpl = 'http://lorempixel.com/%width%/%height%/sports/%number%';

    // how often to "receive" a message in chat
    self.chatMessageInteval = 3000;

    // carousel ranges
    $scope.ranges = {height: {min:150, max:600, default: 480}, width: {min:200, max:800, default: 640}, page: {min:1, max:10}};

    // model
    $scope.model = {width: 640, height: 480, nickname: ':D', message: '', page: 1};

    // views mapping
    $scope.views = {Chat:{active:true}, Photos:{active:false}, Settings:{active:false}};


    /**
     * Carousel left-right
     *
     * @param {Number} page Number of the image in carousel
     */
    $scope.moveToPage = (page) => {
        if (page < $scope.ranges.page.min || page > $scope.ranges.page.max) {
            return false;
        }

        $scope.model.page = page;
        $scope.setImageUrl();
    };


    /**
     * Sets active tab
     *
     * @param {String} key Name of the tab
     */
    $scope.setActiveTab = (key) => {
        for(var i in $scope.views) {
            $scope.views[i].active = i === key;
        }

        if ($scope.views.Chat.active) {
            clearInterval(self.blinkInterval);
            self.blinkInterval = undefined;
        }
    };


    /**
     * Wrapper around message processing
     */
    $scope.sendMessage = () => {
        self.addMessageToChatWindow($scope.model.message, true);
        $scope.model.message = '';
    };


    /**
     * Handler for "Enter" button press in the input field
     */
    $scope.keyPressProxy = () => {
        // "Enter" ? submit : do nothing
        if (event.which === 13) {
            $scope.sendMessage();
        }
    };


    /**
     * Accordion DOM manipulations (instead of bootstrap script)
     */
    $scope.toggleSettings = () => {
        var settings = document.getElementsByClassName("panel-collapse collapse"),
            arrows =  document.getElementsByClassName("glyphicon-collapsible");

        Array.prototype.forEach.call(settings, function(item, i) {
            var currentItem = angular.element(item);
            currentItem.toggleClass('in');

            angular.element(arrows[i])
                .toggleClass('glyphicon-triangle-right', !currentItem.hasClass('in'))
                .toggleClass('glyphicon-triangle-bottom', currentItem.hasClass('in'));
        });
    };


    /**
     * Compiles a url for lorempixel service
     */
    $scope.setImageUrl = () => {
        $scope.imageUrl = self.imageUrlTpl
            .replace('%width%', self.getValidValue('width'))
            .replace('%height%', self.getValidValue('height'))
            .replace('%number%', $scope.model.page);
    };


    /**
     * Returns valid width/height value
     *
     * @param {String} key Key in the model (width/height)
     * @returns {Number} val Valid value for $scope.ranges[key]
     */
    self.getValidValue = (key) => {
        var val = parseInt($scope.model[key]);
        return val >= $scope.ranges[key].min && val <= $scope.ranges[key].max ? val : $scope.ranges[key].default;
    };


    /**
     * Chat emulation, sends exact time once in self.chatMessageInterval milliseconds
     */
    self.startChatting = () => {
        setInterval(function() {
            $scope.$emit('message', {text: 'The time is: ' + (new Date()).toUTCString()});
        }, self.chatMessageInteval);
    };


    /**
     * Manages "Chat" tab blinking when message arrives
     */
    self.notifyUser = () => {
        if (!$scope.views.Chat.active && !self.blinkInterval) {
            self.blinkChatTab();
        }
    };


    /**
     * DOM manipulation for tab blinking
     */
    self.blinkChatTab = () => {
        var chattab = angular.element(document.getElementById('chattab'));
        self.blinkInterval = setInterval(function() {
            chattab.toggleClass('active');
        }, 700);
    };


    /**
     * Handles DOM manipulation for new chat messages
     *
     * @param {String} message Chat message
     * @param {Boolean} sentByMy Flag indicates if message was sent by current client
     */
    self.addMessageToChatWindow = (message, sentByMe) => {

        if (message.length === 0) {
            return;
        }

        self.chatContainerNode = self.chatContainerNode || document.getElementsByClassName("chat-container")[0];

        var span = document.createElement('span');
            span.className = (sentByMe) ? 'chat-message bg-info pull-right' : 'chat-message bg-warning pull-left';
            span.innerText = message;

        var p = document.createElement('div');
            p.className = 'clearfix';
            p.appendChild(span);

        // insert new chat node into chat container
        self.chatContainerNode.appendChild(p);
        // and scroll to the latest message
        self.chatContainerNode.scrollTop = self.chatContainerNode.scrollHeight;
    };


    /**
     * Start point
     */
    self.start = () => {
        // listen for chat messages
        $scope.$on('message', function(event, data) {
            self.addMessageToChatWindow(data.text);
            self.notifyUser();
        });

        // start chat backend mock
        self.startChatting();

        // set img url
        $scope.setImageUrl();
    };

    self.start();
});