# SJR Journal Rankings Chrome Extension

A Chrome extension that **automatically downloads and uses REAL SCImago Journal Rank (SJR)** data to display quartiles and impact metrics directly in Google Scholar search results and profile pages.

**Created by:** Dr. Mohammed Tawfik  
**Email:** kmkhol01@gmail.com  
**Version:** 1.0.0

## Features

- ✅ **REAL SJR Data**: Downloads complete database (31,000+ journals) directly from scimagojr.com
- ✅ **Automatic Updates**: Downloads fresh SJR data every 30 days
- ✅ **Profile Page Support**: Works perfectly on Google Scholar profile pages
- ✅ **Inline Quartile Badges**: Shows Q1/Q2/Q3/Q4 badges directly in front of each paper title
- ✅ **Visual Indicators**: Color-coded quartile badges (Green=Q1, Orange=Q2, Yellow=Q3, Red=Q4)
- ✅ **Live Statistics**: Shows real-time distribution of journal rankings on current page
- ✅ **Smart Journal Parsing**: Advanced parsing for different Google Scholar citation formats
- ✅ **Works Everywhere**: Search results, profile pages, and citation pages
- ✅ **No Manual Database**: Uses official SCImago CSV download for always up-to-date data

## Installation Instructions

### Method 1: Developer Mode (Recommended for Testing)

1. **Download the Extension Files**
   - Save all files in a folder named `sjr-journal-rankings`
   - Create an `icons` subfolder and save the icon as different sizes

2. **Prepare the Files Structure**
   ```
   sjr-journal-rankings/
   ├── manifest.json
   ├── content.js
   ├── background.js
   ├── popup.html
   ├── popup.js
   ├── styles.css
   └── icons/
       ├── icon16.png
       ├── icon32.png
       ├── icon48.png
       └── icon128.png
   ```



## Usage

1. **Navigate to Google Scholar**
   - Go to [scholar.google.com](https://scholar.google.com)
   - Perform any search

2. **View Journal Rankings**
   - Journal rankings will automatically appear below paper titles
   - Color-coded quartile indicators show journal quality
   - Summary statistics appear at the top of results

3. **Use Extension Features**
   - Click the extension icon to open the popup
   - Search for specific journals
   - Adjust display settings
   - View current page statistics

## File Descriptions

- **`manifest.json`**: Extension configuration and permissions
- **`content.js`**: Main script that processes Google Scholar pages
- **`background.js`**: Service worker for background tasks and API calls
- **`popup.html`**: User interface for the extension popup
- **`popup.js`**: Popup functionality and settings management
- **`styles.css`**: Styling for journal ranking indicators
- **`icons/`**: Extension icons in various sizes

## Customization

## How It Works

1. **Database Download**: Automatically downloads complete SJR database from scimagojr.com on first install
2. **Journal Detection**: Parses paper citations to extract journal names using multiple patterns
3. **Real-time Lookup**: Searches the 31,000+ journal database for exact matches
4. **Quartile Display**: Shows color-coded badges directly in front of each paper title
5. **Live Statistics**: Updates quartile distribution stats in real-time
6. **Auto-refresh**: Downloads fresh SJR data every 30 days to stay current

## Data Sources

- **SCImago Journal & Country Rank**: Complete database downloaded from `https://www.scimagojr.com/journalrank.php?out=xls`
- **31,000+ Journals**: Covers all disciplines with latest quartile classifications
- **Automatic Updates**: Fresh data downloaded every 30 days
- **Cached Locally**: Fast lookups with local storage for performance

## Accuracy

- ✅ **Official SJR Data**: Always uses latest data directly from SCImago database
- ✅ **Complete Coverage**: 31,000+ journals across all disciplines  
- ✅ **Auto-updating**: Refreshes every 30 days to stay current with new rankings
- ✅ **No Hardcoded Data**: All rankings come from official SCImago source

### Modifying Appearance
Edit `styles.css` to customize:
- Color schemes for quartile indicators
- Layout and spacing
- Typography and fonts

### Adding Features
Extend functionality by modifying:
- `content.js` for new page processing features
- `popup.js` for additional UI controls
- `background.js` for new API integrations

## Technical Requirements

- **Chrome Version**: 88+ (Manifest V3 support)
- **Permissions Required**:
  - `activeTab`: Access to current tab
  - `storage`: Save user preferences
  - `host_permissions`: Access to Google Scholar and SJR API

## Troubleshooting

### Extension Not Working
1. Check if you're on a Google Scholar page
2. Refresh the page after installing
3. Check browser console for errors (F12 → Console)

### Rankings Not Appearing
1. Verify journal names are in the database
2. Check network connectivity
3. Try refreshing the extension

### Performance Issues
1. Disable other extensions temporarily
2. Clear browser cache
3. Update Chrome to latest version

## Data Sources

- **SCImago Journal & Country Rank**: Primary source for SJR metrics
- **CrossRef API**: Backup source for journal information
- **Local Database**: Cached journal data for offline functionality

## Privacy & Security

- Extension only accesses Google Scholar pages
- No personal data is collected or transmitted
- Journal lookup data is cached locally for performance
- No external tracking or analytics

## Contributing

To contribute to this extension:

1. Fork the repository
2. Make your changes
3. Test thoroughly on different journal types
4. Submit a pull request with detailed description

## License

This extension is created for academic and research purposes. Feel free to modify and distribute according to your institution's needs.

## Support

For technical support or feature requests:
- **Email**: kmkhol01@gmail.com
- **Issues**: Report bugs and suggest improvements

## Changelog

### Version 1.0.0
- Initial release
- Basic SJR quartile display
- Google Scholar integration
- Journal search functionality
- Settings management
- Statistics summary

---

**Developed by Dr. Mohammed Tawfik**  
*Enhancing academic research through better journal quality indicators*
