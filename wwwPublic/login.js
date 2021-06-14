$(document).ready( () => {
    $('#loginBt').click(() => {
        let password = $('#inputPassword').val();
        let username = $('#inputUsername').val();
        let obj = {};
        obj.password = password;
        obj.username = username;
        call('POST', '/auth', JSON.stringify(obj), undefined, (resp) => {
            window.location.href = "/";
        }, (err) => {
            alert('Error while logging in: ' + err);
        });
    });
});