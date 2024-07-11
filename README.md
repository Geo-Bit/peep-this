# Peep This

**Peep This** is an application dedicated to unearthing lesser-known, dusty gems of 80's and 90's Hip Hop tracks. As an enthusiast of 80's & 90's Hip Hop, finding hidden gems that have slipped under the radar can be tough. This application aims to suggest a daily Hip Hop track, focusing on the lesser-known and underrated songs, accompanied by unique descriptions of the tracks and artists.

## Tech Stack

The application leverages the following technologies:

- **Backend**: Node.js, Express.js, Axios, Google APIs (YouTube), Discogs API, OpenAI API
- **Frontend**: React.js, Axios, FontAwesome for icons
- **Styling**: CSS

## Setup and Installation

To run this application on your local machine, follow these steps:

1. **Clone the repository**

2. **Install dependencies** for both backend and frontend:

   ```sh
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Setup .env file**: Create a `.env` file in the `backend` directory with the following content:

   ```env
   DISCOGS_CONSUMER_KEY=your_discogs_consumer_key
   DISCOGS_CONSUMER_SECRET=your_discogs_consumer_secret
   YOUTUBE_API_KEY=your_youtube_api_key
   OPENAI_API_KEY=your_openai_api_key
   ```

4. **Run the application**:

   ```sh
   # Start the backend server
   cd backend
   npm start

   # Start the frontend development server
   cd ../frontend
   npm start
   ```

5. **Access the application**: Open your browser and go to `http://localhost:3000` to see the application in action.

## Future Enhancements

- **Enhanced Track Filtering**: Improve the algorithm to find even more hidden gems with better filtering criteria.

## Contributing

Feel free to fork the repository and submit pull requests. For major changes, please open an issue first to discuss what you would like to change.
