# 🥗 NutriScan - Food Analysis Made Simple

Ever wondered if that pizza slice is worth it? 🍕 Or what nutrients you're actually getting from your lunch? That's what NutriScan does!

It's a web app where you can throw any food at it (via text, camera, or image), and it'll give you the nutritional breakdown instantly. Perfect for meal planning, calorie tracking, or just satisfying your curiosity about food.

**Built by food lovers, for food lovers.** 💚

## ⚡ Quick Features

- **Just type or snap a photo** → Get instant nutritional info
- **Keep a food log** → Track everything you eat with history
- **Your health profile** → Set goals (lose weight? build muscle? just be healthy?)
- **Smart recommendations** → Get food suggestions based on YOUR goals
- **Dark theme** → Because who likes bright screens at midnight? 🌙

## 🛠️ What's Under the Hood?

| Stack | Tech |
|-------|------|
| **Backend** | Node.js + Express (simple & fast) |
| **Database** | MongoDB (flexible, easy to scale) |
| **Frontend** | HTML, CSS, Vanilla JavaScript (no heavy frameworks) |
| **Auth** | bcryptjs + sessions (passwords are encrypted) |
| **File Upload** | Multer (for your food photos) |

## 📋 Before You Start

You'll need:
- **Node.js** v14+ → [Get it here](https://nodejs.org/)
- **MongoDB** → [Atlas (cloud, free tier)](https://mongodb.com/cloud/atlas) OR [Local install](https://docs.mongodb.com/manual/installation/)
- **Git** (for version control) → [Download](https://git-scm.com/)

That's it! No complicated setup.

## 🚀 Get Started in 5 Minutes

### Step 1: Clone & Install
```bash
git clone https://github.com/yourusername/nutriscan.git
cd nutriscan
npm install
```

### Step 2: Set Up Your Environment
Create a `.env` file in the project folder:
```
MONGODB_URI=mongodb://127.0.0.1:27017/nutriscan_db
SESSION_SECRET=your-super-secret-key-here-min-32chars
PORT=3000
NODE_ENV=development
```

**Not sure about MongoDB?**
- **Local**: Install MongoDB, run `mongod`
- **Cloud**: Get a free MongoDB Atlas account, paste the connection string

### Step 3: Feed It Some Data (Optional)
```bash
node seed.js
```
This adds 20 sample foods to your database. Great for testing!

### Step 4: Run It!
```bash
npm run dev
```

Open `http://localhost:3000` and start playing! 🎉

## 💡 How to Use NutriScan

### First Time?
1. **Sign up** → Choose a username, email, password
2. **Tell us about yourself** → Height, weight, diet preference, fitness goals
3. **Go to Dashboard** → This is where the magic happens

### Analyze Food
Pick your method:
- **Type it** → "Grilled chicken with brown rice and broccoli"
- **Upload a photo** → Snap a pic of your meal
- **Camera** → Real-time food capture

Click **Analyze** → See nutritional breakdown + match score

### Check Your History
Go to **History** tab → See everything you've logged
- Filter by: method, match score, date, or food name
- **Export** your data as JSON
- **Clear** if you want a fresh start

### Update Your Profile
**Preferences** page → Change your goals, diet type, health info anytime

## 📂 Project Layout (ELI5)

```
nutriscan/
├── server.js          ← The brain (handles everything)
├── seed.js            ← Pre-loaded food data
├── public/            ← What users see
│   ├── index.html     ← Home page
│   ├── dashboard.html ← Main app
│   ├── history.html   ← Your food log
│   ├── auth.html      ← Login/Signup
│   ├── css/style.css  ← Pretty colors ✨
│   └── js/            ← Magic happens here
└── models/            ← Database structure
```

See [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) for the full breakdown.

## 🔗 API Routes (For Developers)

```
POST   /register              → Create account
POST   /login                 → Sign in
GET    /logout                → Sign out

POST   /analyze-food          → Analyze a food
GET    /api/history           → Get your history
GET    /api/food/search       → Search food database
GET    /api/food/recommendations → Get suggestions

GET    /user-data             → Get your profile
POST   /user-data             → Update your profile
```

Full API docs in the code comments!

## 🔴 Oops! Something Broke?

### Server won't start
**Error: "EADDRINUSE: address already in use :::3000"**
```powershell
# Kill the old process
netstat -a -n -o | findstr :3000
taskkill /PID <NUMBER> /F

# Or use a different port
$env:PORT = 4000
npm run dev
```

### Can't connect to MongoDB
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

**Fix:**
1. **Local MongoDB not running?** Start it:
   ```bash
   # Windows
   net start MongoDB
   
   # Mac
   brew services start mongodb-community
   ```

2. **Using MongoDB Atlas?** Check your connection string in `.env`

### History not saving?
- MongoDB running? ✅
- `.env` MONGODB_URI correct? ✅
- Restart the server: `npm run dev`

Still stuck? [Open an issue](https://github.com/yourusername/nutriscan/issues) and describe what happened!

## 🤝 Working as a Team? (Group Project Guide)

### Setting Up GitHub for Your Team

#### Step 1: One Person Creates the Repository

**Person A (Project Owner):**
```bash
cd "D:\Minipj (3)\Minipj (2)\Minipj"
git commit -m "feat: Initial commit - NutriScan app"
git branch -M main
git remote add origin https://github.com/OWNER_USERNAME/nutriscan.git
git push -u origin main
```

Go to GitHub → Repository Settings → Collaborators → Add team members by username

#### Step 2: Everyone Else Clones It

**Person B, C, D, etc:**
```bash
git clone https://github.com/OWNER_USERNAME/nutriscan.git
cd nutriscan
npm install
npm run dev
```

### How to Work Together (Without Destroying Code)

#### The Golden Rule: **Never push directly to `main`** 🚫

Everyone should work on their own **branch**:

```bash
# Create your feature branch (replace with your task)
git checkout -b feature/user-authentication
# or
git checkout -b fix/history-not-loading
# or
git checkout -b docs/update-readme

# Make your changes...

# Commit with a clear message
git commit -m "fix: Dropdown visibility issue in history page"

# Push your branch
git push origin feature/user-authentication
```

#### Then Create a Pull Request (PR)

1. Go to GitHub → Your branch
2. Click **"Compare & pull request"**
3. **Write what you changed**: "Fixed dark theme dropdown visibility"
4. **Ask for review**: Tag team members
5. **Everyone reviews** → Approve once it looks good
6. **Click merge!** ✅

#### Update Your Local Code

```bash
# Switch to main
git checkout main

# Get latest from team
git pull origin main

# Create YOUR new branch for next task
git checkout -b feature/your-next-task
```

### Team Workflow (Visual)

```
main branch (shared, always works)
    ↑
    ├─ Person A: feature/dashboard → PR → Review → Merge ✅
    ├─ Person B: fix/login-bug → PR → Review → Merge ✅
    ├─ Person C: feature/history-export → PR → Review → Merge ✅
    └─ Person D: docs/update-readme → PR → Review → Merge ✅
```

### Avoiding Merge Conflicts (Golden Tips)

1. **Pull before you work**:
   ```bash
   git pull origin main
   ```

2. **Work on different features** (divide tasks!)
   - Person A: Authentication
   - Person B: Food Analysis
   - Person C: History & Export
   - Person D: Design & CSS

3. **Commit often** (small, focused commits)
   ```bash
   git commit -m "add email validation"  ✅ Good
   git commit -m "stuff"                 ❌ Bad
   ```

4. **If conflict happens**:
   ```bash
   git status  # See conflicts
   # Fix the file manually (VS Code helps!)
   git add .
   git commit -m "resolve merge conflict"
   git push
   ```

## 📝 Task Ideas for Your Team

**Split up the work:**

| Task | Difficulty | Person |
|------|-----------|--------|
| User Registration & Login | Easy | Person A |
| Food Analysis Algorithm | Medium | Person B |
| History Page & Filtering | Medium | Person C |
| Preferences/Profile Page | Easy | Person D |
| Styling & Designer Polish | Medium | Person E |
| Database Seeding & Testing | Easy | Person F |

### Checklist for Each Task

- [ ] Create a new branch (`git checkout -b feature/your-task`)
- [ ] Make your changes
- [ ] Test locally (`npm run dev`)
- [ ] Commit with clear message
- [ ] Push branch (`git push origin feature/your-task`)
- [ ] Create PR on GitHub
- [ ] Ask team to review
- [ ] Merge once approved
- [ ] Update your main branch locally

## 🎯 How to Create GitHub & Push First Time

### For the Team Lead (Person A):

1. **Go to GitHub** → [github.com/new](https://github.com/new)
2. **Name it** → `nutriscan`
3. **Description** → "AI-powered food nutrition analyzer"
4. **Public or Private?** → Your choice (Public = portfolio piece!)
5. **Don't initialize** with README (you have one!)
6. **Create repository**

7. **In your project folder**:
```bash
cd "D:\Minipj (3)\Minipj (2)\Minipj"
git remote add origin https://github.com/YOUR_USERNAME/nutriscan.git
git branch -M main
git commit -m "feat: Initial commit - NutriScan food analysis platform"
git push -u origin main
```

8. **Add your team**:
   - Go to Settings → Collaborators
   - Search by GitHub username
   - Send invites

### For the Team Members (Person B, C, D...):

1. **Accept the GitHub invite** (check your email)
2. **In terminal**:
```bash
git clone https://github.com/TEAM_LEADER_USERNAME/nutriscan.git
cd nutriscan
npm install
npm run dev
```

**That's it!** You're ready to work together 🎉

## 📊 Status Updates

Add this to your README or create a GitHub Project board:

```markdown
## Team Progress

- [ ] User Authentication (Assigned: Person A)
- [ ] Food Analysis Feature (Assigned: Person B)
- [ ] History Page (Assigned: Person C)
- [ ] Profile/Preferences (Assigned: Person D)
- [ ] Testing & Bug Fixes (Assigned: All)
- [ ] Deployment (Assigned: Team Lead)
```

Use [GitHub Projects](https://github.com/features/issues) for Kanban board!

## 🚀 Deploying (When You're Done!)

Want to show your work online? Deploy to:

- **Heroku** (easiest for beginners)
- **Vercel** (for frontend)
- **AWS** (powerful but complex)
- **DigitalOcean** (affordable VPS)

We'll add deployment guide once your app is ready!

## 🙌 Credits & License

Made with ❤️ by the NutriScan team.

Licensed under MIT → You can use this for portfolios, learning, or even publish it!

See [LICENSE](LICENSE) for details.

## 💬 Questions?

- **Team stuck?** → Open a GitHub Issue
- **Want a feature?** → Suggest it!
- **Found a bug?** → Report it with steps to reproduce

---

**Happy coding! 🚀 Now go build something awesome together!**

1. **Access the application** at `http://localhost:3000`

2. **Register a new account** or login with existing credentials

3. **Complete your health profile** in the preferences section

4. **Upload food images** or enter food details for analysis

5. **View your analysis history** and track your nutritional intake

## API Endpoints

The application provides several API endpoints:

- `GET /` - Home page
- `GET /auth` - Authentication page
- `POST /register` - User registration
- `POST /login` - User login
- `GET /dashboard` - User dashboard
- `POST /analyze` - Food analysis
- `GET /history` - Analysis history
- `GET /preferences` - User preferences

## Project Structure

```
nutriscan/
├── server.js              # Main server file
├── package.json           # Dependencies and scripts
├── start.ps1              # PowerShell startup script
├── seed.js                # Database seeding script
├── food_data.csv          # Food nutrition data
├── models/
│   ├── FoodItem.js        # Food item model
│   └── History.js         # Analysis history model
├── public/
│   ├── index.html         # Home page
│   ├── auth.html          # Login/Register page
│   ├── dashboard.html     # Main dashboard
│   ├── history.html       # History page
│   ├── preferences.html   # User preferences
│   ├── assets/
│   │   └── images/        # Static images
│   ├── css/
│   │   └── style.css      # Stylesheets
│   └── js/
│       ├── auth.js        # Authentication logic
│       ├── dashboard.js   # Dashboard functionality
│       ├── history.js     # History management
│       ├── local-api.js   # API client
│       └── preferences.js # Preferences handling
└── scripts/
    └── importFoodItem.js  # Data import script
```

## Configuration

### Environment Variables

- `MONGODB_URI`: MongoDB connection string (default: `mongodb://127.0.0.1:27017/nutriscan_db`)
- `SESSION_SECRET`: Secret key for session management (change for production)

### Database

The application uses MongoDB with the following collections:
- `users`: User accounts and profiles
- `fooditems`: Food nutrition data
- `histories`: Analysis history records

## Development

### Building CSS

If using Sass for styling:

```powershell
npm run build:css
```

### Importing Food Data

To import food data from CSV:

```powershell
npm run import-food
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Security Notes

- Change the default `SESSION_SECRET` before deploying to production
- Use HTTPS in production
- Regularly update dependencies
- Validate user inputs on both client and server side

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support or questions, please open an issue in the project repository.

---

**Happy analyzing your food with NutriScan! 🍎🥦🥑**