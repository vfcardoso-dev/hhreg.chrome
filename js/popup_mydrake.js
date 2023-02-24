const occurrencesApiUrl = '/api/v2/My/AdditionalEvents/GetOccurrences';
const operationalUnitsApiUrl = '/api/v2/KeyValue/OperationalUnits?page=1&limit=100';
const costCentersApiUrl = '/api/v2/KeyValue/CostCenters?page=1&limit=100';

const getConfig = async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    return ({
        originUrl: new URL(tab.url).origin,
        tabId: tab.id
    });
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
    document.querySelectorAll('select').forEach(disableElement)
    document.querySelectorAll('textarea').forEach(disableElement)
    document.querySelectorAll('button').forEach(disableElement)
}
const enableAll = () => {
    const enableElement = (el) => el.removeAttribute("disabled");
    document.querySelectorAll('select').forEach(enableElement)
    document.querySelectorAll('textarea').forEach(enableElement)
    document.querySelectorAll('button').forEach(enableElement)
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

const bulkCreateAdditionalEvents = (origin, tabId, entries) => {
    const additionalEventsApiUrl = `${origin}/api/v2/My/AdditionalEvents`;

    hideContainer('.controls-container');
    showContainer('.status-container');

    let total, envios, falhas;
    total = entries.length;
    envios = 0;
    falhas = 0;

    document.getElementById('total').innerHTML = total;

    const updateInfo = () => {
        if (total > 0) {
            if (total === envios + falhas) {
                const statusEl = document.getElementById('status');
                statusEl.innerHTML = total === envios ? 'Successo!' : 'Falhou!';
                statusEl.style.backgroundColor = total === envios ? 'green' : 'red';
                statusEl.style.color = 'white';
            }
            
            if (total === envios) {
                chrome.tabs.reload(tabId);
            }
        }
    }

    entries.forEach(entry => {
        fetch(additionalEventsApiUrl, {
            method: 'post',
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
            body: JSON.stringify(entry)
        }).then(() => {
            envios++;
            document.getElementById('envios').innerHTML = envios;
            updateInfo();
        }).catch((e) => {
            falhas++;
            document.getElementById('falhas').innerHTML = falhas;
            updateInfo();
            console.log(e);
        });
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    document.getElementById("closeBtn").addEventListener("click", (e) => {
        e.preventDefault();
        window.close();
    });
    
    const cfg = await getConfig();

    disableAll();

    Promise.all([
            getOcurrences(cfg.originUrl), 
            getKeyValues(`${cfg.originUrl}${operationalUnitsApiUrl}`), 
            getKeyValues(`${cfg.originUrl}${costCentersApiUrl}`)
        ])
        .then(results => {
            populateSelect(results[0], 'occurrences');
            populateSelect(results[1], 'operationalUnits');
            populateSelect(results[2], 'costCenters');
            enableAll();
        });

    document.getElementById("trigger").addEventListener("click", async () => {
        const occurrenceId = document.getElementById('occurrences').value;
        const operationalUnitId = document.getElementById('operationalUnits').value;
        const costCenterId = document.getElementById('costCenters').value;
        const encodedEntries = document.getElementById('timeEntries').value;
        const decodedEntries = atob(encodedEntries);
        const jsonEntries = JSON.parse(decodedEntries);

        jsonEntries.forEach(entry => {
            entry.occurrenceId = occurrenceId;
            entry.rigId = operationalUnitId;
            entry.costCenterId = costCenterId;
            entry.event.occurrence.id = occurrenceId;
            entry.event.operationalUnit.id = operationalUnitId;
            entry.event.costCenter.id = costCenterId;
        });

        bulkCreateAdditionalEvents(cfg.originUrl, cfg.tabId, jsonEntries);
    });
});