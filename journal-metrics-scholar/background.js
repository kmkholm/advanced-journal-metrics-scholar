// SJR Journal Rankings Extension - Background Script with REAL SJR Data
// By Dr. Mohammed Tawfik <kmkhol01@gmail.com>

class SJRBackgroundService {
  constructor() {
    this.journalDatabase = new Map();
    this.lastUpdate = 0;
    this.isUpdating = false;
    this.initializeExtension();
  }

  async initializeExtension() {
    console.log('SJR Extension Background: Service worker started');
    
    chrome.runtime.onInstalled.addListener(this.handleInstall.bind(this));
    chrome.runtime.onMessage.addListener(this.handleMessage.bind(this));
    
    // Load cached database or download fresh data
    await this.loadOrUpdateDatabase();
  }

  async handleInstall(details) {
    console.log('SJR Extension: Installed/Updated', details);
    
    if (details.reason === 'install') {
      console.log('SJR Extension: First time installation - downloading SJR database...');
      await this.downloadSJRDatabase();
    }
  }

  // Handle messages from content scripts
  handleMessage(message, sender, sendResponse) {
    switch (message.type) {
      case 'GET_JOURNAL_DATA':
        this.getJournalData(message.journalName)
          .then(sendResponse)
          .catch(error => {
            console.error('Error getting journal data:', error);
            sendResponse(null);
          });
        return true;

      case 'UPDATE_DATABASE':
        this.downloadSJRDatabase()
          .then(() => sendResponse({ success: true }))
          .catch(error => sendResponse({ error: error.message }));
        return true;

      case 'GET_DATABASE_INFO':
        sendResponse({
          totalJournals: this.journalDatabase.size,
          lastUpdate: this.lastUpdate,
          isUpdating: this.isUpdating
        });
        break;

      default:
        sendResponse({ error: 'Unknown message type' });
    }
  }

  // Load database from storage or download fresh data
  async loadOrUpdateDatabase() {
    try {
      console.log('Loading SJR database...');
      
      // Try to load from storage first
      const stored = await chrome.storage.local.get(['sjrDatabase', 'lastUpdate']);
      
      if (stored.sjrDatabase && stored.lastUpdate) {
        // Check if data is less than 30 days old
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        
        if (stored.lastUpdate > thirtyDaysAgo) {
          console.log('Loading cached SJR database...');
          this.journalDatabase = new Map(stored.sjrDatabase);
          this.lastUpdate = stored.lastUpdate;
          console.log(`Loaded ${this.journalDatabase.size} journals from cache`);
          return;
        }
      }
      
      // Download fresh data if no cache or cache is old
      console.log('Cache not found or expired, downloading fresh SJR data...');
      await this.downloadSJRDatabase();
      
    } catch (error) {
      console.error('Error loading database:', error);
      // Fallback to sample data if download fails
      this.loadSampleData();
    }
  }

