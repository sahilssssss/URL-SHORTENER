# URL Shortener

A URL Shortener application built with **Node.js**, **PostgreSQL**, and **Vite.js**. It allows users to shorten URLs, track click stats, and generate QR codes for each shortened URL. The backend is deployed on **Render** and the frontend is deployed on **Netlify**.

## Features

- **URL Shortening**: Convert long URLs into short URLs.
- **Click Tracking**: Track how many times a shortened URL has been clicked.
- **QR Code Generation**: Automatically generate and download a QR code for any shortened URL.
- **Daily URL Limit**: Users can shorten up to 100 URLs per day.
- **Expiry Time**: Shortened URLs expire after one year.

## Tech Stack

- **Backend**:
  - **Node.js** (Express)
  - **PostgreSQL** (Database for storing URLs)
  - **Base62 Encoding** (for shortening URLs)

- **Frontend**:
  - **Vite.js** (Fast frontend build tool)
  - **React.js** (Frontend framework)

- **Deployment**:
  - **Backend**: Render
  - **Frontend**: Netlify
