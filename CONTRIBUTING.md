# CONTRIBUTING.md

## Contributing to NutriScan

Thank you for your interest in contributing to NutriScan! We welcome all contributions, from bug reports to feature implementations.

## How to Contribute

### Reporting Bugs

1. **Check existing issues** to avoid duplicates
2. **Provide clear details**:
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Screenshots (if applicable)
   - Node and npm versions: `node --version && npm --version`
   - MongoDB version: `mongod --version`

### Suggesting Enhancements

1. Use the GitHub Issues with the `enhancement` label
2. Clearly describe the feature and its benefits
3. Provide use case examples

### Code Contributions

#### Setup Development Environment

```bash
# Clone and setup
git clone https://github.com/yourusername/nutriscan.git
cd nutriscan
npm install

# Create feature branch
git checkout -b feature/your-feature-name
```

#### Code Standards

- **JavaScript**: Use ES6+ syntax
- **Naming**: Use camelCase for variables/functions, PascalCase for classes
- **Comments**: Add comments for complex logic
- **Async**: Use async/await instead of callbacks

#### Testing

Before submitting:

```bash
# Ensure no console errors
npm run dev

# Test functionality:
# - User registration/login
# - Food analysis (all input methods)
# - History filtering and export
# - Profile updates
```

#### Git Workflow

1. **Update main branch**:
   ```bash
   git fetch origin
   git rebase origin/main
   ```

2. **Write commit messages**:
   ```
   [Category] Brief description
   
   Detailed explanation if needed.
   
   Fixes #issue-number
   ```

   **Categories**: `fix:`, `feat:`, `docs:`, `style:`, `refactor:`, `test:`

3. **Example**:
   ```
   feat: Add dark mode toggle
   
   - Implements theme persistence in localStorage
   - Updates CSS for dark theme compatibility
   - Adds UI toggle button in navigation
   
   Fixes #123
   ```

3. **Push and create PR**:
   ```bash
   git push origin feature/your-feature-name
   ```

#### Pull Request Guidelines

- **Title**: Clear and descriptive
- **Description**: Explain changes and why
- **Tests**: Confirm manual testing completed
- **Screenshots**: Include for UI changes
- **Related Issues**: Reference with `Fixes #123`

### Development Tips

#### Common Tasks

**Adding a new API endpoint:**
1. Define route in `server.js`
2. Create validation logic
3. Add error handling
4. Return JSON responses
5. Test with Postman/curl

**Adding a new UI page:**
1. Create HTML file in `public/`
2. Add JavaScript file in `public/js/`
3. Update navigation in header
4. Add CSS styles in `public/css/style.css`
5. Test responsiveness

**Database changes:**
1. Update schema in `server.js`
2. Create migration script if needed
3. Update seed data
4. Test with fresh database

#### Debugging

```bash
# Enable detailed logging
$env:DEBUG = 'nutriscan:*'
npm run dev

# Check database
mongo
use nutriscan_db
db.users.find().pretty()

# Monitor network (browser DevTools)
# Press F12 → Network tab → analyze requests
```

## Review Process

1. Maintainers review your PR
2. Feedback/changes requested if needed
3. Once approved, PR is merged
4. You'll be added to contributors list!

## Community Guidelines

- Be respectful and inclusive
- No harassment or discrimination
- Focus on constructive feedback
- Help others learn and grow

## Questions?

- Ask in GitHub Issues
- Email: maintainers@nutriscan.dev
- Check Wiki for detailed documentation

Thank you for making NutriScan better! 🙏