  // Download complete SJR database from SCImago
  async downloadSJRDatabase() {
    if (this.isUpdating) {
      console.log('Database update already in progress...');
      return;
    }

    this.isUpdating = true;
    console.log('Downloading SJR database from SCImago...');

    try {
      // Download the complete SJR database CSV
      const response = await fetch('https://www.scimagojr.com/journalrank.php?out=xls', {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const csvText = await response.text();
      console.log('Downloaded SJR CSV data, size:', csvText.length);

      // Parse the CSV data
      await this.parseSJRCSV(csvText);
      
      // Cache the parsed data
      await this.cacheDatabase();
      
      console.log(`Successfully updated SJR database with ${this.journalDatabase.size} journals`);
      
    } catch (error) {
      console.error('Failed to download SJR database:', error);
      
      // If download fails, try to use cached data or fallback
      const stored = await chrome.storage.local.get(['sjrDatabase']);
      if (stored.sjrDatabase) {
        console.log('Using cached database due to download failure');
        this.journalDatabase = new Map(stored.sjrDatabase);
      } else {
        console.log('Loading sample database due to download failure');
        this.loadSampleData();
      }
      
      throw error;
    } finally {
      this.isUpdating = false;
    }
  }

  // Parse SJR CSV data
  async parseSJRCSV(csvText) {
    console.log('Parsing SJR CSV data...');
    
    // Split into lines and parse
    const lines = csvText.split('\n');
    let headerLine = -1;
    let headers = [];
    
    // Find header line (contains "Title", "SJR", etc.)
    for (let i = 0; i < Math.min(lines.length, 10); i++) {
      const line = lines[i];
      if (line.includes('Title') && line.includes('SJR') && line.includes('Quartile')) {
        headerLine = i;
        headers = this.parseCSVLine(line);
        break;
      }
    }
    
    if (headerLine === -1) {
      throw new Error('Could not find header line in CSV data');
    }
    
    console.log('Found headers:', headers);
    
    // Find column indices
    const titleIndex = this.findColumnIndex(headers, ['Title', 'Journal', 'Journal Title']);
    const sjrIndex = this.findColumnIndex(headers, ['SJR', 'SJR Value']);
    const quartileIndex = this.findColumnIndex(headers, ['Quartile', 'Q', 'SJR Quartile']);
    const hIndexIndex = this.findColumnIndex(headers, ['H index', 'H-index', 'h index']);
    const countryIndex = this.findColumnIndex(headers, ['Country', 'Country/Region']);
    const publisherIndex = this.findColumnIndex(headers, ['Publisher']);
    
    console.log('Column indices:', { titleIndex, sjrIndex, quartileIndex, hIndexIndex });
    
    if (titleIndex === -1 || sjrIndex === -1 || quartileIndex === -1) {
      throw new Error('Could not find required columns in CSV');
    }
    
    // Parse data lines
    let validEntries = 0;
    this.journalDatabase.clear();
    
    for (let i = headerLine + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      try {
        const fields = this.parseCSVLine(line);
        
        if (fields.length > Math.max(titleIndex, sjrIndex, quartileIndex)) {
          const title = fields[titleIndex]?.trim();
          const sjr = parseFloat(fields[sjrIndex]) || 0;
          const quartile = fields[quartileIndex]?.trim();
          const hIndex = parseInt(fields[hIndexIndex]) || 0;
          const country = fields[countryIndex]?.trim() || '';
          const publisher = fields[publisherIndex]?.trim() || '';
          
          if (title && quartile && ['Q1', 'Q2', 'Q3', 'Q4'].includes(quartile)) {
            const normalizedTitle = title.toLowerCase();
            
            this.journalDatabase.set(normalizedTitle, {
              title: title,
              sjr: sjr,
              quartile: quartile,
              hIndex: hIndex,
              country: country,
              publisher: publisher
            });
            
            validEntries++;
          }
        }
      } catch (error) {
        // Skip malformed lines
        console.warn(`Skipping malformed line ${i}:`, error.message);
      }
    }
    
    console.log(`Parsed ${validEntries} valid journal entries`);
    this.lastUpdate = Date.now();
  }

  // Parse CSV line handling quoted fields
  parseCSVLine(line) {
    const fields = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ';' && !inQuotes) {
        fields.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    fields.push(current.trim());
    return fields.map(field => field.replace(/^"|"$/g, '')); // Remove surrounding quotes
  }

  // Find column index by possible names
  findColumnIndex(headers, possibleNames) {
    for (const name of possibleNames) {
      const index = headers.findIndex(header => 
        header.toLowerCase().includes(name.toLowerCase())
      );
      if (index !== -1) return index;
    }
    return -1;
  }

  // Cache database to storage
  async cacheDatabase() {
    try {
      await chrome.storage.local.set({
        sjrDatabase: Array.from(this.journalDatabase.entries()),
        lastUpdate: this.lastUpdate
      });
      console.log('Database cached successfully');
    } catch (error) {
      console.error('Error caching database:', error);
    }
  }

  // Get journal data by name
  async getJournalData(journalName) {
    if (this.journalDatabase.size === 0) {
      await this.loadOrUpdateDatabase();
    }

    const normalizedName = journalName.toLowerCase().trim();
    
    // Direct match
    if (this.journalDatabase.has(normalizedName)) {
      return this.journalDatabase.get(normalizedName);
    }

    // Partial matching
    for (const [dbName, data] of this.journalDatabase) {
      // Check if search name is contained in database name
      if (dbName.includes(normalizedName) || normalizedName.includes(dbName)) {
        return data;
      }
    }

    // Fuzzy matching by words
    const searchWords = normalizedName.split(/\s+/).filter(w => w.length > 2);
    for (const [dbName, data] of this.journalDatabase) {
      const dbWords = dbName.split(/\s+/).filter(w => w.length > 2);
      const matchingWords = searchWords.filter(w => dbWords.includes(w));
      
      if (matchingWords.length >= Math.min(2, searchWords.length)) {
        return data;
      }
    }

    return null;
  }

  // Load sample data as fallback
  loadSampleData() {
    console.log('Loading sample SJR data as fallback...');
    
    const sampleData = [
      ['nature', { title: 'Nature', sjr: 4.89, quartile: 'Q1', hIndex: 1055 }],
      ['science', { title: 'Science', sjr: 4.71, quartile: 'Q1', hIndex: 1015 }],
      ['cell', { title: 'Cell', sjr: 4.27, quartile: 'Q1', hIndex: 786 }],
      ['plos one', { title: 'PLOS ONE', sjr: 2.54, quartile: 'Q1', hIndex: 332 }],
      ['scientific reports', { title: 'Scientific Reports', sjr: 1.24, quartile: 'Q2', hIndex: 213 }],
      ['ieee access', { title: 'IEEE Access', sjr: 0.74, quartile: 'Q3', hIndex: 127 }],
      ['sustainability', { title: 'Sustainability', sjr: 0.66, quartile: 'Q4', hIndex: 89 }]
    ];
    
    this.journalDatabase = new Map(sampleData);
    this.lastUpdate = Date.now();
    
    console.log(`Loaded ${this.journalDatabase.size} sample journals`);
  }
}

// Initialize the background service
new SJRBackgroundService();