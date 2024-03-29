

const queryString = window.location.search;
var slideIndex = 1;
var image = {};

$(document).ready( () => {
    console.log(queryString);
    showSlides(slideIndex);

    setup();
});

function setup() {
    let id = parseQueryString(queryString);
    image = getImage(id, (data) => {
        $('#img').attr("src", "img/" + data.filename);
    },
    (err) => {
        console.error(err);
    });
    console.log('Showing image for ID #' + id);
    loadRatings(id);
    $('#deleteBtn').click(() => {
        let id = parseQueryString(window.location.search);
        call('DELETE', '/img?id=' + id, undefined, undefined, (data) => {
            next();
            previous();
            alert('Deleted!');
        }, (err) => {
            alert(err);
        });
    });
    checkDelete();
}

function checkDelete() {
    let id = parseQueryString(window.location.search);
    call('GET', '/img/delete?id=' + id, undefined, undefined, (data) => {
        $('#deleteBtn').removeClass('disabled');
    }, (err) => {
        $('#deleteBtn').addClass('disabled');
    });
}

function getImage(id, onSuccess, onError) {
    call('GET', '/img?id=' + id, undefined, undefined, onSuccess, onError);
}

function parseQueryString(str) {
    let datasets = str.split("=");
    try {
        if(datasets[0] == "?id") {
            return parseInt(datasets[1]);
        }
    } catch(err) {
        console.log(err);
    }
    return undefined;
}

function next() {
    getNext(parseQueryString(window.location.search), (data) => {
        $('#img').attr("src", "img/" + data.filename);
        window.history.replaceState("none", "WebApp", "show?id=" + data.id);
        loadRatings(data.id);
        checkDelete();
    },
    (err) => {
        console.error(err);
    }
    );
}

function previous() {
    getPrevious(parseQueryString(window.location.search), (data) => {
        $('#img').attr("src", "img/" + data.filename);
        window.history.replaceState("none", "WebApp", "show?id=" + data.id);
        loadRatings(data.id);
        checkDelete();
    },
    (err) => {
        console.error(err);
    }
    );
}

function postRating(type) {
    let img = parseQueryString(window.location.search);
    getRating(img, (data) => {
        if(data.userRate === type) {
            type = 0;
        }
        let obj = {};
        obj.img = img;
        obj.type = type;
        call('POST', '/rate', JSON.stringify(obj), undefined,
        (data) => {
            loadRatings(img);
        }, (err) => { alert(err); });
    },
    (err) => {
        alert(err);
    });
}

function loadRatings(id) {
    getRating(id, (data) => {
        console.log(`Success: ${data.likes} : ${data.dislikes}`);
        $('#likes').text(data.likes);
        $('#dislikes').text(data.dislikes);
        $('#likeBtn').removeClass("chosen");
        $('#dislikeBtn').removeClass("chosen");
        if(data.userRate == 1) {
            $('#likeBtn').addClass("chosen");
        } else if(data.userRate == -1) {
            $('#dislikeBtn').addClass("chosen");
        }
    }, (err) => {
        console.error(err);
    });
}

function getRating(id, onSuccess, onError) {
    call('GET', '/img/ratings?id=' + id, undefined, undefined, onSuccess, onError);
}

function getNext(id, onSuccess, onError) {
    call('GET', '/img/next?id=' + id, undefined, undefined, onSuccess, onError);
}

function getPrevious(id, onSuccess, onError) {
    call('GET', '/img/previous?id=' + id, undefined, undefined, onSuccess, onError);
}

function showSlides(n) {
    var i;
    var slides = document.getElementsByClassName("slide");
    if (n > slides.length) { slideIndex = 1 }
    if (n < 1) { slideIndex = slides.length }
    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }
    slides[slideIndex - 1].style.display = "block";
}
