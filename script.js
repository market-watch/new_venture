let allData = []; // Declare allData globally

// Function to fetch data from multiple JSON files
async function fetchData() {
    try {
        const fileCount = 50; // Number of JSON files

        // Loop through the JSON files
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
                allData = allData.concat(data); // Merge data
            } catch (parseError) {
                console.error(`Error parsing JSON from ${fileName}:`, parseError);
                continue;
            }
        }

        populateTable(allData);
        populateFilters(allData);
    } catch (error) {
        console.error('Error fetching JSON data:', error);
    }
}

// Function to populate the table
function populateTable(data) {
    const tableBody = document.getElementById('data-table');
    tableBody.innerHTML = '';

    data.forEach(row => {
        const rowElement = document.createElement('tr');
        const columns = ['Key', 'pin_code_1', 'pin_code_2', 'Pro', 'organization_type',
                         'organization_name', 'Project Status', 'Commissionerate', 'Division',
                         'Range', 'address', 'Project Name', 'Completion', 'Pex', 'Website',
                         'Total_fsi', 'Area_share', 'Project_Link', 'Doc_Link', 'Revenue Share'];

        columns.forEach(column => {
            const cell = document.createElement('td');
            cell.textContent = row[column] || ''; // Default to empty if no data
            rowElement.appendChild(cell);
        });

        tableBody.appendChild(rowElement);
    });
}

// Function to populate the filter dropdowns
function populateFilters(data) {
    const columns = ['Commissionerate', 'Division', 'Range', 'Pro', 'organization_type', 'Pex', 'Area_share', 'FY'];

    columns.forEach(col => {
        const dropdown = document.getElementById(col);
        if (dropdown) {
            populateDropdown(data, dropdown, col);
        }
    });
}

// Helper to populate dropdowns with unique values
function populateDropdown(data, dropdown, key) {
    const uniqueValues = [...new Set(data.map(row => row[key]).filter(val => val))]; // Remove undefined/null
    dropdown.innerHTML = '<option value="">All</option>'; // Add default option

    uniqueValues.forEach(value => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        dropdown.appendChild(option);
    });
}

// Filter function
function filterData() {
    const filters = {
        Key: document.getElementById('Key').value.toLowerCase(),
        pin_code_1: document.getElementById('pin_code_1').value.toLowerCase(),
        pin_code_2: document.getElementById('pin_code_2').value.toLowerCase(),
        organization_name: document.getElementById('organization_name').value.toLowerCase(),
        address: document.getElementById('address').value.toLowerCase(),
        'Project Name': document.getElementById('Project_Name').value.toLowerCase(),
        Website: document.getElementById('Website').value.toLowerCase(),
        Total_fsi: document.getElementById('Total_fsi').value.toLowerCase(),
        Commissionerate: document.getElementById('Commissionerate').value,
        Division: document.getElementById('Division').value,
        Range: document.getElementById('Range').value,
        Pro: document.getElementById('Pro').value,
        organization_type: document.getElementById('organization_type').value,
        Pex: document.getElementById('Pex').value,
        Area_share: document.getElementById('Area_share').value,
        FY: document.getElementById('FY').value,
    };

    const filteredData = allData.filter(row => {
        return (
            (!filters.Key || row.Key.toLowerCase().includes(filters.Key)) &&
            (!filters.pin_code_1 || row.pin_code_1.toLowerCase().includes(filters.pin_code_1)) &&
            (!filters.pin_code_2 || row.pin_code_2.toLowerCase().includes(filters.pin_code_2)) &&
            (!filters.organization_name || row.organization_name.toLowerCase().includes(filters.organization_name)) &&
            (!filters.address || row.address.toLowerCase().includes(filters.address)) &&
            (!filters['Project Name'] || row['Project Name'].toLowerCase().includes(filters['Project Name'])) &&
            (!filters.Website || row.Website.toLowerCase().includes(filters.Website)) &&
            (!filters.Total_fsi || compareTotalFSI(row.Total_fsi, filters.Total_fsi)) &&
            (!filters.Commissionerate || row.Commissionerate === filters.Commissionerate) &&
            (!filters.Division || row.Division === filters.Division) &&
            (!filters.Range || row.Range === filters.Range) &&
            (!filters.Pro || row.Pro === filters.Pro) &&
            (!filters.organization_type || row.organization_type === filters.organization_type) &&
            (!filters.Pex || row.Pex === filters.Pex) &&
            (!filters.Area_share || row.Area_share === filters.Area_share) &&
            (!filters.FY || row.FY === filters.FY)
        );
    });

    populateTable(filteredData);
}

// Comparison function for Total_fsi
function compareTotalFSI(rowValue, filterValue) {
    const filterMatch = filterValue.match(/^([<>]=?|=)?\s*(\d+(\.\d+)?)$/);
    if (!filterMatch) return false;

    const operator = filterMatch[1] || '=';
    const number = parseFloat(filterMatch[2]);

    switch (operator) {
        case '>': return parseFloat(rowValue) > number;
        case '>=': return parseFloat(rowValue) >= number;
        case '<': return parseFloat(rowValue) < number;
        case '<=': return parseFloat(rowValue) <= number;
        case '=': return parseFloat(rowValue) === number;
        default: return false;
    }
}

// Add event listeners
document.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', filterData);
});
document.querySelectorAll('select').forEach(select => {
    select.addEventListener('change', filterData);
});

// Fetch data on load
document.addEventListener('DOMContentLoaded', fetchData);
