const occurrencesApiUrl = '/api/v2/My/AdditionalEvents/GetOccurrences';
const operationalUnitsApiUrl = '/api/v2/KeyValue/OperationalUnits?page=1&limit=100';
const costCentersApiUrl = '/api/v2/KeyValue/CostCenters?page=1&limit=100';
let originUrl = undefined;

const getOrigin = async () => {
    if (originUrl) return originUrl;

    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    originUrl = new URL(tab.url).origin;
    return originUrl;
}

const getOcurrences = async (origin) => {
    const url = `${origin}${occurrencesApiUrl}`;
    const request = await fetch(url);
    const result = await request.json();
    return result ?? [];
}

const getKeyValues = async (url) => {
    const request = await fetch(url);
    const result = await request.json();
    return result?.items ?? [];
}

const hideContainer = (container) => document.querySelector(container)?.classList.add('hidden');
const showContainer = (container) => document.querySelector(container)?.classList.remove('hidden');
const disableAll = () => {
    const disableElement = (el) => el.setAttribute("disabled", true)
    document.getElementsByName('select').forEach(disableElement)
    document.getElementsByName('textarea').forEach(disableElement)
    document.getElementsByName('button').forEach(disableElement)
}
const enableAll = () => {
    const enableElement = (el) => el.removeAttribute("disabled");
    document.getElementsByName('select').forEach(enableElement)
    document.getElementsByName('textarea').forEach(enableElement)
    document.getElementsByName('button').forEach(enableElement)
}
const populateSelect = (items, elemId) => {
    const elem = document.getElementById(elemId);
    elem.innerHTML = "";
    items.forEach(item => {
        const option = document.createElement('option');
        option.text = item.name;
        option.value = item.id;
        elem.add(option);
    })
}

document.addEventListener('DOMContentLoaded', async () => {
    disableAll();
    
    const origin = await getOrigin();

    Promise.all([
            getOcurrences(origin), 
            getKeyValues(`${origin}${operationalUnitsApiUrl}`), 
            getKeyValues(`${origin}${costCentersApiUrl}`)
        ])
        .then(results => {
            populateSelect(results[0], 'occurrences');
            populateSelect(results[1], 'operationalUnits');
            populateSelect(results[2], 'costCenters');
            enableAll();
        });

    document.getElementById("trigger").addEventListener("click", async () => {
        alert('dispara! pew! pew!');

        // POST: /api/v2/My/AdditionalEvents
        // {
        //   costCenterId: uuid,
        //   start: date+time,
        //   end: date+time,
        //   id: uuid,
        //   justification: string,
        //   occurrenceId: uuid,
        //   rigId: uuid,
        //   event: {
        //      costCenter: { id: uuid, name: string },
        //      occurrence: { id: uuid, name: string },
        //      operationalUnit: { id: uuid, name: string },
        //      startDate: date+time,
        //      endDate: date+time,
        //      reason: string,
        //   }
        // }
    });
});


// let xhr = new XMLHttpRequest();
// xhr.open('GET', origin + '/api/v2/My/Profile/CurrentTenantId');
// xhr.onload = function() {
//     if (xhr.status != 200) { // analyze HTTP status of the response
//         alert(`Error ${xhr.status}: ${xhr.statusText}`); // e.g. 404: Not Found
//     } else { // show the result
//         //alert(`Done, got ${xhr.response.length} bytes`); // response is the server response
//         alert(`Done, got ${xhr.responseText}`); // response is the server response
//     }
//     window.close();
// };
// xhr.onerror = function() {
//     alert("Request failed");
//     window.close();
// };
// xhr.send();