// Function to fetch data from multiple JSON files
async function fetchData() {
    try {
        const fileCount = 50; // Number of JSON files
        let allData = []; // Array to hold data from all files

        // Loop through the 50 JSON files
        for (let i = 1; i <= fileCount; i++) {
            const fileName = `bird_github${String(i).padStart(2, '0')}.json`; // File name pattern
            console.log(`Fetching file: ${fileName}`); // Log the file being fetched

            const response = await fetch(fileName);

            // Check if the response is OK (status code 200)
            if (!response.ok) {
                throw new Error(`Failed to fetch ${fileName}: ${response.statusText}`);
            }

            // Log raw response to check its content before parsing
            const rawData = await response.text();
          //  console.log(`Raw data for ${fileName}:`, rawData);  // Log raw content of file

            // Attempt to parse the JSON data
            let data;
            try {
                data = JSON.parse(rawData); // Explicitly parse the data
            } catch (parseError) {
                console.error(`Error parsing JSON from ${fileName}:`, parseError);
                continue; // Skip this file if it can't be parsed
            }

            allData = allData.concat(data); // Merge the data from each file
        }

        // Process the fetched data (e.g., populate tables, filters)
        populateTable(allData);
        populateFilters(allData);

    } catch (error) {
        console.error('Error fetching JSON data:', error);
    }
}

// Function to populate the table with the data
function populateTable(data) {
    const tableBody = document.getElementById('data-table');
    tableBody.innerHTML = ''; // Clear any existing table rows

    // Loop through each row of data and add it to the table
    data.forEach(row => {
        const rowElement = document.createElement('tr');

        // Loop through the columns and add each cell
        const columns = ['Key', 'Value', 'pin_code_1', 'pin_code_2', 'Pro', 'organization_type',
                         'organization_name', 'Project Status', 'Commissionerate', 'Division',
                         'Range', 'address', 'Project Name', 'Completion', 'Pex', 'Website',
                         'apartment_details', 'Total_fsi', 'Area_share', 'Project_Link',
                         'Doc_Link', 'Revenue Share'];

        columns.forEach(column => {
            const cell = document.createElement('td');
            cell.textContent = row[column] || ''; // Default to empty string if data is missing
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
    const uniqueValues = [...new Set(data.map(row => row[key]))];
    dropdown.innerHTML = ''; // Clear existing options
    uniqueValues.forEach(value => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        dropdown.appendChild(option);
    });
}

// Filter function for direct inputs (Search by Key, Pin Code, etc.)
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

    const filteredData = jsonData.filter(row => {
        return (
            (!filters.Key || row.Key.toLowerCase().includes(filters.Key)) &&
            (!filters.pin_code_1 || row.pin_code_1.toLowerCase().includes(filters.pin_code_1)) &&
            (!filters.pin_code_2 || row.pin_code_2.toLowerCase().includes(filters.pin_code_2)) &&
            (!filters.organization_name || row.organization_name.toLowerCase().includes(filters.organization_name)) &&
            (!filters.address || row.address.toLowerCase().includes(filters.address)) &&
            (!filters['Project Name'] || row['Project Name'].toLowerCase().includes(filters['Project Name'])) &&
            (!filters.Website || row.Website.toLowerCase().includes(filters.Website)) &&
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
    if (!filterMatch) return false; // Invalid input format

    const operator = filterMatch[1] || '='; // Default to '=' if no operator is specified
    const number = parseFloat(filterMatch[2]); // Extract the numeric value

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
        case undefined: // Allow bare numbers to mean '='
            return parseFloat(rowValue) === number;
        default:
            return false;
    }
}

// Event listeners for direct search inputs
document.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', filterData);
});

// Event listeners for dropdown filters
document.querySelectorAll('select').forEach(select => {
    select.addEventListener('change', filterData);
});

// Fetch and load data on page load
document.addEventListener('DOMContentLoaded', fetchData);
