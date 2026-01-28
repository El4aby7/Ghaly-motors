# Luxe & Lifestyle | Premium Automotive Group

This is a static website for a luxury automotive dealership, featuring a Homepage and a dynamic Inventory page.

## How it Works

The website uses a simple client-side "backend" approach to ensure it can be hosted on static platforms like GitHub Pages without needing a server or database.

*   **Data Source:** All vehicle data is stored in `assets/data/vehicles.json`. This acts as our database.
*   **Inventory Logic:** `assets/js/inventory.js` fetches this JSON data when the page loads and dynamically generates the HTML for the vehicle cards.
*   **Filtering:** The filtering logic (Search by name/year and Filter by Make) happens entirely in the browser using JavaScript.

## Project Structure

*   `index.html`: The landing page with featured inventory and promotional sections.
*   `inventory.html`: The main inventory listing page with search and filter functionality.
*   `assets/data/vehicles.json`: The database file containing vehicle details.
*   `assets/js/inventory.js`: The logic script for the inventory page.

## Deployment Instructions (GitHub Pages)

To deploy this website for free using GitHub Pages:

1.  **Push the code** to a GitHub repository.
2.  Go to the repository **Settings**.
3.  Click on **Pages** in the left sidebar.
4.  Under **Build and deployment** > **Source**, select **Deploy from a branch**.
5.  Under **Branch**, select `main` (or your current branch) and `/ (root)`.
6.  Click **Save**.
7.  Wait a minute or two, and GitHub will provide you with a live URL (e.g., `https://yourusername.github.io/repo-name/`).

## Editing Content

To add or remove vehicles, simply edit the `assets/data/vehicles.json` file. Ensure you maintain the JSON structure:

```json
{
  "id": 1,
  "make": "Brand",
  "model": "Model Name",
  "year": 2024,
  "mileage": 1000,
  "price": 50000,
  "image": "image_url_here",
  "tags": ["Tag1", "Tag2"],
  "type": "SUV",
  "specs": [
    { "label": "Spec 1", "value": "Value 1" },
    { "label": "Spec 2", "value": "Value 2" },
    { "label": "Spec 3", "value": "Value 3" }
  ]
}
```
