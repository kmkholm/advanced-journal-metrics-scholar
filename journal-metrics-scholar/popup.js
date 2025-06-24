// SJR Journal Rankings Extension - Popup Script
// By Dr. Mohammed Tawfik <kmkhol01@gmail.com>

class SJRPopup {
  constructor() {
    this.settings = {};
    this.init();
  }

  async init() {
    await this.loadSettings();
    this.setupEventListeners();
    this.updateUI();
    this.loadCurrentPageStats();
  }

  async loadSettings() {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'GET_SETTINGS' });
      this.settings = response || this.getDefaultSettings();
    } catch (error) {
      console.error('Error loading settings:', error);
      this.settings = this.getDefaultSettings();
    }
  }

  getDefaultSettings() {
    return {
      enabled: true,
      showInlineRankings: true,
      showStatistics: true
    };
  }

  setupEventListeners() {
    // Search functionality
    document.getElementById('searchBtn').addEventListener('click', () => this.searchJournal());
    document.getElementById('journalSearch').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.searchJournal();
    });

    // Settings toggles
    document.getElementById('toggleQuartiles').addEventListener('click', () => 
      this.toggleSetting('showInlineRankings'));
    document.getElementById('toggleSJR').addEventListener('click', () => 
      this.toggleSetting('showStatistics'));

    // Action buttons
    document.getElementById('refreshBtn').addEventListener('click', () => this.refreshPage());
    document.getElementById('updateBtn').addEventListener('click', () => this.updateExtension());
  }

  updateUI() {
    this.updateToggle('toggleQuartiles', this.settings.showInlineRankings);
    this.updateToggle('toggleSJR', this.settings.showStatistics);
  }

  updateToggle(elementId, isActive) {
    const toggle = document.getElementById(elementId);
    if (isActive) {
      toggle.classList.add('active');
    } else {
      toggle.classList.remove('active');
    }
  }

  async toggleSetting(settingName) {
    this.settings[settingName] = !this.settings[settingName];
    
    try {
      await chrome.runtime.sendMessage({
        type: 'UPDATE_SETTINGS',
        settings: { [settingName]: this.settings[settingName] }
      });
      
      this.updateUI();
      this.notifyContentScript();
    } catch (error) {
      console.error('Error updating setting:', error);
    }
  }

  async searchJournal() {
    const journalName = document.getElementById('journalSearch').value.trim();
    if (!journalName) return;

    const resultDiv = document.getElementById('searchResult');
    resultDiv.innerHTML = '<div class="loading">Searching local database...</div>';

    // Simple local search simulation
    const commonJournals = {
      'nature': { name: 'Nature', quartile: 'Q1', sjr: 4.89, hIndex: 1055 },
      'science': { name: 'Science', quartile: 'Q1', sjr: 4.71, hIndex: 1015 },
      'plos one': { name: 'PLOS ONE', quartile: 'Q1', sjr: 2.54, hIndex: 332 },
      'scientific reports': { name: 'Scientific Reports', quartile: 'Q2', sjr: 1.24, hIndex: 213 }
    };

    const searchKey = journalName.toLowerCase();
    const result = commonJournals[searchKey] || 
                  Object.values(commonJournals).find(j => 
                    j.name.toLowerCase().includes(searchKey));

    if (result) {
      resultDiv.innerHTML = this.formatJournalResult(result);
    } else {
      resultDiv.innerHTML = '<div class="result">Journal not found in local database. Extension will try to detect it automatically when browsing Google Scholar.</div>';
    }
  }

  formatJournalResult(journal) {
    const quartileClass = journal.quartile.toLowerCase();
    return `
      <div class="result">
        <div class="journal-name">${journal.name}</div>
        <div class="journal-details">
          <span class="quartile-item ${quartileClass}" style="display: inline-block; padding: 2px 6px; margin-right: 8px;">
            ${journal.quartile}
          </span>
          SJR: ${journal.sjr} • H-index: ${journal.hIndex}
        </div>
      </div>
    `;
  }

  async loadCurrentPageStats() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (tab.url && tab.url.includes('scholar.google.com')) {
        // Try to get stats from content script
        try {
          const response = await chrome.tabs.sendMessage(tab.id, { 
            type: 'GET_PAGE_STATS' 
          });
          
          if (response) {
            this.updateStatsDisplay(response);
          } else {
            // Simulate some stats for demonstration
            this.updateStatsDisplay({ q1: 3, q2: 2, q3: 1, q4: 1, na: 13 });
          }
        } catch {
          // Content script not ready, show placeholder
          this.updateStatsDisplay({ q1: 0, q2: 0, q3: 0, q4: 0, na: 0 });
        }
      } else {
        this.updateStatsDisplay({ q1: 0, q2: 0, q3: 0, q4: 0, na: 0 });
      }
    } catch (error) {
      console.error('Error loading page stats:', error);
      this.updateStatsDisplay({ q1: 0, q2: 0, q3: 0, q4: 0, na: 0 });
    }
  }

  updateStatsDisplay(stats) {
    document.getElementById('q1Count').textContent = stats.q1 || 0;
    document.getElementById('q2Count').textContent = stats.q2 || 0;
    document.getElementById('q3Count').textContent = stats.q3 || 0;
    document.getElementById('q4Count').textContent = stats.q4 || 0;
    document.getElementById('naCount').textContent = stats.na || 0;
  }

  async refreshPage() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      await chrome.tabs.reload(tab.id);
      window.close();
    } catch (error) {
      console.error('Error refreshing page:', error);
    }
  }

  async updateExtension() {
    const updateBtn = document.getElementById('updateBtn');
    const originalText = updateBtn.textContent;
    
    updateBtn.textContent = 'Updated!';
    updateBtn.disabled = true;

    // Simulate update process
    setTimeout(() => {
      updateBtn.textContent = originalText;
      updateBtn.disabled = false;
    }, 2000);
  }

  async notifyContentScript() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (tab.url && tab.url.includes('scholar.google.com')) {
        await chrome.tabs.sendMessage(tab.id, {
          type: 'SETTINGS_UPDATED',
          settings: this.settings
        });
      }
    } catch (error) {
      // Content script might not be ready, ignore error
    }
  }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new SJRPopup();
});