# Anonymous Chat App

A real-time anonymous chat application built with Next.js, TypeScript, and shadcn/ui, powered by Apache Kafka for message streaming.

## 🚀 Features

- **Real-time Messaging**: Instant message delivery using Kafka streams
- **Anonymous Users**: Chat without revealing your identity
- **Modern UI**: Beautiful interface built with shadcn/ui components
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Auto-scroll**: Messages automatically scroll to the latest
- **User Avatars**: Colorful avatars with user initials
- **Message Timestamps**: Real-time message timestamps
- **Online Users**: Display number of online users

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Backend**: Apache Kafka (via Python producer/consumer APIs)
- **Containerization**: Docker

## 📦 Installation

### Prerequisites

- Node.js 18+
- Docker and Docker Compose
- Kafka Playground running (see main README)

### Development Setup

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Start the development server**:

   ```bash
   npm run dev
   ```

3. **Open the application**:
   - Navigate to http://localhost:3000

### Production Setup

1. **Build the Docker image**:

   ```bash
   docker build -t anonymous-chat .
   ```

2. **Run with Docker Compose** (from the main project directory):
   ```bash
   docker compose up anonymous-chat
   ```

## 🏗️ Project Structure

```
anonymous-chat/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Main page component
│   │   └── globals.css           # Global styles
│   ├── components/
│   │   ├── ui/                   # shadcn/ui components
│   │   └── chat/                 # Chat-specific components
│   │       ├── ChatContainer.tsx # Main chat container
│   │       ├── ChatHeader.tsx    # Chat header with stats
│   │       ├── ChatInput.tsx     # Message input component
│   │       └── ChatMessage.tsx   # Individual message component
│   └── lib/
│       └── utils.ts              # Utility functions
├── Dockerfile                    # Docker configuration
├── next.config.ts               # Next.js configuration
└── package.json                 # Dependencies
```

## 🔧 Configuration

### Environment Variables

The app connects to the Kafka producer and consumer APIs running on:

- **Producer API**: http://localhost:8001
- **Consumer API**: http://localhost:8002

### Kafka Topic

Messages are sent to the `anonymous-chat` topic in Kafka.

## 🎨 UI Components

### ChatContainer

The main component that orchestrates the chat functionality:

- Manages message state
- Handles API communication
- Provides real-time updates

### ChatHeader

Displays chat room information:

- Room name
- Online user count
- Total message count

### ChatMessage

Renders individual messages:

- User avatar with initials
- Message content
- Timestamp
- Own vs other user styling

### ChatInput

Handles message input:

- Textarea for message composition
- Send button
- Enter key support (Shift+Enter for new line)

## 🔄 Message Flow

1. **User types message** in ChatInput
2. **Message sent** to Kafka producer API
3. **Message stored** in Kafka topic
4. **Consumer API polls** for new messages
5. **Messages displayed** in real-time in the UI

## 🐳 Docker Deployment

### Build Image

```bash
docker build -t anonymous-chat .
```

### Run Container

```bash
docker run -p 3000:3000 anonymous-chat
```

### With Docker Compose

```bash
# From the main project directory
docker compose up anonymous-chat
```

## 🧪 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Style

The project uses:

- **TypeScript** for type safety
- **ESLint** for code linting
- **Prettier** for code formatting
- **Tailwind CSS** for styling

## 🔌 API Integration

### Producer API

- **Endpoint**: `POST /produce-simple`
- **Format**: Form data
- **Fields**: topic, key, message

### Consumer API

- **Endpoint**: `POST /consume`
- **Format**: JSON
- **Fields**: topic, max_messages, timeout

## 🎯 Use Cases

### Learning Kafka

- Real-time message streaming
- Producer-consumer patterns
- Topic management
- Message persistence

### Development

- Modern React patterns
- TypeScript best practices
- Component architecture
- API integration

### Demonstrations

- Real-time applications
- Kafka capabilities
- Modern web development

## 🚀 Performance

- **Optimized Build**: Next.js standalone output
- **Image Optimization**: Next.js image optimization
- **Code Splitting**: Automatic code splitting
- **Caching**: Built-in caching strategies

## 🔒 Security

- **Anonymous Users**: No personal data collection
- **CORS**: Configured for local development
- **Input Validation**: Client-side validation
- **XSS Protection**: React built-in protection

## 📱 Responsive Design

The application is fully responsive and works on:

- **Desktop**: Full-featured experience
- **Tablet**: Optimized layout
- **Mobile**: Touch-friendly interface

## 🎨 Customization

### Styling

- Modify `src/app/globals.css` for global styles
- Update component styles in individual files
- Customize Tailwind configuration

### Features

- Add new chat rooms
- Implement user authentication
- Add file sharing
- Include emoji support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is part of the Kafka Playground and is licensed under the MIT License.

## 🆘 Support

For issues and questions:

1. Check the main project README
2. Review the troubleshooting guide
3. Check the web interfaces guide
4. Open an issue on GitHub

---

**Enjoy chatting anonymously with Kafka!** 🎉
