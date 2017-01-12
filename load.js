function load(){
    var selector = document.getElementById("load-slct");
    globalModel.name = selector.options[selector.selectedIndex].text;
    fireDB.ref('/models/' + globalModel.name).on("value", function(snapshot) {globalModel.model=snapshot.val(); console.log(snapshot.val())});
    localStorage.setItem("globalName",globalModel.name);
    window.location = 'OPCloud.html';
};

var names = [];
fireDB = firebase.database();
var models = fireDB.ref('/models/');
models.on("value", function(snapshot) {
    console.log(snapshot.val());
    snapshot.forEach(function(child) {
        var nname = child.V.path.o[1];
        names.push(nname);
        console.log(names);
        });
        var select = document.getElementById("load-slct");
        for(var i = 0; i < names.length; i++) {
            var opt = names[i];
            var el = document.createElement("option");
            el.textContent = opt;
            el.value = opt;
            select.options.add(el);
        }
    }, function (error) {
    console.log("Error: " + error.code);
});

function initLoader() {
    document.getElementById("btn-load").addEventListener('click', load, false);
    document.getElementById("btn-new").addEventListener('click', function () {
        window.location = 'OPCloud.html'
    }, false);
};

window.onload = function() {
    initLoader();
};