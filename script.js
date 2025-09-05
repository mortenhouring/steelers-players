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
    const isVisible = dropdownMenu.classList.contains('show');
    console.log(`[DEBUG] Menu button clicked. Current state: ${isVisible ? 'visible' : 'hidden'}`);
    
    dropdownMenu.classList.toggle('show');
    
    const newState = dropdownMenu.classList.contains('show');
    console.log(`[DEBUG] Menu dropdown state changed to: ${newState ? 'visible' : 'hidden'}`);
});

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    if (!dropdownMenu.contains(e.target) && !menuButton.contains(e.target)) {
        const wasVisible = dropdownMenu.classList.contains('show');
        if (wasVisible) {
            console.log('[DEBUG] Closing dropdown menu (clicked outside)');
            dropdownMenu.classList.remove('show');
        }
    }
});

// Fetch data functionality
fetchDataBtn.addEventListener('click', async () => {
    console.log('[DEBUG] Fetch data button clicked');
    dropdownMenu.classList.remove('show');
    console.log('[DEBUG] Menu dropdown closed');
    await fetchSleeperData();
});

// Current roster functionality
currentRosterBtn.addEventListener('click', async () => {
    console.log('[DEBUG] Current roster button clicked');
    dropdownMenu.classList.remove('show');
    console.log('[DEBUG] Menu dropdown closed');
    await showCurrentRoster();
});

// Back button functionality
backButton.addEventListener('click', () => {
    console.log('[DEBUG] Back button clicked, returning to main view');
    showMainView();
});

// View switching functions
function showMainView() {
    console.log('[DEBUG] Switching to main view');
    mainView.style.display = 'block';
    rosterView.style.display = 'none';
}

function showRosterView() {
    console.log('[DEBUG] Switching to roster view');
    mainView.style.display = 'none';
    rosterView.style.display = 'block';
}

// Load and display current roster
async function showCurrentRoster() {
    try {
        console.log('[DEBUG] Starting to load current roster from trivia_currentroster.json');
        showStatus('Loading current roster...', 'loading');
        showRosterView();
        
        // Fetch trivia_currentroster.json with improved path handling
        const fetchPath = 'trivia_currentroster.json';
        console.log(`[DEBUG] Attempting to fetch roster data from: ${fetchPath}`);
        
        const response = await fetch(fetchPath);
        
        if (!response.ok) {
            console.error(`[DEBUG] Failed to fetch roster data. Status: ${response.status}, StatusText: ${response.statusText}`);
            throw new Error(`Failed to load roster data: ${response.status} ${response.statusText}`);
        }
        
        console.log('[DEBUG] Successfully received response from trivia_currentroster.json');
        const rosterData = await response.json();
        console.log(`[DEBUG] Parsed roster data. Found ${rosterData.length} players`);
        
        // Update roster count
        rosterCount.textContent = `${rosterData.length} players`;
        
        // Clear existing roster items
        rosterList.innerHTML = '';
        console.log('[DEBUG] Cleared existing roster items');
        
        // Create roster items
        rosterData.forEach((player, index) => {
            console.log(`[DEBUG] Creating roster item ${index + 1}/${rosterData.length}: ${player.player_name}`);
            const rosterItem = document.createElement('div');
            rosterItem.className = 'roster-item';
            
            rosterItem.innerHTML = `
                <div class="player-name">${player.player_name}</div>
                <p class="player-trivia">${player.trivia}</p>
            `;
            
            rosterList.appendChild(rosterItem);
        });
        
        console.log(`[DEBUG] Successfully created ${rosterData.length} roster items`);
        showStatus(`Successfully loaded ${rosterData.length} players!`, 'success');
        
    } catch (error) {
        console.error('[DEBUG] Error loading roster data:', error);
        console.error('[DEBUG] Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        showStatus(`Error loading roster: ${error.message}`, 'error');
        showMainView(); // Go back to main view on error
    }
}

// Show status message
function showStatus(message, type = 'info') {
    console.log(`[DEBUG] Showing status message: "${message}" (type: ${type})`);
    statusMessage.textContent = message;
    statusMessage.className = `status-message ${type}`;
    
    if (type === 'loading') {
        statusMessage.innerHTML = `<span class="loading-spinner"></span>${message}`;
    }
    
    // Auto-hide success/error messages after 5 seconds
    if (type === 'success' || type === 'error') {
        setTimeout(() => {
            console.log(`[DEBUG] Auto-hiding status message after 5 seconds`);
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
    console.log('[DEBUG] DOM loaded, initializing Steelers Players app');
    console.log('[DEBUG] Checking for DOM elements:');
    console.log(`[DEBUG] - menuButton: ${menuButton ? 'found' : 'not found'}`);
    console.log(`[DEBUG] - dropdownMenu: ${dropdownMenu ? 'found' : 'not found'}`);
    console.log(`[DEBUG] - fetchDataBtn: ${fetchDataBtn ? 'found' : 'not found'}`);
    console.log(`[DEBUG] - currentRosterBtn: ${currentRosterBtn ? 'found' : 'not found'}`);
    
    // Check if we have existing roster data
    const lastUpdate = localStorage.getItem('lastRosterUpdate');
    if (lastUpdate) {
        console.log(`[DEBUG] Found existing roster update timestamp: ${lastUpdate}`);
        lastUpdated.textContent = new Date(lastUpdate).toLocaleString();
    } else {
        console.log('[DEBUG] No existing roster update timestamp found');
    }
    
    console.log('[DEBUG] Steelers Players app initialization complete');
});

// Save last update time to localStorage when data is fetched
function updateLastFetchTime() {
    const now = new Date().toISOString();
    localStorage.setItem('lastRosterUpdate', now);
}