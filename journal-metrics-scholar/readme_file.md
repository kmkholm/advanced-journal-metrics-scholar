# SJR Journal Rankings Chrome Extension

A Chrome extension that displays SCImago Journal Rank (SJR) quartiles and impact metrics directly in Google Scholar search results.

**Created by:** Dr. Mohammed Tawfik  
**Email:** kmkhol01@gmail.com  
**Version:** 1.0.0

## Features

- ✅ **Real-time Journal Rankings**: Displays SJR quartiles (Q1-Q4) for journals in Google Scholar
- ✅ **Visual Indicators**: Color-coded quartile badges (Green=Q1, Orange=Q2, Yellow=Q3, Red=Q4)
- ✅ **Statistics Summary**: Shows distribution of journal rankings on the current page
- ✅ **Journal Search**: Built-in journal lookup functionality
- ✅ **Customizable Settings**: Toggle display options for different metrics
- ✅ **Automatic Updates**: Keeps journal database current

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

3. **Convert SVG to PNG Icons**
   - Use the provided SVG icon and convert it to PNG format in sizes: 16x16, 32x32, 48x48, and 128x128 pixels
   - Save them in the `icons` folder with the specified names

4. **Load Extension in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right corner)
   - Click "Load unpacked"
   - Select the `sjr-journal-rankings` folder
   - The extension should now appear in your extensions list

5. **Pin the Extension**
   - Click the extensions icon (puzzle piece) in Chrome toolbar
   - Pin the "SJR Journal Rankings" extension for easy access

### Method 2: Chrome Web Store (For Distribution)

To publish this extension on the Chrome Web Store:

1. **Prepare for Submission**
   - Ensure all files are properly organized
   - Test thoroughly on different Google Scholar pages
   - Create promotional images and screenshots

2. **Submit to Chrome Web Store**
   - Visit [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/)
   - Pay the $5 developer registration fee
   - Upload the extension as a ZIP file
   - Fill out the store listing details
   - Submit for review

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

### Adding More Journals
Edit the `sampleJournals` array in `content.js` to include additional journals:

```javascript
const sampleJournals = [
  { name: "Your Journal Name", sjr: 2.34, quartile: "Q1", hIndex: 123 },
  // Add more journals here
];
```

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