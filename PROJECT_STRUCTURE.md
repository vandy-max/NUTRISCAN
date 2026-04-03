# 🚀 NutriScan Project Structure

```
nutriscan/
│
├── 📄 README.md                    # Main documentation
├── 📄 CONTRIBUTING.md              # Contribution guidelines
├── 📄 LICENSE                      # MIT License
├── 📄 package.json                 # Dependencies and scripts
├── 📄 package-lock.json            # Locked dependency versions
├── 📄 .gitignore                   # Git ignore rules
├── 📄 .env                         # Environment variables (not in repo)
│
├── 🔧 server.js                    # Main Express server
│   ├── Express app setup
│   ├── MongoDB connection
│   ├── Middleware configuration
│   ├── Route definitions
│   └── API endpoints
│
├── 🌱 seed.js                      # Database seeding script
│   └── 20 sample food items
│
├── 📁 public/                      # Frontend assets
│   ├── 📄 index.html               # Home page
│   ├── 📄 auth.html                # Login/Register page
│   ├── 📄 dashboard.html           # Main analysis dashboard
│   ├── 📄 history.html             # Analysis history viewer
│   ├── 📄 preferences.html         # User profile management
│   │
│   ├── 📁 css/
│   │   ├── 📄 style.css            # Main stylesheet
│   │   └── 📄 style.css.map        # CSS source map
│   │
│   ├── 📁 js/
│   │   ├── 📄 auth.js              # Login/Register logic
│   │   ├── 📄 dashboard.js         # Food analysis & dashboard
│   │   ├── 📄 history.js           # History page logic
│   │   ├── 📄 preferences.js       # Profile management
│   │   └── 📄 local-api.js         # Client API utilities
│   │
│   └── 📁 assets/
│       └── 📁 images/              # Logo, icons, images
│
├── 📁 models/                      # Mongoose schemas
│   ├── 📄 FoodItem.js              # Food item schema
│   └── 📄 History.js               # Analysis history schema
│
├── 📁 scripts/                     # Utility scripts
│   └── 📄 importFoodItem.js        # Food data import tool
│
├── 📁 node_modules/                # Dependencies (not in repo)
│
└── 📄 food_data.csv                # Sample food data (optional)
```

## File Descriptions

### Root Files

| File | Purpose |
|------|---------|
| `server.js` | Express server with all API endpoints and MongoDB models |
| `seed.js` | Populates MongoDB with initial 20 food items |
| `package.json` | Project metadata and npm scripts |
| `.gitignore` | Excludes node_modules, .env, logs, etc. |
| `.env` | Local environment variables (not committed) |

### Public Folder

**Main Pages:**
- `index.html` - Landing page with introduction
- `auth.html` - Login and registration forms
- `dashboard.html` - Main application with food analysis
- `history.html` - View and filter analysis history
- `preferences.html` - User profile and health settings

**JavaScript (public/js/):**
- `auth.js` - Handles user registration and login
- `dashboard.js` - Food analysis logic and display
- `history.js` - Loads and filters analysis history
- `preferences.js` - Updates user health profile
- `local-api.js` - Shared API client functions

**Styling (public/css/):**
- `style.css` - All custom styles (dark theme, animations, responsive)

**Assets (public/assets/):**
- Images: Logo, icons, food emojis, UI graphics

### Models Folder

Mongoose schema definitions used by server.js:
- User schema (username, email, password, health metrics)
- FoodItem schema (nutritional information)
- AnalysisHistory schema (user food analyses)

### Scripts Folder

Utility scripts:
- `importFoodItem.js` - Tool to import food data from CSV (optional)

## Key Technologies

| Layer | Technologies |
|-------|--------------|
| **Frontend** | HTML5, CSS3, Vanilla JavaScript, Tailwind CSS |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB, Mongoose ODM |
| **Authentication** | bcryptjs, express-session |
| **File Upload** | Multer |
| **Development** | nodemon, Sass |

## API Endpoints Structure

```
/                              # GET - Home page
├── /auth                      # GET - Login page
├── /dashboard                 # GET - Analysis page
├── /preferences              # GET - User profile
├── /history                   # GET - History page
│
├── /register                  # POST - User registration
├── /login                     # POST - User login
├── /logout                    # GET - User logout
│
├── /api/
│   ├── food/
│   │   ├── /search           # GET - Search foods
│   │   ├── /recommendations  # GET - Get recommendations
│   │   └── /analyze          # POST - Analyze food
│   ├── history/
│   │   ├── /                 # GET - Get history (paginated)
│   │   ├── /clear            # POST - Clear all history
│   │   └── /export           # POST - Export history
│   └── user/
│       ├── /data             # GET/POST - User profile
│       └── /analytics        # GET - User statistics
```

## Database Collections

### users
```json
{
  "_id": ObjectId,
  "username": "string",
  "email": "string",
  "password": "hash",
  "age": "number",
  "height": "number",
  "weight": "number",
  "bmi": "number",
  "diet_preference": "string",
  "fitness_goal": "string",
  "health_conditions": "string",
  "allergies": "string"
}
```

### fooditems
```json
{
  "_id": ObjectId,
  "food_name": "string",
  "food_type": "string",
  "calories": "number",
  "protein": "number",
  "carbs": "number",
  "fats": "number",
  "fiber": "number",
  "sugar": "number",
  "sodium": "number",
  "vitamins": ["array"],
  "minerals": ["array"],
  "health_benefits": "string",
  "suitable_for": ["array"],
  "allergens": ["array"]
}
```

### analysishistories
```json
{
  "_id": ObjectId,
  "user_id": ObjectId,
  "food_name": "string",
  "match_percentage": "number",
  "analysis_result": "object",
  "created_at": "date"
}
```

## Development Workflow

1. **Start MongoDB**
   ```bash
   # Windows
   net start MongoDB
   ```

2. **Install dependencies** (first time)
   ```bash
   npm install
   ```

3. **Create .env file**
   ```
   MONGODB_URI=mongodb://127.0.0.1:27017/nutriscan_db
   SESSION_SECRET=your-secret-key
   ```

4. **Seed database** (optional)
   ```bash
   node seed.js
   ```

5. **Start dev server**
   ```bash
   npm run dev
   ```

6. **Open in browser**
   ```
   http://localhost:3000
   ```

## Common Modifications

### Add a New Food Item Field
1. Update FoodItem schema in `server.js`
2. Update seed.js with new field
3. Update dashboard.js display logic
4. Update history.js to show new field

### Create New Analysis Page
1. Create HTML file in `public/`
2. Add corresponding JS file in `public/js/`
3. Import in index.html navigation
4. Add route in `server.js` if needed

### Change Port
1. Update `server.js`: `const port = process.env.PORT || 4000`
2. Or set env: `$env:PORT = 4000`

### Add New User Metric
1. Extend User schema in `server.js`
2. Add form field in `preferences.html`
3. Update `preferences.js` POST request
4. Display in `dashboard.js` profile summary

## Performance Considerations

- **Pagination**: History uses 10 items per page
- **Lean queries**: Read operations use `.lean()` for faster responses
- **Session storage**: Uses in-memory (consider Redis for production)
- **Image uploads**: Limited to 5MB via Multer
- **Caching**: Consider adding Redis for frequently accessed data

## Security Notes

- Passwords hashed with bcryptjs (10 salt rounds)
- Session secrets stored in `.env` (not committed)
- MongoDB ObjectIds validated before queries
- Input sanitized to prevent injection attacks
- CORS enabled appropriately

---

**For detailed API documentation, see README.md**
