let allData = [];

async function fetchData() {
    try {
        const fileCount = 50; // Number of JSON files

        for (let i = 1; i <= fileCount; i++) {
            const fileName = `bird_github${String(i).padStart(2, '0')}.json`;
            console.log(`Fetching file: ${fileName}`);

            const response = await fetch(fileName);
            if (!response.ok) {
                console.warn(`Failed to fetch ${fileName}: ${response.statusText}`);
                continue;
            }

            const rawData = await response.text();
            try {
                const data = JSON.parse(rawData);
                allData = allData.concat(data);
            } catch (error) {
                console.error(`Error parsing JSON from ${fileName}:`, error);
            }
        }

        await populateFilters();
    } catch (error) {
        console.error('Error fetching JSON data:', error);
    }
}

async function populateFilters() {
    try {
        const [uniqueValuesResponse, jurisdictionResponse] = await Promise.all([
            fetch('unique_values.json'),
            fetch('jur_dict.json')
        ]);

        const uniqueValuesData = uniqueValuesResponse.ok ? await uniqueValuesResponse.json() : {};
        const jurisdictionData = jurisdictionResponse.ok ? await jurisdictionResponse.json() : {};

        // Populate Commissionerate dropdown from jur_dict.json keys
        const commissionerateDropdown = document.getElementById('commissionerate');
        populateDropdown(Object.keys(jurisdictionData), commissionerateDropdown);

        // Populate other dropdowns from unique_values.json
        const dropdowns = {
            'pro': uniqueValuesData.Pro,
            'organizationType': uniqueValuesData.organization_type,
            'pex': uniqueValuesData.Pex,
            'areaShare': uniqueValuesData.Area_share,
            'fy': uniqueValuesData.FY
        };

        for (let dropdownId in dropdowns) {
            const dropdown = document.getElementById(dropdownId);
            populateDropdown(dropdowns[dropdownId], dropdown);
        }

        // Attach filter listener
        document.querySelectorAll("input, select").forEach(filter => {
            filter.addEventListener("input", filterData);
        });
    } catch (error) {
        console.error('Error populating filters:', error);
    }
}

// Populate dropdown options with an 'All' option
function populateDropdown(values, dropdown) {
    dropdown.innerHTML = `<option value="">All</option>`;
    values.forEach(value => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = value === null ? 'N/A' : value;
        dropdown.appendChild(option);
    });
}

// Filter data based on inputs and dropdowns
function filterData() {
    const filters = {
        Key: document.getElementById('Key').value.toLowerCase(),
        pin_code_1: document.getElementById('pin_code_1').value,
        pin_code_2: document.getElementById('pin_code_2').value,
        organization_name: document.getElementById('organization_name').value.toLowerCase(),
        address: document.getElementById('address').value.toLowerCase(),
        'Project Name': document.getElementById('Project_Name').value.toLowerCase(),
        Website: document.getElementById('Website').value.toLowerCase(),
        Total_fsi: document.getElementById('Total_fsi').value.toLowerCase(),
        commissionerate: document.getElementById('commissionerate').value,
        pro: document.getElementById('pro').value,
        organization_type: document.getElementById('organizationType').value,
        pex: document.getElementById('pex').value,
        area_share: document.getElementById('areaShare').value,
        fy: document.getElementById('fy').value
    };

    const filteredData = allData.filter(row => {
        return Object.keys(filters).every(key => {
            return !filters[key] || row[key]?.toString().toLowerCase().includes(filters[key]);
        });
    });

    populateTable(filteredData);
}

// Render filtered data in table
function populateTable(data) {
    const tableBody = document.getElementById("data-table");
    tableBody.innerHTML = data.map(row => {
        return `<tr>${Object.values(row).map(value => `<td>${value}</td>`).join('')}</tr>`;
    }).join('');
}

// Fetch data on page load
document.addEventListener('DOMContentLoaded', fetchData);
