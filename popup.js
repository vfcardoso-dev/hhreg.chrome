document.addEventListener('DOMContentLoaded', () => {
    document.getElementById("trigger").addEventListener("click", async () => {
        let xhr = new XMLHttpRequest();

        let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        let origin = new URL(tab.url).origin;

        xhr.open('GET', origin + '/api/v2/My/Profile/CurrentTenantId');
        
        xhr.onload = function() {
            if (xhr.status != 200) { // analyze HTTP status of the response
                alert(`Error ${xhr.status}: ${xhr.statusText}`); // e.g. 404: Not Found
            } else { // show the result
                //alert(`Done, got ${xhr.response.length} bytes`); // response is the server response
                alert(`Done, got ${xhr.responseText}`); // response is the server response
            }
            window.close();
        };

        xhr.onerror = function() {
            alert("Request failed");
            window.close();
        };

        xhr.send();
    });
});