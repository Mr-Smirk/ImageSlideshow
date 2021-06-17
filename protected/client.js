

var columns;
var imgLoaded;
var successfullyAdded;
var loadingMoreIsBlocked = false;

$(document).ready( () => {
    imgLoaded = [];
    columns =  [$('#col1'), $('#col2'), $('#col3') ];
    getFirst((image) => {
        addImage(image);
        showImage(image);
        loadMorePhotos(8);
    }, (err) => {
        console.log(err);
    });
});

window.onscroll = function(ev) {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight && !loadingMoreIsBlocked) {
        loadingMoreIsBlocked = true;
        showLoadingIcon();
        setTimeout(() => {
            loadMorePhotos(8);
        }, 1000);
    }
};

function loadMorePhotos(left) {
    if(left > 0) {
        let successfullyAdded = undefined;
        getNext(imgLoaded[imgLoaded.length-1], (data) => {
            if(imgLoaded[imgLoaded.length-1].id !== data.id) {
                addImage(data);
                successfullyAdded = data;
                showImage(successfullyAdded);
                loadMorePhotos(left-1);
                console.log("Loaded image #" + data.id);
            } else {
                loadMorePhotos(0);
            }
        },
        (err) => {
            loadMorePhotos(left-1);
            console.log("Error while loading image.");
        });
    } else {
        hideLoadingIcon();
        loadingMoreIsBlocked = false;
    }
}

function hideLoadingIcon() {
    $('#loadingMoreImg').css("display", "none");
}

function showLoadingIcon() {
    $('#loadingMoreImg').css("display", "block");
}

function showImage(image) {
    $(`#${image.id}`).css('display', 'block');
}

function addImage(image) {
    let col = columns[imgLoaded.length%columns.length]; // choosing column for next preview image
    col.append(`<img id="${image.id}" onclick="openSlideshow(${image.id})" style="display:none" src="preview/${image.filename}" alt="picture">`);
    imgLoaded.push(image);
}

function getNext(data, onSuccess, onError) {
    call('GET', '/img/next?id=' + data.id, undefined, undefined, onSuccess, onError);
}

function getPrevious(data, onSuccess, onError) {
    call('GET', '/img/previous?id=' + data.id, undefined, undefined, onSuccess, onError);
}

function getFirst(onSuccess, onError) {
    call('GET', '/img/first', undefined, undefined, onSuccess, onError);
}

function openSlideshow(id) {
    window.location.href = "/show?id=" + id;
}

