# NextHire

NextHire is an interactive interview preparation platform that helps candidates practice for technical interviews through MCQs, coding challenges, and mock interviews. The platform supports multiple roles including Software Engineer, Product Manager, and more.

## Demo

🎥 **Watch the Demo Video:**

[![NextHire Demo](https://cdn.loom.com/sessions/thumbnails/placeholder.png)](https://www.loom.com/share/your-video-id)

*Click the image above to watch a comprehensive demo of NextHire's features and functionality.*

## Features

- 🎯 Role-specific practice questions
- 📝 Multiple Choice Questions (MCQs)
- 🔄 Dynamic question generation
- 📊 Performance tracking dashboard
- 🎨 Modern, responsive UI
- 🔐 Secure user authentication
- 📱 Mobile-friendly design

## Tech Stack

### Frontend
- React with TypeScript
- Vite for build tooling
- Axios for API calls
- Framer Motion for animations
- Tailwind CSS for styling

### Backend
- Python Flask
- SQLAlchemy ORM
- JWT for authentication
- OpenAI integration for question generation
- SQLite database

## Project Structure

```
NextHire/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── assets/          # Static assets
│   │   ├── components/      # Reusable UI components
│   │   ├── context/         # React context providers
│   │   ├── pages/          # Page components
│   │   │   ├── auth/       # Authentication pages
│   │   │   └── ...         # Other page components
│   │   ├── App.tsx         # Main application component
│   │   └── main.tsx        # Application entry point
│   ├── public/             # Public assets
│   └── package.json        # Frontend dependencies
│
├── backend/                 # Flask backend application
│   ├── app.py              # Main application file
│   ├── initial_data.py     # Initial database data
│   ├── schema.sql          # Database schema
│   ├── requirements.txt    # Python dependencies
│   └── instance/           # Instance-specific files
│
└── .gitignore              # Git ignore rules

```

## Setup Instructions

### Backend Setup

1. Create and activate a virtual environment:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Set up environment variables:
   Create a `.env` file in the backend directory with:
   ```
   JWT_SECRET_KEY=your_secure_secret_key
   OPENAI_API_KEY=your_openai_api_key
   FLASK_ENV=development
   ```

4. Run the backend server:
   ```bash
   python app.py
   ```

### Frontend Setup

1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- POST `/api/auth/signup` - User registration
- POST `/api/auth/login` - User login
- GET `/api/auth/user` - Get current user

### MCQs
- GET `/api/mcq/<role>` - Get MCQs for specific role
- POST `/api/mcq/generate` - Generate new MCQ
- GET `/api/mcq/<role>/topics` - Get topics for role

### Dashboard
- GET `/api/dashboard/stats` - Get user statistics
- GET `/api/dashboard/responses` - Get user responses

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

Copyright 2024 NextHire

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License. 