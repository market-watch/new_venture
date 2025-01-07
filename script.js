// Declare allData globally
let allData = [];

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

        // Fetch unique values and jurisdiction data, then populate filters
        await populateFilters(allData);
    } catch (error) {
        console.error('Error fetching JSON data:', error);
    }
}

// Function to populate the filter dropdowns with unique values and jurisdiction data
async function populateFilters(data) {
    // Columns fetched from unique_values.json
    const uniqueValueColumns = ['Pro', 'organization_type', 'Pex', 'Area_share', 'FY'];

    // Fetch unique_values.json and jur_dict.json
    let uniqueValuesData = {};
    let jurisdictionData = {};

    try {
        const [uniqueValuesResponse, jurisdictionResponse] = await Promise.all([
            fetch('unique_values.json'),
            fetch('jur_dict.json')
        ]);

        if (uniqueValuesResponse.ok) {
            uniqueValuesData = await uniqueValuesResponse.json();
        } else {
            console.warn(`Failed to fetch unique_values.json: ${uniqueValuesResponse.statusText}`);
        }

        if (jurisdictionResponse.ok) {
            jurisdictionData = await jurisdictionResponse.json();
        } else {
            console.warn(`Failed to fetch jur_dict.json: ${jurisdictionResponse.statusText}`);
        }
    } catch (error) {
        console.error('Error fetching unique_values.json or jur_dict.json:', error);
    }

    // Populate dropdowns for unique value columns
    uniqueValueColumns.forEach(col => {
        const dropdown = document.getElementById(col);
        if (dropdown && uniqueValuesData[col]) {
            populateDropdown(uniqueValuesData[col], dropdown);
        }
    });

    // Populate jurisdiction-related dropdowns (Commissionerate, Division, Range)
    const jurisdictionColumns = ['Commissionerate', 'Division', 'Range'];
    jurisdictionColumns.forEach(col => {
        const dropdown = document.getElementById(col);
        if (dropdown && jurisdictionData[col]) {
            populateDropdown(jurisdictionData[col], dropdown);
        }
    });
}

// Function to populate dropdowns with unique values
function populateDropdown(values, dropdown) {
    dropdown.innerHTML = ''; // Clear existing options

    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'All';
    dropdown.appendChild(defaultOption);

    values.forEach(value => {
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

// Fetch and load data on page load
document.addEventListener('DOMContentLoaded', fetchData);
