document.addEventListener('DOMContentLoaded', () => {
    const reasonsTableBody = document.querySelector('#reasons-table tbody');

    chrome.storage.local.get('usageData', (result) => {
        const data = result.usageData || [];
        reasonsTableBody.innerHTML = '';
        data.slice().reverse().forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.url}</td>
                <td>${item.reason}</td>
                <td>${new Date(item.timestamp).toLocaleDateString()}</td>
                <td>${item.duration}</td>
            `;
            reasonsTableBody.appendChild(row);
        });
    });
});