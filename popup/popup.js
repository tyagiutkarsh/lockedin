document.addEventListener('DOMContentLoaded', () => {
    let usageChart = null; // To hold the chart instance

    // --- Tab Switching ---
    const tabs = document.querySelectorAll('.tab-link');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            document.querySelectorAll('.tab-link').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(tabName).classList.add('active');
        });
    });

    // --- Settings ---
    const timerDurationInput = document.getElementById('timer-duration');
    const addSiteForm = document.getElementById('add-site-form');
    const newSiteInput = document.getElementById('new-site');
    const blockedSitesList = document.getElementById('blocked-sites-list');

    const loadSettings = () => {
        chrome.storage.local.get(['timerDuration', 'blockedSites'], (result) => {
            timerDurationInput.value = result.timerDuration || 10;
            const sites = result.blockedSites || [];
            blockedSitesList.innerHTML = '';
            sites.forEach(site => {
                const li = document.createElement('li');
                li.innerHTML = `<span>${site}</span><button class="remove-site-btn" data-site="${site}">&times;</button>`;
                blockedSitesList.appendChild(li);
            });
        });
    };

    timerDurationInput.addEventListener('change', () => {
        const duration = parseInt(timerDurationInput.value, 10);
        if (duration >= 1 && duration <= 60) {
            chrome.storage.local.set({ timerDuration: duration });
        }
    });

    addSiteForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newSite = newSiteInput.value.trim();
        if (newSite) {
            chrome.storage.local.get('blockedSites', (result) => {
                const sites = result.blockedSites || [];
                if (!sites.includes(newSite)) {
                    sites.push(newSite);
                    chrome.storage.local.set({ blockedSites: sites }, () => {
                        newSiteInput.value = '';
                        loadSettings();
                    });
                }
            });
        }
    });

    blockedSitesList.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-site-btn')) {
            const siteToRemove = e.target.dataset.site;
            chrome.storage.local.get('blockedSites', (result) => {
                let sites = result.blockedSites || [];
                sites = sites.filter(site => site !== siteToRemove);
                chrome.storage.local.set({ blockedSites: sites }, loadSettings);
            });
        }
    });

    // --- Insights ---
    const reasonsTableBody = document.querySelector('#reasons-table tbody');
    const chartCanvas = document.getElementById('usageChart').getContext('2d');

    const loadInsights = () => {
        chrome.storage.local.get('usageData', (result) => {
            const data = result.usageData || [];
            
            // 1. Populate Reasons Table
            reasonsTableBody.innerHTML = '';
            data.slice().reverse().forEach(item => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.url}</td>
                    <td>${item.reason}</td>
                    <td>${new Date(item.timestamp).toLocaleDateString()}</td>
                `;
                reasonsTableBody.appendChild(row);
            });

            // 2. Process Data for Chart
            const processedData = processDataForChart(data);

            // 3. Render Chart
            renderUsageChart(processedData);
        });
    };
    
    const processDataForChart = (data) => {
        const dailyData = {}; // { 'YYYY-MM-DD': { site1: time, site2: time } }
        const sites = new Set();

        const today = new Date();
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);

        data.forEach(item => {
            const itemDate = new Date(item.timestamp);
            if (itemDate >= sevenDaysAgo) {
                const dateString = itemDate.toISOString().split('T')[0];
                if (!dailyData[dateString]) {
                    dailyData[dateString] = {};
                }
                const site = item.url.replace('www.', '');
                sites.add(site);
                dailyData[dateString][site] = (dailyData[dateString][site] || 0) + item.duration;
            }
        });

        const labels = Object.keys(dailyData).sort();
        const datasets = Array.from(sites).map((site, index) => {
            const colors = ['#4a90e2', '#e24a4a', '#4ae28e', '#e2a94a', '#8e4ae2'];
            return {
                label: site,
                data: labels.map(label => dailyData[label][site] || 0),
                backgroundColor: colors[index % colors.length],
            };
        });

        return { labels, datasets };
    };

    const renderUsageChart = (data) => {
        if (usageChart) {
            usageChart.destroy();
        }
        usageChart = new Chart(chartCanvas, {
            type: 'bar',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: '#e0e0e0' }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: {
                    x: {
                        stacked: true,
                        grid: { color: '#444' },
                        ticks: { color: '#e0e0e0' }
                    },
                    y: {
                        stacked: true,
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Minutes',
                            color: '#e0e0e0'
                        },
                        grid: { color: '#444' },
                        ticks: { color: '#e0e0e0' }
                    }
                },
                animation: {
                    duration: 0 // No animations for a utilitarian feel
                }
            }
        });
    };


    // --- Initial Load ---
    loadSettings();
    loadInsights();
});

