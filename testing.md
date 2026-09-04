# Testing Document
## Table of Contents

- [User Story Acceptance](#user-story-acceptance)
- [Navigation](#navigation)
- [Use of Validators in a Django Project](#validators)
- [Validator](#validator)
- [ESLint](#eslint)




## User Story Acceptance

### Navigation bar

As the site is only 1 page deep all pages point back to the index.html apart from the forum which is a contained suit✔️

### Logo and Hero

While the logo may not appear on each page due to overkill the theme has been maintained through out ✔️

### Responsive layout

The layout has been tested across different break points, with different break points for different screen, and on various devices ✔️

*example screen shoots*

![Index Responsive Layout](/screenshoots/responsive-index.png)

![Cocktail Responsive Layout](/screenshoots/responsive-cocktail.png)

![Admin Responsive Layout](/screenshoots/responsive-admin.png)

### Accessibility

The project follows recognised accessibility best practices, using semantic markup, high‑contrast visuals, descriptive alt text, and fully keyboard‑accessible navigation to support an inclusive user experience. ✔️

### POST — Add a Cocktail

To protect the integrity and consistency of the site’s content, users are encouraged to share their cocktail creations through the forum. This allows the admin to review submissions and decide which cocktails are formally added to the main database. ✔️

### Administration — Manage User Cocktails

A full and comprehensive admin system has been implemented to manage all cocktail data, including validation, error checking, and controlled publishing. This ensures the site remains accurate, consistent, and protected from incorrect or duplicate submissions. ✔️

### Search Form — Find Cocktails by Ingredient

The reverse‑lookup system allows users to choose a single ingredient and instantly see every cocktail that uses it. This provides a quick and intuitive way to explore drinks based on what the user already has available. ✔️

### Cocktail Information — View Full Cocktail Details 

The cocktail page displays full drink details using bold, eye‑catching imagery and a well‑structured cocktail card, making it easy for users to explore each drink in depth. ✔️

### Feedback — Collect User Feedback

User feedback is gathered through the integrated forum, allowing visitors to share thoughts, ideas, and cocktail submissions in an open and structured space. This provides a simple and effective way for users to communicate with the site while keeping all feedback organised and easy to review. ✔️

### Contact Information

As a “should‑have” requirement, contact functionality is addressed through the user forum. This provides a central, moderated space where users can post questions, share ideas, and communicate with the site, without exposing direct contact details or compromising the integrity of the platform. ✔️

### Image Buttons — Open Cocktail Details

The bespoke cocktail images act as interactive buttons, giving users a visually engaging way to explore each drink. These image‑driven controls make full use of responsive grids and modal windows, ensuring the experience feels smooth, modern, and intuitive across all devices. ✔️

### Testing Summary  

All user stories have been fully reviewed and tested to confirm that each requirement has been successfully addressed. Every feature — from cocktail management to search, feedback, and responsive design — has been validated to ensure the site behaves as intended across all devices.

## Navigation

### Index Page
- ➡️ Cocktails.html ✔️
- ➡️ Admin.html ✔️
- ➡️ User.Html ✔️

### Cocktail Page
- ➡️ Index.html ✔️

### Admin Page
- ➡️ Index.html ✔️
- ➡️ ( New Tab ) Testdata.html ✔️

### User Page
- ➡️ Index.html ✔️
- ➡️ User Forum.html ✔️

### User Forum Page
- ➡️ User.html ✔️


<a id="validators"></a>

## Use of Validators in a Django Project

### Overview
During development I used HTML, CSS, and JavaScript validators to check the quality and correctness of my code. However, Django templates contain server‑side syntax such as:

{% load static %}

{% if %} ... {% endif %}

{{ variable }}

Template inheritance blocks

These are not valid HTML or JavaScript until Django renders them. Because of this, online validators often report errors that are not genuine issues.

### ⚠️ Why Validators Misinterpret Django Templates

When a validator encounters Django template syntax, it attempts to parse it as raw HTML or JavaScript. This leads to false errors such as:

- “Illegal character { in attribute”

- “Stray start tag html”

- “Missing `<title>` element”

- “Unexpected token”

- “Duplicate IDs”

- “Cannot recover after last error”

These errors occur because the validator is reading template code, not the final rendered HTML.

### 🔍 Correct Validation Method
To validate Django pages properly, I validated the rendered output, not the template source.

Steps taken:
- Opened the page in the browser.

- Used View Page Source to capture the fully rendered HTML.

- Submitted that HTML to the validator.

- Confirmed that all genuine HTML issues were resolved.

This method ensures the validator sees the actual HTML that the browser receives — without Django syntax.

### 🛠️ Genuine Issues Identified & Fixed
Any real issues flagged by validators or browser dev tools were corrected, including:

*Some real examples*
- Adding `<!DOCTYPE html>`

- Adding `<html lang="en">`

- Removing trailing slashes from void elements

- Correcting heading hierarchy

- Improving ARIA labels and modal accessibility

- Ensuring unique IDs

- Moving `<script>` inside <body>

- Ensuring keyboard accessibility for interactive elements

All legitimate warnings were addressed.

### 🧪 Final Testing
After validation, pages are tested thoroughly using:

- Chrome DevTools

- Firefox Developer Edition

- Responsive/mobile view

- Keyboard‑only navigation

- Screen reader checks (NVDA / VoiceOver)

Ensuring all functionality work as expected:
- Modal opens and closes correctly

- Keyboard navigation triggers modal correctly

- ARIA labels announce content properly

- Images load with fallbacks

- No console errors

- No accessibility blockers

### 📌 Conclusion
HTML/JS validators and Django templates do not mix, because validators cannot interpret Django’s server‑side syntax. By validating the rendered HTML and addressing all genuine issues, the final pages are:

- structurally correct

- accessible

- standards‑compliant

- fully functional after testing

This demonstrates responsible use of validation tools within a Django development workflow and where ever possible due to size limitations screenshots are provided.


## Validator

### index.html

![index.html](/screenshoots/validate-index.html.png)

**<p style="color:green;">✔️ No warnings</p>**

### cocktail_list.html

![cocktail_list.html](/screenshoots/validate-cocktail_list.html.png)

**<p style="color:red;">⚠️ Warning</p>**

The modal heading (`<h2 id="modal-name">`) is intentionally empty in the static HTML because its content is injected dynamically. This follows standard accessible modal patterns: the heading acts as a placeholder and is updated at runtime, with aria-live="polite" ensuring screen readers announce the change. 

**<p style="color:green;">📌 Conclusion</p>**

Since the heading is populated immediately upon modal activation, it does not create any accessibility issues, and the validator warning can be safely ignored.

### iframe ingredients lookup

![ingredients lookup](/screenshoots/validate-iframe-ingredients-lookup.html.png)

**<p style="color:red;">⚠️ Warning</p>**

Some HTML validator warnings were intentionally ignored because the pages are rendered inside an iframe and are not standalone documents. The iframe content acts as a UI component rather than a full webpage, so requirements such as a `<title>` element or top‑level `<h1>` heading do not apply.

<p style="color:green;">📌 Conclusion</p>
These warnings do not affect functionality or accessibility, as the parent document provides the overall page structure.

### iframe cocktail lookup

![cocktail lookup](/screenshoots/validate-iframe-cocktail-lookup.html.png)

**<p style="color:red;">⚠️ Warning</p>**

Validator Warnings (Iframe Child Page)
The HTML validator reports missing `<title>` and missing `<h1>` heading for the iframe child page. These warnings were intentionally ignored because the iframe content is not a standalone webpage. It is embedded inside the parent document, which already provides the required page‑level metadata and heading structure.

**<p style="color:green;">📌 Conclusion</p>**

The iframe acts only as a UI component, so document‑level requirements do not apply and the warnings have no impact on functionality or accessibility.

### forum.html

![forum.html](/screenshoots/validate-forum.html.png)

**<p style="color:green;">✔️ No warnings</p>**

### thread_detail.html

![thread_detail.html](/screenshoots/validate-thread_detail.html.png)

**<p style="color:green;">✔️ No warnings</p>**

### new_thread.html

![new_thread.html](/screenshoots/validate-new_thread.html.png)

**<p style="color:green;">✔️ No warnings</p>**

### user.html

![user.html](/screenshoots/validate-user.html.png)

**<p style="color:green;">✔️ No warnings</p>**

### testdata.html

![testdata.html](/screenshoots/validate-testdata.html.png)

**<p style="color:green;">✔️ No warnings</p>**

### admin.html

![admin.html](/screenshoots/validate-admin.html.png)

**<p style="color:green;">✔️ No warnings</p>**

<a id="eslint"></a>

## JavaScript Validation (ESLint v9+)

- Installed and configured ESLint using the new eslint.config.js format

- Added ignore rules for Django admin JS, vendor scripts, jQuery, and virtual environment

- Enabled ES2021 syntax and browser globals

- Ran ESLint across all project JavaScript files

- Result: 0 errors, 6 warnings

- Warnings related only to unused imports and unused variables

- No functional issues detected

- Confirms that the JavaScript codebase is clean, modern, and stable

### ESLint output

C:\projects\shaken-not-stirred\static\js\admin\add.js
  3:3  warning  'closeModal' is defined but never used  no-unused-vars
  4:3  warning  'openModal' is defined but never used   no-unused-vars

C:\projects\shaken-not-stirred\static\js\admin\customise.js
  3:3  warning  'closeModal' is defined but never used  no-unused-vars

C:\projects\shaken-not-stirred\static\js\admin\history.js
  5:3  warning  'getCSRFToken' is defined but never used  no-unused-vars

C:\projects\shaken-not-stirred\static\js\admin\recipes.js
    5:3   warning  'getCSRFToken' is defined but never used       no-unused-vars
  171:11  warning  'fullList' is assigned a value but never used  no-unused-vars

Ô£û 6 problems (0 errors, 6 warnings)

**<p style="color:green;">📌 Conclusion</p>**

 I reviewed each warning, removed the redundant code, and re‑ran the validator. ESLint now reports no errors and no warnings, confirming that the JavaScript codebase is clean, modern, and fully compliant with ES2021 standards.

**<p style="color:green;">✔️ No warnings</p>**