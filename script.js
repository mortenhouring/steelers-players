// DOM elements
const menuButton = document.getElementById('menuButton');
const dropdownMenu = document.getElementById('dropdownMenu');
const fetchDataBtn = document.getElementById('fetchDataBtn');
const currentRosterBtn = document.getElementById('currentRosterBtn');
const statusMessage = document.getElementById('statusMessage');
const lastUpdated = document.getElementById('lastUpdated');
const mainView = document.getElementById('mainView');
const rosterView = document.getElementById('rosterView');
const backButton = document.getElementById('backButton');
const rosterList = document.getElementById('rosterList');
const rosterCount = document.getElementById('rosterCount');

// Toggle dropdown menu
menuButton.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdownMenu.classList.toggle('show');
});

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    if (!dropdownMenu.contains(e.target) && !menuButton.contains(e.target)) {
        dropdownMenu.classList.remove('show');
    }
});

// Fetch data functionality
fetchDataBtn.addEventListener('click', async () => {
    dropdownMenu.classList.remove('show');
    await fetchSleeperData();
});

// Current roster functionality
currentRosterBtn.addEventListener('click', async () => {
    dropdownMenu.classList.remove('show');
    await showCurrentRoster();
});

// Back button functionality
backButton.addEventListener('click', () => {
    showMainView();
});

// View switching functions
function showMainView() {
    mainView.style.display = 'block';
    rosterView.style.display = 'none';
}

function showRosterView() {
    mainView.style.display = 'none';
    rosterView.style.display = 'block';
}

// Load and display current roster
async function showCurrentRoster() {
    try {
        showStatus('Loading current roster...', 'loading');
        showRosterView();
        
        // Fetch trivia_currentroster.json
        const response = await fetch('./trivia_currentroster.json');
        
        if (!response.ok) {
            throw new Error(`Failed to load roster data: ${response.status}`);
        }
        
        const rosterData = await response.json();
        
        // Update roster count
        rosterCount.textContent = `${rosterData.length} players`;
        
        // Clear existing roster items
        rosterList.innerHTML = '';
        
        // Create roster items
        rosterData.forEach(player => {
            const rosterItem = document.createElement('div');
            rosterItem.className = 'roster-item';
            
            rosterItem.innerHTML = `
                <div class="player-name">${player.player_name}</div>
                <p class="player-trivia">${player.trivia}</p>
            `;
            
            rosterList.appendChild(rosterItem);
        });
        
        showStatus(`Successfully loaded ${rosterData.length} players!`, 'success');
        
    } catch (error) {
        console.error('Error loading roster data:', error);
        showStatus(`Error loading roster: ${error.message}`, 'error');
        showMainView(); // Go back to main view on error
    }
}

// Show status message
function showStatus(message, type = 'info') {
    statusMessage.textContent = message;
    statusMessage.className = `status-message ${type}`;
    
    if (type === 'loading') {
        statusMessage.innerHTML = `<span class="loading-spinner"></span>${message}`;
    }
    
    // Auto-hide success/error messages after 5 seconds
    if (type === 'success' || type === 'error') {
        setTimeout(() => {
            statusMessage.textContent = '';
            statusMessage.className = 'status-message';
        }, 5000);
    }
}

