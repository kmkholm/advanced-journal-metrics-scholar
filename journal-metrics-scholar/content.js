// SJR Journal Rankings Extension - Content Script for REAL SJR Data
// By Dr. Mohammed Tawfik <kmkhol01@gmail.com>

class SJRExtension {
  constructor() {
    this.processedElements = new WeakSet();
    this.stats = { q1: 0, q2: 0, q3: 0, q4: 0, na: 0, total: 0 };
    this.initExtension();
  }

  initExtension() {
    console.log('SJR Extension: Starting with REAL SJR data...');
    console.log('Current URL:', window.location.href);
    
    // Add some delay to ensure page is loaded
    setTimeout(() => {
      this.processPage();
      this.observePageChanges();
    }, 1500);
  }

  // Process all papers on the current page
  async processPage() {
    try {
      console.log('SJR Extension: Processing page...');
      
      // Reset stats
      this.stats = { q1: 0, q2: 0, q3: 0, q4: 0, na: 0, total: 0 };

      // Find all paper elements based on page type
      const paperElements = this.findPaperElements();
      console.log(`SJR Extension: Found ${paperElements.length} papers to process`);

      if (paperElements.length === 0) {
        console.log('SJR Extension: No papers found, checking page structure...');
        this.debugPageStructure();
        return;
      }

      // Process each paper
      for (let i = 0; i < paperElements.length; i++) {
        const element = paperElements[i];
        if (!this.processedElements.has(element)) {
          console.log(`Processing paper ${i + 1}/${paperElements.length}`);
          await this.processPaper(element);
          this.processedElements.add(element);
        }
      }

      // Update stats display
      this.updateStatsDisplay();
      
      console.log('SJR Extension: Processing complete. Stats:', this.stats);
    } catch (error) {
      console.error('SJR Extension: Error processing page', error);
    }
  }

  // Debug page structure to understand Google Scholar layout
  debugPageStructure() {
    console.log('SJR Extension: Debugging page structure...');
    console.log('Current URL:', window.location.href);
    
    // Check what type of Google Scholar page this is
    if (window.location.href.includes('citations?')) {
      console.log('This is a Google Scholar profile page');
      console.log('- .gsc_a_tr elements (publications):', document.querySelectorAll('.gsc_a_tr').length);
      console.log('- .gsc_a_at elements (titles):', document.querySelectorAll('.gsc_a_at').length);
    } else {
      console.log('This is a Google Scholar search page');
      console.log('- .gs_r elements:', document.querySelectorAll('.gs_r').length);
      console.log('- .gs_ri elements:', document.querySelectorAll('.gs_ri').length);
    }
    
    console.log('- h3 elements:', document.querySelectorAll('h3').length);
    console.log('- Total divs:', document.querySelectorAll('div').length);
  }

  // Find all paper elements based on page type
  findPaperElements() {
    const elements = [];
    const url = window.location.href;
    
    if (url.includes('citations?')) {
      // Google Scholar profile page
      console.log('Detecting profile page elements...');
      
      const profilePapers = document.querySelectorAll('.gsc_a_tr');
      console.log(`Found ${profilePapers.length} profile papers`);
      
      profilePapers.forEach((paper, index) => {
        elements.push(paper);
        console.log(`Profile paper ${index + 1}:`, paper.textContent.substring(0, 100));
      });
      
    } else {
      // Google Scholar search results page
      console.log('Detecting search results elements...');
      
      const selectors = ['.gs_r', '.gs_ri', '[data-lid]'];
      
      selectors.forEach(selector => {
        const found = document.querySelectorAll(selector);
        console.log(`Found ${found.length} elements with selector: ${selector}`);
        
        found.forEach((el, index) => {
          if (!elements.includes(el)) {
            elements.push(el);
            console.log(`Search paper ${elements.length}:`, el.textContent.substring(0, 100));
          }
        });
      });
    }

    return elements;
  }

