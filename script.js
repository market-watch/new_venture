let allData = []; // Declare allData globally

// Function to fetch data from multiple JSON files
async function fetchData() {
    try {
        const fileCount = 50; // Number of JSON files

        for (let i = 1; i <= fileCount; i++) {
            const fileName = `bird_github${String(i).padStart(2, '0')}.json`; // File name pattern
            console.log(`Fetching file: ${fileName}`); // Log the file being fetched

            const response = await fetch(fileName);

            if (!response.ok) {
                console.warn(`Failed to fetch ${fileName}: ${response.statusText}`);
                continue; // Skip this file if fetch fails
            }

            const rawData = await response.text();

            try {
                const data = JSON.parse(rawData); // Parse JSON
                allData = allData.concat(data); // Merge the data from each file
            } catch (parseError) {
                console.error(`Error parsing JSON from ${fileName}:`, parseError);
            }
        }

        // Populate filters only after all data is loaded
        populateFilters(allData);
    } catch (error) {
        console.error('Error fetching JSON data:', error);
    }
}

// Function to populate the table with filtered data
function populateTable(data) {
    const tableBody = document.getElementById('data-table');
    tableBody.innerHTML = ''; // Clear existing table rows

    data.forEach(row => {
        const rowElement = document.createElement('tr');

        const columns = ['Key', 'pin_code_1', 'pin_code_2', 'Pro', 'organization_type',
            'organization_name', 'Project Status', 'Commissionerate', 'Division',
            'Range', 'address', 'Project Name', 'Completion', 'Pex', 'Website',
            'Total_fsi', 'Area_share', 'Project_Link',
            'Doc_Link', 'Revenue Share'];

        columns.forEach(column => {
            const cell = document.createElement('td');
            cell.textContent = row[column] !== null && row[column] !== undefined ? row[column] : ''; // Handle null/undefined values
            rowElement.appendChild(cell);
        });

        tableBody.appendChild(rowElement);
    });
}

// Function to populate the filter dropdowns with unique values
function populateFilters(data) {
    const columns = ['Commissionerate', 'Division', 'Range', 'Pro', 'organization_type', 'Pex', 'Area_share', 'FY'];

    columns.forEach(col => {
        const dropdown = document.getElementById(col);
        if (dropdown) {
            populateDropdown(data, dropdown, col);
        }
    });
}

// Function to populate dropdowns with unique values
function populateDropdown(data, dropdown, key) {
    const uniqueValues = [...new Set(data.map(row => row[key]).filter(val => val !== null && val !== undefined))]; // Filter null/undefined values
    dropdown.innerHTML = ''; // Clear existing options

    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'All';
    dropdown.appendChild(defaultOption);

    uniqueValues.forEach(value => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        dropdown.appendChild(option);
    });
}

// Filter function for direct inputs and dropdowns
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
        division: document.getElementById('division').value,
        range: document.getElementById('range').value,
        pro: document.getElementById('pro').value,
        organization_type: document.getElementById('organizationType').value,
        pex: document.getElementById('pex').value,
        area_share: document.getElementById('areaShare').value,
        revenue_share: document.getElementById('revenueShare').value,
        fy: document.getElementById('fy').value
    };

    const filteredData = allData.filter(row => {
        return (
            (!filters.Key || row.Key?.toLowerCase().includes(filters.Key)) &&
            (!filters.pin_code_1 || String(row.pin_code_1).includes(filters.pin_code_1)) &&
            (!filters.pin_code_2 || String(row.pin_code_2).includes(filters.pin_code_2)) &&
            (!filters.organization_name || row.organization_name?.toLowerCase().includes(filters.organization_name)) &&
            (!filters.address || row.address?.toLowerCase().includes(filters.address)) &&
            (!filters['Project Name'] || row['Project Name']?.toLowerCase().includes(filters['Project Name'])) &&
            (!filters.Website || row.Website?.toLowerCase().includes(filters.Website)) &&
            (!filters.Total_fsi || compareTotalFSI(row.Total_fsi, filters.Total_fsi)) &&
            (!filters.commissionerate || row.Commissionerate === filters.commissionerate) &&
            (!filters.division || row.Division === filters.division) &&
            (!filters.range || row.Range === filters.range) &&
            (!filters.pro || row.Pro === filters.pro) &&
            (!filters.organization_type || row.organization_type === filters.organization_type) &&
            (!filters.pex || row.Pex === filters.pex) &&
            (!filters.area_share || row.Area_share === filters.area_share) &&
            (!filters.revenue_share || row['Revenue Share'] === filters.revenue_share) &&
            (!filters.fy || row.FY === filters.fy)
        );
    });

    populateTable(filteredData);
}

// Comparison function for Total_fsi
function compareTotalFSI(rowValue, filterValue) {
    const filterMatch = filterValue.match(/^([<>]=?|=)?\s*(\d+(\.\d+)?)$/); // Regex to match operators and numbers
    if (!filterMatch) return false;

    const operator = filterMatch[1] || '=';
    const number = parseFloat(filterMatch[2]);

    switch (operator) {
        case '>':
            return parseFloat(rowValue) > number;
        case '>=':
            return parseFloat(rowValue) >= number;
        case '<':
            return parseFloat(rowValue) < number;
        case '<=':
            return parseFloat(rowValue) <= number;
        case '=':
            return parseFloat(rowValue) === number;
        default:
            return false;
    }
}

// Event listeners for inputs and filters
document.querySelectorAll('input').forEach(input => input.addEventListener('input', filterData));
document.querySelectorAll('select').forEach(select => select.addEventListener('change', filterData));

// Fetch and load data on page load
document.addEventListener('DOMContentLoaded', fetchData);
