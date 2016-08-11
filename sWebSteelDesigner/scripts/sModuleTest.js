(function () {

    var privateTest = "private";

    window.orderModule = {
        getPrivateProp: function () {
            //some code
            return privateTest;
        }
    };

})()