  // Process individual paper
  async processPaper(element) {
    try {
      console.log('Processing paper element...');
      
      const journalInfo = this.extractJournalFromPaper(element);
      console.log('Extracted journal info:', journalInfo);
      
      if (journalInfo.journal) {
        // Get real SJR data from background script
        console.log(`Looking up SJR data for: "${journalInfo.journal}"`);
        
        const sjrData = await this.getSJRDataFromBackground(journalInfo.journal);
        console.log('SJR data received:', sjrData);
        
        if (sjrData) {
          this.addRankingToPaper(element, sjrData, journalInfo);
          this.updateStats(sjrData.quartile);
          console.log(`Added ${sjrData.quartile} ranking for ${sjrData.title}`);
        } else {
          console.log(`No SJR data found for journal: ${journalInfo.journal}`);
          this.updateStats('na');
        }
      } else {
        console.log('No journal extracted from paper');
        this.updateStats('na');
      }
      
      this.stats.total++;
    } catch (error) {
      console.error('Error processing paper:', error);
      this.updateStats('na');
      this.stats.total++;
    }
  }

  // Extract journal name from paper element (improved for profile pages)
  extractJournalFromPaper(element) {
    let journal = null;
    let citationText = '';
    const url = window.location.href;

    console.log('Extracting journal from element...');

    if (url.includes('citations?')) {
      // Google Scholar profile page format
      console.log('Parsing profile page format...');
      
      // On profile pages, journal info is often in a separate element
      const titleElement = element.querySelector('.gsc_a_at');
      const citationElement = element.querySelector('.gs_gray');
      
      if (citationElement) {
        citationText = citationElement.textContent.trim();
        console.log('Profile citation text:', citationText);
      } else {
        // Sometimes citation info is in other elements
        const allText = element.textContent;
        console.log('Profile full text:', allText);
        citationText = allText;
      }
      
    } else {
      // Google Scholar search results format
      console.log('Parsing search results format...');
      
      const citationSelectors = ['.gs_a', '.gs_rs', '.gs_gray'];
      
      for (const selector of citationSelectors) {
        const citationElement = element.querySelector(selector);
        if (citationElement) {
          citationText = citationElement.textContent.trim();
          console.log(`Found citation text with ${selector}:`, citationText);
          break;
        }
      }
      
      if (!citationText) {
        citationText = element.textContent;
        console.log('Using full element text');
      }
    }

    if (citationText) {
      journal = this.parseJournalName(citationText);
      console.log('Final parsed journal name:', journal);
    }

    return { journal, citationText };
  }

  // Parse journal name from citation text (improved patterns)
  parseJournalName(citationText) {
    console.log('Parsing journal from citation:', citationText);
    
    // Clean the citation text
    const cleanText = citationText.replace(/\s+/g, ' ').trim();
    
    // Multiple patterns for different citation formats
    const patterns = [
      // Pattern 1: "Journal Name Volume(Issue), Pages"
      /^([^0-9]+?)\s*\d+\s*\(/,
      
      // Pattern 2: "Journal Name, Volume"
      /^([^,]+),\s*\d+/,
      
      // Pattern 3: "Journal Name Volume"
      /^([^0-9]+?)\s*\d+/,
      
      // Pattern 4: "... - Journal Name, Year"
      /-\s*([^,-]+),\s*\d{4}/,
      
      // Pattern 5: "Authors, Journal Name, Year"
      /,\s*([^,]+),\s*\d{4}/,
      
      // Pattern 6: Look for specific patterns
      /(Cogent\s+[^,\d]+)/i,
      /(International\s+Journal[^,\d]*)/i,
      /(Journal\s+of[^,\d]*)/i,
      /(IEEE[^,\d]*)/i,
      /(Nature[^,\d]*)/i,
      /(Science[^,\d]*)/i,
      /(PLOS[^,\d]*)/i,
      
      // Pattern 7: Any title-case words before numbers
      /\b([A-Z][a-zA-Z\s&]{4,50}?)\s*\d/,
    ];

    for (let i = 0; i < patterns.length; i++) {
      const pattern = patterns[i];
      const match = cleanText.match(pattern);
      console.log(`Pattern ${i+1} (${pattern.source}):`, match);
      
      if (match && match[1]) {
        let journalName = match[1].trim()
          .replace(/^[-\s,]+|[-\s,]+$/g, '')  // Remove leading/trailing punctuation
          .replace(/\s+/g, ' ')               // Normalize spaces
          .replace(/\.$/, '');                // Remove trailing period

        console.log(`Extracted journal name: "${journalName}"`);
        
        if (this.isValidJournalName(journalName)) {
          console.log(`Valid journal name found: "${journalName}"`);
          return journalName;
        }
      }
    }

    console.log('No valid journal name found in citation');
    return null;
  }

  // Validate journal name
  isValidJournalName(name) {
    if (!name || name.length < 3) return false;
    
    // Exclude obvious non-journal terms
    const excludeTerms = [
      'cited by', 'related articles', 'all versions', 'pdf', 'html',
      'download', 'view', 'google', 'scholar', 'search', 'save',
      'export', 'import', 'create alert', 'my library', 'year',
      'author', 'title', 'click', 'show', 'hide', 'more', 'less'
    ];
    
    const lowerName = name.toLowerCase();
    if (excludeTerms.some(term => lowerName.includes(term))) {
      return false;
    }
    
    // Must contain letters
    if (!/[a-zA-Z]/.test(name)) return false;
    
    // Should not be just numbers and symbols
    if (/^[\d\s\(\),.-]+$/.test(name)) return false;
    
    // Reasonable length
    if (name.length > 100) return false;
    
    return true;
  }

  // Get SJR data from background script
  async getSJRDataFromBackground(journalName) {
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'GET_JOURNAL_DATA',
        journalName: journalName
      });
      
