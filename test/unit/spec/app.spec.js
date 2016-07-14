describe('Tests for app.js : ', function () {
    'use strict';

    var scope, mainCtrl, controller,
        documentStub = DocumentStub(),
        ngTouch = ngTouchStub();

    beforeEach(function () {
        module('doclerapp', [ngTouch]);

        angular.mock.module(function($provide) {
            $provide.value('event', {which: 13});
        });

        inject(function ($rootScope, $httpBackend, $controller) {

            scope = $rootScope.$new();
            controller = $controller;
            mainCtrl = $controller('MainController', {
                '$scope': scope
            });
        });
    });

    describe('when application instantiates: ', function() {
        it('controller should initially set some scope values', function () {
            expect(scope.model).toEqual({width: 640, height: 480, nickname: ':D', message: '', page: 1});
            expect(scope.ranges).toEqual({height: {min:150, max:600, default: 480}, width: {min:200, max:800, default: 640}, page: {min:1, max:10}});
            expect(scope.views).toEqual({Chat:{active:true}, Photos:{active:false}, Settings:{active:false}});
        });
    });

    describe('moveToPage() method: ', function() {
        it('should not assign new $scope.model.page value if param is out of ranges', function() {
            scope.model.page = 1;
            spyOn(scope, 'setImageUrl');

            scope.moveToPage(15);

            expect(scope.model.page).toEqual(1);
            expect(scope.setImageUrl).not.toHaveBeenCalled();
        });

        it('should assign new $scope.model.page value if param is in ranges and call setImageUrl', function() {
            scope.model.page = 1;
            spyOn(scope, 'setImageUrl');

            scope.moveToPage(9);

            expect(scope.model.page).toEqual(9);
            expect(scope.setImageUrl).toHaveBeenCalled();
        });
    });

    describe('setActiveTab() method: ', function(){
        it('should correctly set "active" property on $scope.views', function() {
            spyOn(window, 'clearInterval');

            scope.setActiveTab('Photos');

            expect(scope.views.Photos.active).toEqual(true);
            expect(window.clearInterval).not.toHaveBeenCalled();
        });

        it('should reset blinkInterval if called with "Chat" param', function() {
            spyOn(window, 'clearInterval');

            scope.setActiveTab('Chat');

            expect(scope.views.Chat.active).toEqual(true);
            expect(mainCtrl.blinkInterval).toBeFalsy();
            expect(window.clearInterval).toHaveBeenCalledWith(mainCtrl.blinkInterval);
        });

    });

    describe('sendMessage() method: ', function() {
        it('should make a call to .addMessageToChatWindow()', function () {
            var message = '12345';

            scope.model.message = message;

            spyOn(mainCtrl, 'addMessageToChatWindow');
            scope.sendMessage();
            expect(mainCtrl.addMessageToChatWindow).toHaveBeenCalledWith(message, true);
            expect(scope.model.message).toEqual('');
        });
    });

    describe('keyPressProxy() method: ', function() {

        var triggerKeyPress = function(keyCode) {
            var event = document.createEvent('Event');
            event.which = keyCode;
            event.initEvent('keydown');
            document.dispatchEvent(event);
        };

        it('should make a call to $scope.sendMessage() if Enter is pressed', function () {
            spyOn(scope, 'sendMessage');

            document.addEventListener('keydown', function(e){
                scope.keyPressProxy();
            });

            // "Enter"
            triggerKeyPress(13);

            expect(scope.sendMessage).toHaveBeenCalled();
        });

        it('should not make a call to $scope.sendMessage() if not Enter is pressed', function () {
            spyOn(scope, 'sendMessage');

            document.addEventListener('keydown', function(e){
                scope.keyPressProxy();
            });

            // not "Enter"
            triggerKeyPress(14);

            expect(scope.sendMessage).not.toHaveBeenCalled();

        });
    });

    describe('toggleSettings() method: ', function () {
        it('should call getElementsByClassName and Array.prototype.forEach', function () {
            spyOn(document, 'getElementsByClassName').and.returnValue(documentStub.getElementsByClassName());
            spyOn(Array.prototype, 'forEach');

            scope.toggleSettings();

            expect(document.getElementsByClassName).toHaveBeenCalled();
            expect(Array.prototype.forEach).toHaveBeenCalled();
        });
    });

    describe('setImageUrl() method: ', function() {
        it('should correctly compile image url', function () {
            scope.model.width = 400;
            scope.model.height = 200;
            scope.model.page = 2;

            var expected = 'http://lorempixel.com/' + scope.model.width + '/' + scope.model.height + '/sports/' + scope.model.page;

            scope.setImageUrl();

            expect(scope.imageUrl).toEqual(expected);
        })
    });

    describe('getValidValue() method: ', function() {
        it('should return default value for given key if model[key] is out of range', function () {
            var expected = 640, res;
            scope.model.width = 1;
            res = mainCtrl.getValidValue('width');

            expect(res).toEqual(expected);
        });

        it('should return model[key] for given key if model[key] is in range', function () {
            var expected = 400, res;
            scope.model.width = expected;
            res = mainCtrl.getValidValue('width');

            expect(res).toEqual(expected);
        })
    });

    describe('startChatting() method: ', function () {
        it('should make a call to setInterval which emits event', function () {
            spyOn(scope, '$emit');
            spyOn(window, 'setInterval');

            mainCtrl.startChatting();

            expect(window.setInterval).toHaveBeenCalled();

            setTimeout(function() {
                expect(scope.$emit).toHaveBeenCalled();
            }, 4000);
        });
    });

    describe('notifyUser() method: ', function () {
        it('should make a call to blinkChatTab() when condition is met', function () {
            spyOn(mainCtrl, 'blinkChatTab');

            scope.views.Chat.active = false;
            mainCtrl.blinkInterval = undefined;

            mainCtrl.notifyUser();

            expect(mainCtrl.blinkChatTab).toHaveBeenCalled();
        });

        it('should make a call to blinkChatTab() when condition is met', function () {
            scope.views.Chat.active = false;
            mainCtrl.blinkInterval = true;

            spyOn(mainCtrl, 'blinkChatTab');
            mainCtrl.notifyUser();
            expect(mainCtrl.blinkChatTab).not.toHaveBeenCalled();
        });

    });

    describe('blinkChatTab() method: ', function () {
        it('should make a call to setInterval', function () {
            var chattab = {toggleClass:function() {}};
            spyOn(chattab, 'toggleClass');
            spyOn(window, 'setInterval');

            mainCtrl.blinkChatTab();

            expect(window.setInterval).toHaveBeenCalled();
            setTimeout(function() {
                expect(chattab.toggleClass).toHaveBeenCalled();
            }, 1000);
        });
    });

    describe('addMessageToChatWindow() method: ', function () {
        it('should return if message.length === 0', function () {
            mainCtrl.addMessageToChatWindow('', true);
            expect(mainCtrl.chatContainerNode).toBeFalsy();
        });

        it('should call document.getElementsByClassName if chatContainerNode is not defined', function () {
            mainCtrl.chatContainerNode = undefined;
            spyOn(document, 'getElementsByClassName').and.returnValue(documentStub.getElementsByClassName());
            mainCtrl.addMessageToChatWindow('12345', true);
            expect(document.getElementsByClassName).toHaveBeenCalled();
        });

        it('should not call document.getElementsByClassName if chatContainerNode is defined', function () {
            mainCtrl.chatContainerNode = documentStub.getElementsByClassName()[0];
            spyOn(document, 'getElementsByClassName');
            mainCtrl.addMessageToChatWindow('12345', true);
            expect(document.getElementsByClassName).not.toHaveBeenCalled();
        });
    });

    describe('start() method: ', function() {
        it('should make a call to $scope.$on()', function () {
            spyOn(scope, '$on');
            mainCtrl.start();
            expect(scope.$on).toHaveBeenCalled();
        });

        it('should make a call to $scope.setImageUrl()', function () {
            spyOn(scope, 'setImageUrl');
            mainCtrl.start();
            expect(scope.setImageUrl).toHaveBeenCalled();
        });

        it('should make a call to .startChatting()', function () {
            spyOn(mainCtrl, 'startChatting');
            mainCtrl.start();
            expect(mainCtrl.startChatting).toHaveBeenCalled();
        });

        it('should call callback function when "message" event is caught', function() {
            var testText = '12345';

            spyOn(mainCtrl, 'addMessageToChatWindow');
            spyOn(mainCtrl, 'notifyUser');

            scope.$emit('message', {text: testText});

            expect(mainCtrl.addMessageToChatWindow).toHaveBeenCalledWith(testText);
            expect(mainCtrl.notifyUser).toHaveBeenCalled();
        })
    });
});
