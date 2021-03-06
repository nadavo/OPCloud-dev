function load(){
    var selector = document.getElementById("load-slct");
    var selectedModel = selector.options[selector.selectedIndex].text;
    if (selectedModel == "Select a model:")
    {
        alert("Please select an existing model!");
        return;
    }
    globalModel.name = selectedModel;
    fireDB.ref('/models/' + globalModel.name).on("value", function(snapshot) {globalModel.model=snapshot.val(); console.log(snapshot.val())});
    localStorage.setItem("globalName",globalModel.name);
    window.location = 'OPCloud.html';
};

var names = [];
fireDB = firebase.database();
var models = fireDB.ref('/models/');
models.on("value", function(snapshot) {
    snapshot.forEach(function(child) {
        var nname = child.V.path.o[1];
        if (nname in names) {
            return;
        }
        names.push(nname);
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
        globalModel.name = undefined;
        localStorage.setItem("globalName",globalModel.name);
        window.location = 'OPCloud.html'
    }, false);
};

window.onload = function() {
    var user = localStorage.getItem("globalUser");
    document.getElementById("h2").innerHTML = "Hello " + user;
    document.getElementById("h3").innerHTML = "Please load an existing model or create a new model";
    initLoader();
};