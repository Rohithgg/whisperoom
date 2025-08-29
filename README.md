# WhispeRoom 🗣️

A secure, temporary private chat application built with React Native and Expo. Create password-protected chat rooms for private conversations that disappear when the session ends.

## 📱 Features

- **🔒 Secure Temporary Chats**: End-to-end temporary messaging with automatic session cleanup
- **🛡️ Password Protected Rooms**: Create secure rooms with custom passwords
- **⚡ Real-time Messaging**: Instant message delivery using Supabase real-time subscriptions
- **📱 Cross-Platform**: Works on iOS, Android, and Web
- **🎨 Modern UI**: Beautiful gradient design with smooth animations
- **🔐 No Data Persistence**: Messages are temporary and rooms are automatically cleaned up

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- Supabase account and project

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Rohithgg/whisperoom.git
   cd whisperoom
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up Supabase Database**
   
   Create the following tables in your Supabase project:

   ```sql
   -- Rooms table
   CREATE TABLE rooms (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     room_code VARCHAR(6) UNIQUE NOT NULL,
     password_hash TEXT NOT NULL,
     created_by TEXT NOT NULL,
     is_active BOOLEAN DEFAULT true,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Messages table
   CREATE TABLE messages (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
     sender TEXT NOT NULL,
     content TEXT NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Enable Row Level Security
   ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
   ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

   -- Create policies for rooms
   CREATE POLICY "Anyone can read active rooms" ON rooms
     FOR SELECT USING (is_active = true);

   CREATE POLICY "Anyone can create rooms" ON rooms
     FOR INSERT WITH CHECK (true);

   CREATE POLICY "Anyone can update rooms" ON rooms
     FOR UPDATE USING (true);

   -- Create policies for messages
   CREATE POLICY "Anyone can read messages" ON messages
     FOR SELECT USING (true);

   CREATE POLICY "Anyone can insert messages" ON messages
     FOR INSERT WITH CHECK (true);
   ```

5. **Start the development server**
   ```bash
   npm expo start
   ```

## 📖 How to Use

### Creating a Room
1. Open the app and tap **"Create Room"**
2. Enter your nickname and a secure password
3. Share the generated room code with others
4. Start chatting!

### Joining a Room
1. Tap **"Join Room"**
2. Enter the room code and password
3. Choose your nickname
4. Join the conversation

### Ending a Session
- The room creator can end the session, which will close the room for all participants
- All messages are permanently deleted when a session ends

## 🛠️ Tech Stack

- **Frontend**: React Native with Expo
- **Navigation**: Expo Router
- **Backend**: Supabase (PostgreSQL + Real-time)
- **Styling**: React Native StyleSheet with Linear Gradients
- **Icons**: Lucide React Native
- **State Management**: React Context API
- **Security**: SHA-256 password hashing

## 📱 Platform Support

- **iOS**: ✅ Native app via Expo
- **Android**: ✅ Native app via Expo  
- **Web**: ✅ Progressive Web App

## 🏗️ Project Structure

```
├── app/                    # App screens (Expo Router)
│   ├── _layout.tsx        # Root layout
│   ├── index.tsx          # Home screen
│   ├── create-room.tsx    # Create room screen
│   ├── join-room.tsx      # Join room screen
│   ├── chat.tsx           # Chat screen
│   └── session-ended.tsx  # Session ended screen
├── contexts/              # React contexts
│   └── ChatContext.tsx    # Chat state management
├── utils/                 # Utility functions
│   └── supabaseHelpers.ts # Supabase API helpers
├── assets/                # Static assets
├── android/               # Android native code
└── supabaseClient.ts      # Supabase configuration
```

## 🔧 Available Scripts

```bash
# Start development server
npm run dev

# Build for web
npm run build:web

# Run on Android
npm run android

# Run on iOS  
npm run ios

# Lint code
npm run lint
```

## 🔒 Security Features

- **Password Hashing**: All passwords are hashed using SHA-256
- **Temporary Data**: Messages and rooms are automatically cleaned up
- **No Persistent Storage**: No chat history is stored long-term
- **Room Isolation**: Users can only access rooms they know the code and password for

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Issues & Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/Rohithgg/whisperoom/issues) page
2. Create a new issue if your problem isn't already reported
3. Provide detailed information about your environment and the issue

## 🚀 Deployment

### Web Deployment
```bash
npm run build:web
# Deploy the `dist` folder to your preferred hosting service
```

### Mobile App Stores
```bash
# Build for app stores
expo build:android
expo build:ios
```

## 📞 Contact

- **Repository**: [https://github.com/Rohithgg/whisperoom](https://github.com/Rohithgg/whisperoom)
- **Issues**: [https://github.com/Rohithgg/whisperoom/issues](https://github.com/Rohithgg/whisperoom/issues)

---

Made with ❤️ using React Native and Expo
