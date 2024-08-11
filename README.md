[![GitHub Streak](https://github-readme-streak-stats.herokuapp.com?user=ijchavez&theme=dark&hide_border=true)](https://git.io/streak-stats)

# Note-Taking Application

This is a note-taking application built using Handlebars, Node.js, Express, and MongoDB. The application allows users to create, view, and manage their notes efficiently.

## Features

- **User Authentication**: Secure login and registration for users.
- **Create Notes**: Users can create and store notes with titles and descriptions.
- **View Notes**: Users can view a list of their notes, each with a title and description.
- **Edit and Delete Notes**: Users can edit or delete their existing notes.

## Technologies Used

- **Handlebars**: Templating engine used to generate HTML content dynamically.
- **Node.js**: JavaScript runtime environment that powers the backend of the application.
- **Express**: Web framework for Node.js used to create the server and manage routing.
- **MongoDB**: NoSQL database used to store user information and notes.

## Project Setup

To run the application locally, follow these steps:

### Prerequisites

Make sure you have the following installed:

- Node.js (version 14.x or later)
- MongoDB (running locally or a MongoDB Atlas account)

### Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/yourusername/note-taking-app.git
   cd note-taking-app
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Create a `.env` file** in the root directory and add your MongoDB URI and other environment variables:

   ```plaintext
   MONGODB_URI=your_mongodb_uri
   PORT=3000
   ```

4. **Run the application**:

   ```bash
   npm start
   ```

5. **Visit** the application in your browser:
   ```plaintext
   http://localhost:3000
   ```

## Application Structure

```plaintext
.
├── app.js           # Main application file
├── package.json     # Project metadata and dependencies
├── views/           # Handlebars templates
│   ├── layouts/
│   │   └── main.hbs # Main layout template
│   ├── partials/    # Reusable partial templates
│   └── index.hbs    # Home page template
├── public/          # Static files (CSS, JS, images)
│   ├── css/
│   └── js/
├── routes/          # Express route definitions
│   └── notes.js     # Routes related to notes
└── models/          # Mongoose models
    └── Note.js      # Note model
```
