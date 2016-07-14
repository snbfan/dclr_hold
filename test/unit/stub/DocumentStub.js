var DocumentStub = function () {

    var appendChild = {
        appendChild: function() {}
    };

    return {
        getElementById: function() {
            return appendChild;
        },
        createElement: function(param) {
            return appendChild;
        },
        getElementsByClassName: function() {
            return [appendChild];
        }
    }
};