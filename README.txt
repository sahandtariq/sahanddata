PERSON SEARCH — IndexedDB Mobile Version

RUN:
1. Extract the ZIP.
2. Open index.html directly.
3. No Python, Node.js, localhost, or server is required.

FIRST START:
The first start imports the data into the browser's IndexedDB. This can take
some time because the dataset contains about 1,048,575 records. Keep the page
open until the progress reaches 100%.

AFTER FIRST START:
The data stays in IndexedDB on that device/browser. Opening the app again does
NOT import the full dataset again. Searches use IndexedDB indexes and are much
lighter than scanning the complete JavaScript dataset every time.

IMPORTANT:
- Do not clear the browser's site data if you want to keep the local database.
- If you need to import the original data again, press the ↻ button and confirm.
- This package uses 40 small data chunks so the browser does not parse the
  entire ~100 MB JavaScript file into memory at once.
- Search is automatic after a short 180 ms pause while typing.
- Name, father, grandfather, age/birth-year and family ID are indexed.

PRIVACY:
The dataset contains personal information. Keep it local and do not publish or
distribute it unless you have the required authority and permissions.
