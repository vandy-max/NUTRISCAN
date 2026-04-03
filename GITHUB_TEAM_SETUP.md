# 🚀 GitHub Setup & Group Collaboration Guide

This guide walks you through setting up GitHub for your NutriScan group project and how to work together without destroying each other's code! 😄

---

## 📋 Table of Contents

1. [Team Lead Setup (5 min)](#team-lead-setup)
2. [Team Member Setup (2 min)](#team-member-setup)
3. [Daily Workflow](#daily-workflow)
4. [Common Mistakes & Fixes](#common-mistakes--fixes)

---

## 👨‍💼 Team Lead Setup

**This is for ONE person on your team. Everyone else can skip to Step 2.**

### Step 1: Create GitHub Account
- Go to [github.com](https://github.com)
- Click **Sign up**
- Verify email
- (Done! ✅)

### Step 2: Create a New Repository

1. Click **+** icon (top right) → **New repository**
2. **Repository name**: `nutriscan`
3. **Description**: `AI-powered food nutrition analyzer - group project`
4. **Public or Private?** → **Public** (for portfolio!) or **Private** (if confidential)
5. **Don't initialize** with README (you already have one)
6. Click **Create repository**

**Copy this URL** for your team members:
```
https://github.com/YOUR_USERNAME/nutriscan
```

### Step 3: Push Your Code

In your project folder (`D:\Minipj (3)\Minipj (2)\Minipj`):

```powershell
git remote add origin https://github.com/YOUR_USERNAME/nutriscan.git
git branch -M main
git commit -m "feat: Initial commit - NutriScan group project"
git push -u origin main
```

### Step 4: Add Your Team

On GitHub:
1. Go to your repository
2. Click **Settings** (top menu)
3. Click **Collaborators** (left sidebar)
4. Click **Add people**
5. Type each person's GitHub username
6. **Send invite!**

✅ **Team Lead is DONE!** Send the repo link to your team.

---

## 👨‍👩‍👧‍👦 Team Member Setup

**If you're NOT the team lead, follow these steps.**

### Step 1: Accept the Invitation

- Check your **GitHub email** for an invite from the team lead
- Click **Accept**

### Step 2: Clone the Repository

Choose a folder on your computer, then run:

```bash
git clone https://github.com/TEAM_LEAD_USERNAME/nutriscan.git
cd nutriscan
```

(Replace `TEAM_LEAD_USERNAME` with their actual username)

### Step 3: Install & Run

```bash
npm install
npm run dev
```

Open `http://localhost:3000` → Everything working? ✅ You're ready!

---

## 🔄 Daily Workflow

### Before You Start Work

Always pull the latest code:

```bash
git checkout main
git pull origin main
```

### When You Start a New Task

Create your own branch (named after your task):

```bash
# Example names:
git checkout -b feature/user-registration
git checkout -b feature/history-page
git checkout -b fix/dark-theme-bug
git checkout -b docs/update-readme
```

**Branch naming tips:**
- `feature/` = New feature (e.g., feature/food-search)
- `fix/` = Bug fix (e.g., fix/login-error)
- `docs/` = Documentation (e.g., docs/api-guide)

### Make Your Changes

Edit files normally. Save frequently.

### Commit Your Changes

```bash
# See what you changed
git status

# Stage your changes
git add .

# Save with a message (be descriptive!)
git commit -m "feat: Add dark theme toggle to preferences page"
```

**Good commit messages:**
```
✅ Simple noun + action:
git commit -m "add dark mode toggle"
git commit -m "fix dropdown not closing"
git commit -m "update readme with team setup"

❌ Vague messages:
git commit -m "stuff"
git commit -m "changes"
git commit -m "fixed things"
```

### Push to GitHub

```bash
git push origin feature/your-feature-name
```

### Create a Pull Request (PR)

1. Go to GitHub → Your repository
2. GitHub automatically shows: **"Your recently pushed branches"**
3. Click **Compare & pull request**
4. **Write a title**: What did you do?
   ```
   Example: "Add user registration form validation"
   ```
5. **Write a description**: Why & how?
   ```
   - Added email format validation
   - Added password strength checker
   - Shows error messages to user
   ```
6. Click **Create pull request**

### Wait for Review

Team members:
1. Go to **Pull requests** tab
2. Click on your PR
3. Click **Files changed** to see what you did
4. Add comments (suggestions, questions)
5. When good → Click **Approve**

Team lead:
1. Checks that it works
2. Checks the code looks good
3. Clicks **Merge pull request** ✅

### Update Your Local Code

After your PR is merged:

```bash
# Switch to main branch
git checkout main

# Get the merged code
git pull origin main

# Delete your old branch (we don't need it anymore)
git branch -d feature/your-feature-name
```

**Now you're ready for your NEXT task!**

---

## 🤝 Team Task Management

### Divide the Work (Before Day 1)

Create a task list in your team chat or GitHub. Example:

```
🔐 Authentication
  - [ ] Sign up form (Person A)
  - [ ] Login page (Person A)
  - [ ] Password hashing (Person A)

🍽️ Food Analysis
  - [ ] Text input analysis (Person B)
  - [ ] Image upload form (Person B)
  - [ ] Camera integration (Person B)

📜 History
  - [ ] Display history list (Person C)
  - [ ] Add filters (dropdowns) (Person C)
  - [ ] Export to JSON (Person C)

⚙️ Profile
  - [ ] Preferences page (Person D)
  - [ ] Update health info (Person D)
  - [ ] Display user stats (Person D)

🎨 Design
  - [ ] CSS improvements (Person E)
  - [ ] Dark theme polish (Person E)
  - [ ] Responsive mobile design (Person E)
```

### Use GitHub Issues (Optional but Cool)

1. Go to **Issues** tab
2. Click **New issue**
3. **Title**: "Add dark theme toggle"
4. **Description**: Full details
5. **Assign to**: Person working on it
6. Create issue

When you commit, mention it:
```bash
git commit -m "add dark theme toggle - fixes #5"
```

GitHub automatically links them! 🔗

---

## ⚠️ Common Mistakes & Fixes

### ❌ "I pushed to main by accident!"

Recovery (if no one else pulled it):
```bash
git reset --soft HEAD~1
git checkout -b feature/my-feature
git commit -m "my change"
git push origin feature/my-feature
# Create PR instead
```

**For the future**: Default to branches, never main!

### ❌ "I have merge conflicts!"

This happens when two people edit the same file. VS Code helps:

```bash
# See the conflict
git status

# Open the file in VS Code
# You'll see:
<<<<<<< HEAD
my code here
=======
their code here
>>>>>>> branch-name
```

1. **Decide which code to keep** (or keep both!)
2. Delete the `<<<`, `===`, `>>>` markers
3. Save the file
4. **Tell Git you fixed it**:
   ```bash
   git add .
   git commit -m "resolve merge conflict"
   git push
   ```

### ❌ "npm install fails for me"

```bash
# Make sure you have the latest
git pull origin main

# Delete old node_modules and reinstall
rm -r node_modules
npm install

# Try again
npm run dev
```

### ❌ "My branch is behind main"

Someone else merged code while you're working:

```bash
git fetch origin
git rebase origin/main
```

Or easier (creates a merge commit):
```bash
git merge origin/main
```

### ❌ "git says 'permission denied'"

You might not have uploaded your SSH key. Let GitHub remember your computer:

1. Settings (GitHub) → **SSH and GPG keys**
2. Click **New SSH key**
3. In terminal:
   ```bash
   ssh-keygen -t ed25519
   # Press Enter 3 times
   cat ~/.ssh/id_ed25519.pub
   # Copy the output
   ```
4. Paste into GitHub
5. Try again: `git push`

---

## 🎯 Checklist for Each Task

Before you consider your work done:

- [ ] Created a branch (`git checkout -b feature/...`)
- [ ] Made your changes
- [ ] Tested locally (`npm run dev`) - no errors?
- [ ] Committed with clear message
- [ ] Pushed to GitHub (`git push origin feature/...`)
- [ ] Created Pull Request
- [ ] Added description of what you did
- [ ] Asked team to review
- [ ] Fixed any feedback they gave
- [ ] PR is merged ✅
- [ ] Pulled latest main (`git pull origin main`)
- [ ] Ready for next task!

---

## 💡 Pro Tips for Teams

### Tip 1: Small commits are better
```bash
❌ Bad: git commit -m "finished everything"
✅ Good:
  git commit -m "add email validation"
  git commit -m "add password strength check"
  git commit -m "update error messages"
```

### Tip 2: Communicate!
- Tell team what you're building
- Ask questions in comments
- Don't wait until the end to merge

### Tip 3: Review each other's code
- Click on PR **Files changed**
- Add comments & suggestions
- This is how you learn!

### Tip 4: Test before pushing
```bash
npm run dev
# Click around for 2 minutes
# Make sure nothing breaks!
```

### Tip 5: Use .gitignore correctly

Never push:
```
node_modules/      ❌ (too big)
.env               ❌ (has secrets)
.DS_Store          ❌ (mac temp files)
```

These are already ignored, so you're safe! ✅

---

## 📊 Example: First Week Workflow

**Monday:**
```bash
git clone ...
npm install
npm run dev
👍 Everything works!
```

**Tuesday (Person A):**
```bash
git checkout main
git pull origin main
git checkout -b feature/registration
# ... edit auth.html, auth.js ...
git commit -m "add registration form"
git push origin feature/registration
# Create PR on GitHub
```

**Tuesday (Person B):**
```bash
git checkout main
git pull origin main
git checkout -b feature/dashboard
# ... edit dashboard.html ...
git commit -m "add food analysis section"
git push origin feature/dashboard
# Create PR on GitHub
```

**Wednesday:**
```
Team reviews both PRs
Person A fixes feedback
Person B fixes feedback
Both PRs merged ✅
```

**Thursday:**
```bash
git checkout main
git pull origin main
# See both features combined!
# Ready for next tasks...
```

---

## 🆘 Emergency? Can't Figure It Out?

### Safe Commands (Won't Delete Anything)
```bash
git status              # See what changed
git log                 # See commit history
git branch -a           # See all branches
git diff                # See exact changes
```

### If You Totally Broke It
```bash
# Start fresh from main
git checkout main
git pull origin main
git checkout -b feature/new-try
# Try again!
```

### Ask for Help
- Tell your team lead what happened
- Show them: `git status` and `git log`
- They can help undo things!

---

## 🎉 You're Ready!

That's it! You now know enough Git to confidently work as a team. 

**Remember:**
1. ✅ Always work on branches
2. ✅ Make small commits
3. ✅ Write clear messages
4. ✅ Ask for review
5. ✅ Pull before starting
6. ✅ Communicate with your team!

**Happy coding together!** 🚀
