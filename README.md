# OilOps360 v1

OilOps360 is a static HTML, CSS, and JavaScript prototype for oil and gas operations compliance. This version focuses on two modules:

- Contractor Compliance
- Asset Inspection

Together, these modules demonstrate CRUD operations, document/file tracking, dashboard metrics, search and filtering, user roles, and simple CSV reporting without requiring a backend.

## Project Structure

```text
oilops360/
├── index.html
├── dashboard.html
├── contractors.html
├── assets.html
├── README.md
├── css/
│   └── style.css
├── js/
│   ├── dashboard.js
│   ├── contractors.js
│   └── assets.js
└── images/
    └── oilfield.svg
```

## Pages

### `index.html`

Login screen for the prototype. The form stores a simple demo user object in `localStorage` and redirects to `dashboard.html`.

Demo values are already filled in:

- Email: `admin@oilops360.com`
- Password: `oilops360`
- Role: `Compliance Manager`, `Inspector`, or `Viewer`

The password is not validated because this is a frontend-only prototype.

### `dashboard.html`

Main dashboard showing operational KPIs:

- Total contractors
- Total assets
- Pending contractor documents
- Recent inspections
- Contractor compliance status
- Asset inspection queue
- Compliance summary meters

It also includes a CSV export for the dashboard summary.

### `contractors.html`

Contractor Compliance module. Users can:

- Add contractors
- Edit contractors
- Delete contractors
- Track document names from uploaded files
- Search by company, contact, or scope
- Filter by compliance status
- Export contractor records to CSV

Contractor records are saved in browser `localStorage` under:

```text
oilops360Contractors
```

### `assets.html`

Asset Inspection module. Users can:

- Add assets
- Edit assets
- Delete assets
- Track inspection file names
- Search by asset name, location, inspector, or type
- Filter by condition
- Export asset inspection records to CSV

Asset records are saved in browser `localStorage` under:

```text
oilops360Assets
```

## How Data Works

This project does not use a database. Data is stored in the browser using `localStorage`.

On first load, the JavaScript files seed demo data for contractors and assets. After that, any create, edit, or delete action updates the stored browser data.

To reset the demo data, clear the browser storage for the site, or run this in the browser console:

```js
localStorage.removeItem("oilops360Contractors");
localStorage.removeItem("oilops360Assets");
localStorage.removeItem("oilops360User");
```

Then reload `index.html`.

## User Roles

The login page lets you choose a demo role:

- `Compliance Manager`
- `Inspector`
- `Viewer`

In this prototype, `Viewer` mode disables editing controls on the contractor and asset pages. Manager and inspector roles can create, edit, and delete records.

## File and Document Management

The file inputs are prototype-only. They capture and display selected file names, but they do not upload or store the actual files.

This keeps the app backend-free while still demonstrating how document management would appear in the workflow.

## Reporting

Each reporting action generates a CSV file in the browser:

- Dashboard summary export
- Contractor report export
- Asset inspection report export

The CSV files are created from the current `localStorage` records.

## How To Run

Because this is a static project, you can open it directly in a browser:

```text
index.html
```

For the most reliable behavior, especially with browser security rules, serve the folder with a local static server:

```bash
python -m http.server 4173
```

Then open:

```text
http://127.0.0.1:4173/index.html
```

Run the command from inside the `oilops360` folder.

## Suggested Backend Upgrade Path

When moving beyond the frontend prototype, the next backend features would be:

- Real authentication and authorization
- Contractor and asset database tables
- File upload and storage
- Audit history for compliance changes
- Inspection scheduling and reminders
- Role-based API permissions
- Server-generated reports

## Current Limitations

- No real authentication
- No backend database
- Uploaded files are not persisted, only file names are tracked
- CSV exports are generated client-side
- Data is stored per browser/device

## Tech Stack

- HTML
- CSS
- Vanilla JavaScript
- Browser `localStorage`
