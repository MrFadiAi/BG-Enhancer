## Setup

1. Clone this repository
   ```bash
   git clone [repository_url]
   cd [repository_name]
   ```

2. Copy `config.example.js` to `config.js`
   ```bash
   cp config.example.js config.js
   ```

3. Fill in your Firebase configuration details in `config.js`

4. Install dependencies
   ```bash
   npm install
   ```
   or
   ```bash
   yarn install
   ```

5. Build the project
   ```bash
   npm run build
   ```
   or
   ```bash
   yarn build
   ```

6. Load the extension in your browser:
   - For Chrome:
     - Open `chrome://extensions/`
     - Enable "Developer mode" in the top right
     - Click "Load unpacked" and select the project directory

7. Test the extension:
   - Click on the extension icon in your browser toolbar
   - The popup should appear
   - Interact with the extension to ensure it's working as expected

## Development

- Make changes to relevant files (`popup/popup.js`, `popup/app.css`, `expanded.js`, etc.)
- Rebuild the project (step 5)
- Reload the extension in the browser to see your changes

## Version Control

- The `.gitignore` file is set up to exclude certain files/directories
- Do not commit your `config.js` file with sensitive information

## Expanding the Extension

- To add new features, you may need to modify `webpack.config.js` to include new entry points or adjust the build process

## Documentation

- Keep this README updated with any new setup steps or usage instructions as you develop the extension

For more detailed information on extension development and best practices, consult the official documentation for Chrome extensions or your target browser.