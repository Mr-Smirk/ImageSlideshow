function call(method, url, data, options, onSuccess, onError){
    
    //console.log(`data-service called ${method} ${url}`);
    let client = new XMLHttpRequest();
    client.onreadystatechange = function() {
        const response = this;
        if(response.readyState == 4){
            if(response.status >= 200 && response.status < 300){
                //console.log(response.responseText);
                let contentType = response.getResponseHeader('content-type');
                if(contentType == 'application/json'){
                    onSuccess(JSON.parse(response.responseText));
                }else{
                    if(contentType === 'text/plain' || contentType === 'text/html') {
                        onSuccess(response.responseText);
                    } else {
                        onSuccess(response.response);
                    }
                }
            }else{
                onError(response.status + ' ' + response.statusText);
            }
        }
    }

    client.open(method, url, true);
    if(options && options.headers){
        for(header in options.headers){
            let headerValue = options.headers[header];
            client.setRequestHeader(header, headerValue);
        }
    }
    client.send(data);
}