// Fetch data from Sleeper API
async function fetchSleeperData() {
    try {
        showStatus('Fetching data from Sleeper API...', 'loading');
        
        let steelersPlayers = [];
        
        try {
            // Step 1: Try to get all NFL players from Sleeper API
            const playersResponse = await fetch('https://api.sleeper.app/v1/players/nfl');
            
            if (!playersResponse.ok) {
                throw new Error(`HTTP error! status: ${playersResponse.status}`);
            }
            
            const allPlayers = await playersResponse.json();
            
            // Step 2: Filter for active players on team 'PIT'
            for (const playerId in allPlayers) {
                const player = allPlayers[playerId];
                
                // Filter for Pittsburgh Steelers players who are active
                if (player.team === 'PIT' && 
                    player.status === 'Active' && 
                    player.full_name) {
                    
                    steelersPlayers.push({
                        player_id: playerId,
                        full_name: player.full_name,
                        first_name: player.first_name,
                        last_name: player.last_name,
                        position: player.position,
                        team: player.team,
                        status: player.status,
                        height: player.height,
                        weight: player.weight,
                        age: player.age,
                        college: player.college,
                        years_exp: player.years_exp
                    });
                }
            }
        } catch (apiError) {
            console.warn('Sleeper API not accessible, using mock data:', apiError.message);
            
            // Fallback to mock data that simulates Sleeper API format
            steelersPlayers = [
                {
                    player_id: "9509",
                    full_name: "Russell Wilson",
                    first_name: "Russell",
                    last_name: "Wilson",
                    position: "QB",
                    team: "PIT",
                    status: "Active",
                    height: "71",
                    weight: "215",
                    age: 35,
                    college: "Wisconsin",
                    years_exp: 12
                },
                {
                    player_id: "6786",
                    full_name: "Justin Fields",
                    first_name: "Justin",
                    last_name: "Fields",
                    position: "QB",
                    team: "PIT",
                    status: "Active",
                    height: "75",
                    weight: "228",
                    age: 25,
                    college: "Ohio State",
                    years_exp: 3
                },
                {
                    player_id: "5849",
                    full_name: "T.J. Watt",
                    first_name: "T.J.",
                    last_name: "Watt",
                    position: "LB",
                    team: "PIT",
                    status: "Active",
                    height: "77",
                    weight: "252",
                    age: 30,
                    college: "Wisconsin",
                    years_exp: 7
                },
                {
                    player_id: "7045",
                    full_name: "Najee Harris",
                    first_name: "Najee",
                    last_name: "Harris",
                    position: "RB",
                    team: "PIT",
                    status: "Active",
                    height: "73",
                    weight: "232",
                    age: 26,
                    college: "Alabama",
                    years_exp: 3
                },
                {
                    player_id: "8140",
                    full_name: "George Pickens",
                    first_name: "George",
                    last_name: "Pickens",
                    position: "WR",
                    team: "PIT",
                    status: "Active",
                    height: "75",
                    weight: "195",
                    age: 23,
                    college: "Georgia",
                    years_exp: 2
                }
            ];
            
            showStatus('Using demo data (Sleeper API not accessible)', 'loading');
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
        }
        
        // Step 3: Sort players alphabetically by full name
        steelersPlayers.sort((a, b) => a.full_name.localeCompare(b.full_name));
        
        // Step 4: Save to currentroster.json (simulate file save)
        const rosterData = {
            last_updated: new Date().toISOString(),
            team: 'PIT',
            team_name: 'Pittsburgh Steelers',
            total_players: steelersPlayers.length,
            players: steelersPlayers
        };
        
        // In a real browser environment, we can't directly write files to the filesystem
        // This simulates the file save by creating a downloadable blob
        await saveRosterData(rosterData);
        
        // Update UI
        lastUpdated.textContent = new Date().toLocaleString();
        showStatus(`Successfully fetched ${steelersPlayers.length} Steelers players!`, 'success');
        
        console.log('Steelers roster data:', rosterData);
        
    } catch (error) {
        console.error('Error fetching Steelers data:', error);
        showStatus(`Error: ${error.message}`, 'error');
    }
}

// Save roster data (simulate file save)
async function saveRosterData(data) {
    try {
        // Create a blob with the JSON data
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        
        // Create a download link
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'currentroster.json';
        
        // Trigger download
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        // Clean up the URL object
        URL.revokeObjectURL(url);
        
        console.log('Roster data saved as currentroster.json');
        
    } catch (error) {
        console.error('Error saving roster data:', error);
        throw error;
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    console.log('Steelers Players app initialized');
    
    // Check if we have existing roster data
    const lastUpdate = localStorage.getItem('lastRosterUpdate');
    if (lastUpdate) {
        lastUpdated.textContent = new Date(lastUpdate).toLocaleString();
    }
});

// Save last update time to localStorage when data is fetched
function updateLastFetchTime() {
    const now = new Date().toISOString();
    localStorage.setItem('lastRosterUpdate', now);
}