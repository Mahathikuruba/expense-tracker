# Expense Tracker

A simple and user-friendly web application for managing personal expenses. The application allows users to securely log in, add and manage their expenses, organize expenses by category, visualize spending patterns, and print their expense records.

## Features

* User Registration and Login
* Firebase Authentication
* Add new expenses
* Edit and delete expenses
* Categorize expenses
* View expense history
* Track total spending
* Visualize expenses using charts
* Print expense records using the browser's built-in Print functionality
* Save expense records as PDF through the browser's **Print → Save as PDF** option
* Responsive user interface
* Cloud-based data storage using Firebase Firestore

## Technologies Used

### Frontend

* React.js
* JavaScript
* HTML
* CSS
* Tailwind CSS

### Backend / Database

* Firebase Authentication
* Firebase Firestore

### Libraries

* Recharts – for data visualization

### Tools

* Visual Studio Code
* Git
* GitHub
* Firebase

## Application Workflow

The application follows a simple workflow:

1. The user creates an account or logs in using Firebase Authentication.
2. After login, the user can add an expense by entering details such as amount, category, date, and description.
3. Expense information is stored in Firebase Firestore.
4. The application retrieves the user's expenses and displays them in the expense history.
5. Users can edit or delete their expenses.
6. The dashboard summarizes the user's spending.
7. Charts provide a visual representation of expenses by category.
8. Users can use the browser's Print functionality to print their expense records or save them as a PDF.

## Expense Categories

The application supports different expense categories such as:

* Food
* Rent
* Travel
* Shopping

These categories help users organize and understand their spending habits.

## Data Visualization

The application uses **Recharts** to represent expense information visually.

Charts help users understand:

* Total spending
* Spending by category
* Distribution of expenses

## Printing and PDF

The application uses the browser's built-in **Print** functionality instead of a separate PDF generation library.

Users can:

1. Open the expense records.
2. Select the Print option.
3. Use the browser's print dialog.
4. Select **Save as PDF** to save a copy of their expense records.

This keeps the implementation simple without requiring an additional PDF-generation library.

## Database

The application uses **Firebase Firestore** to store expense information.

Expense records contain information such as:

* Amount
* Category
* Date
* Description
* User information

Firebase Authentication is used to authenticate users and control access to their expense data.

## Future Enhancements

Some possible improvements for the project include:

* Monthly and yearly expense analysis
* Advanced expense filtering
* Search functionality
* Budget tracking
* Spending alerts
* More detailed financial reports
* Improved dashboard analytics
* Dark mode

## Author

**Sai Mahathi Kuruba**

GitHub:
https://github.com/Mahathikuruba

## License

This project is developed for educational and portfolio purposes.