      return response;
    } catch (error) {
      console.error('Error getting SJR data from background:', error);
      return null;
    }
  }

  // Add ranking badge IN FRONT of paper title
  addRankingToPaper(element, sjrData, journalInfo) {
    try {
      console.log('Adding ranking badge:', sjrData);
      
      // Remove existing indicator if present
      const existing = element.querySelector('.sjr-badge-inline');
      if (existing) {
        existing.remove();
      }

      // Create inline badge
      const badge = document.createElement('span');
      badge.className = `sjr-badge-inline sjr-${sjrData.quartile.toLowerCase()}`;
      badge.innerHTML = `<span class="sjr-quartile">${sjrData.quartile}</span>`;
      badge.title = `${sjrData.title} - SJR: ${sjrData.sjr}, H-index: ${sjrData.hIndex}`;

      // Find title element based on page type
      const url = window.location.href;
      let titleElement = null;
      
      if (url.includes('citations?')) {
        // Profile page - title is in .gsc_a_at
        titleElement = element.querySelector('.gsc_a_at a') || element.querySelector('.gsc_a_at');
      } else {
        // Search page - title is in h3 or .gs_rt
        titleElement = element.querySelector('h3 a') || element.querySelector('.gs_rt a') || element.querySelector('h3');
      }
      
      if (titleElement) {
        console.log('Inserting badge into title element');
        titleElement.insertBefore(badge, titleElement.firstChild);
      } else {
        console.log('Title element not found, inserting at element start');
        element.insertBefore(badge, element.firstChild);
      }
      
      console.log('Badge successfully added');
    } catch (error) {
      console.error('Error adding ranking badge:', error);
    }
  }

  // Update statistics
  updateStats(quartile) {
    const key = quartile.toLowerCase();
    if (this.stats.hasOwnProperty(key)) {
      this.stats[key]++;
    } else {
      this.stats.na++;
    }
  }

  // Update statistics display
  updateStatsDisplay() {
    console.log('Updating stats display with:', this.stats);
    
    // Add stats box if not present
    if (!document.querySelector('.sjr-stats-box')) {
      this.addStatsBox();
    }

    const total = this.stats.total || 1;

    // Update percentages and counts
    ['q1', 'q2', 'q3', 'q4', 'na'].forEach(quartile => {
      const percentage = Math.round((this.stats[quartile] / total) * 100);
      const pctElement = document.getElementById(`${quartile}-pct`);
      const countElement = document.getElementById(`${quartile}-count`);
      
      if (pctElement) pctElement.textContent = `${percentage}%`;
      if (countElement) countElement.textContent = this.stats[quartile];
    });

    // Update total count
    const totalElement = document.getElementById('total-count');
    if (totalElement) totalElement.textContent = this.stats.total;
  }

  // Add statistics box at top of page
  addStatsBox() {
    console.log('Adding stats box...');
    
    const statsBox = document.createElement('div');
    statsBox.className = 'sjr-stats-box';
    statsBox.innerHTML = `
      <div class="sjr-summary-header">
        <span class="sjr-title">Journal Rankings</span>
        <span class="sjr-beta">BETA</span>
        <span class="sjr-info">Real SJR Data</span>
        <button class="sjr-refresh" onclick="location.reload()">🔄</button>
      </div>
      <div class="sjr-quartiles">
        <div class="sjr-stat q1">
          <span class="label">Q1</span>
          <span class="percentage" id="q1-pct">0%</span>
          <span class="count" id="q1-count">0</span>
        </div>
        <div class="sjr-stat q2">
          <span class="label">Q2</span>
          <span class="percentage" id="q2-pct">0%</span>
          <span class="count" id="q2-count">0</span>
        </div>
        <div class="sjr-stat q3">
          <span class="label">Q3</span>
          <span class="percentage" id="q3-pct">0%</span>
          <span class="count" id="q3-count">0</span>
        </div>
        <div class="sjr-stat q4">
          <span class="label">Q4</span>
          <span class="percentage" id="q4-pct">0%</span>
          <span class="count" id="q4-count">0</span>
        </div>
        <div class="sjr-stat na">
          <span class="label">NA</span>
          <span class="percentage" id="na-pct">0%</span>
          <span class="count" id="na-count">0</span>
        </div>
      </div>
      <div class="sjr-note">— based on <span id="total-count">0</span> papers analyzed with real SCImago data</div>
    `;

    // Insert at top of page based on page type
    const url = window.location.href;
    let inserted = false;
    
    if (url.includes('citations?')) {
      // Profile page
      const insertionPoints = ['#gsc_a_b', '#gsc_bpf', 'body'];
      
      for (const selector of insertionPoints) {
        const container = document.querySelector(selector);
        if (container) {
          console.log(`Inserting stats box using selector: ${selector}`);
          if (selector === 'body') {
            container.insertBefore(statsBox, container.firstChild);
          } else {
            container.parentNode.insertBefore(statsBox, container);
          }
          inserted = true;
          break;
        }
      }
    } else {
      // Search page
      const insertionPoints = ['#gs_res_ccl_mid', '#gs_res_ccl', '#gs_ccl', 'body'];
      
      for (const selector of insertionPoints) {
        const container = document.querySelector(selector);
        if (container) {
          console.log(`Inserting stats box using selector: ${selector}`);
          if (selector === 'body') {
            container.insertBefore(statsBox, container.firstChild);
          } else {
            container.parentNode.insertBefore(statsBox, container);
          }
          inserted = true;
          break;
        }
      }
    }
    
    if (!inserted) {
      console.log('Could not find insertion point, appending to body');
      document.body.insertBefore(statsBox, document.body.firstChild);
    }
  }

  // Observe page changes for dynamic content
  observePageChanges() {
    const observer = new MutationObserver((mutations) => {
      let shouldProcess = false;
      
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.matches && (node.matches('.gs_r, .gs_ri, [data-lid], .gsc_a_tr') || 
                node.querySelector('.gs_r, .gs_ri, [data-lid], .gsc_a_tr'))) {
              shouldProcess = true;
            }
          }
        });
      });

      if (shouldProcess) {
        console.log('SJR Extension: Page content changed, reprocessing...');
        setTimeout(() => this.processPage(), 1000);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
}

// Initialize extension when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('SJR Extension: DOM loaded, initializing...');
    new SJRExtension();
  });
} else {
  console.log('SJR Extension: Page already loaded, initializing...');
  new SJRExtension();
}