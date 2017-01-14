function Login() {
    if (firebase.auth().currentUser) {
        firebase.auth().signOut();
    } else {
        var email = document.getElementById('email').value;
        localStorage.setItem("globalUser",email);
        var password = document.getElementById('password').value;
        // Sign in with email and pass.
        // [START authwithemail]
        firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            // [START_EXCLUDE]
            //alert(errorMessage);
            var error_label = document.getElementById('error_label');
            error_label.innerHTML='<font style="color: red;font-style: italic">'+errorMessage+'</font>';
            console.log(error);
            document.getElementById('btn-sign-in').disabled = false;
            document.getElementById('password').addEventListener('keyup', function(event) {
                event.preventDefault();
                if (event.keyCode == 13) {
                    document.getElementById('btn-sign-in').click();
                }
            });
            // [END_EXCLUDE]
        });
        // [END authwithemail]
        /*var provider = new firebase.auth.GoogleAuthProvider();
        provider.addScope('https://www.googleapis.com/auth/plus.login');
        firebase.auth().signInWithPopup(provider).then(function(result) {
            // This gives you a Google Access Token. You can use it to access the Google API.
            var token = result.credential.accessToken;
            // The signed-in user info.
            var user = result.user;
            // ...
        }).catch(function(error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            // The email of the user's account used.
            var email = error.email;
            // The firebase.auth.AuthCredential type that was used.
            var credential = error.credential;
            // ...
        });
        // [END authwithgoogle]*/
    }
    document.getElementById('btn-sign-in').disabled = true;
}


/**
 * initApp handles setting up UI event listeners and registering Firebase auth listeners:
 *  - firebase.auth().onAuthStateChanged: This listener is called when the user is signed in or
 *    out, and that is where we update the UI.
 */
function initApp() {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            // [START_EXCLUDE silent]
            document.getElementById('btn-sign-in').textContent = 'Sign out';
            firebase.auth().signOut();
            window.location = "load.html";

            // [END_EXCLUDE]
        } else {
            // User is signed out.
            // [START_EXCLUDE silent]
            document.getElementById('btn-sign-in').textContent = 'Sign in';
            // [END_EXCLUDE]
        }
        // [START_EXCLUDE silent]
        document.getElementById('btn-sign-in').disabled = false;
        // [END_EXCLUDE]
    });
    // [END authstatelistener]
    document.getElementById('btn-sign-in').addEventListener('click', Login, false);
}

window.onload = function() {
    initApp();
};