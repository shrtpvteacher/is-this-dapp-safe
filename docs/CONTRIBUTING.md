# Contributing to Is This Web3 dApp Safe?

Thank you for your interest in contributing to our Web3 security analysis tool! This document provides guidelines for contributing to the project.

## 🤝 Code of Conduct

We are committed to providing a welcoming and inclusive environment for all contributors. Please treat everyone with respect and kindness.

## 🚀 How to Contribute

### Reporting Bugs

1. **Check existing issues** to avoid duplicates
2. **Use the bug report template** when creating new issues
3. **Include detailed information**:
   - Steps to reproduce
   - Expected vs actual behavior
   - System information (OS, Node.js version, etc.)
   - Screenshots or logs if applicable

### Suggesting Features

1. **Check the roadmap** to see if it's already planned
2. **Open a discussion** first for major features
3. **Use the feature request template**
4. **Explain the use case** and potential implementation

### Code Contributions

#### Development Setup

1. **Fork the repository**
   ```bash
   git clone https://github.com/your-username/is-this-dapp-safe.git
   cd is-this-dapp-safe
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Set up environment**
   ```bash
   cp .env.example .env
   # Add your API keys if testing contract analysis
   ```

#### Code Standards

- **ES6+ JavaScript** - Use modern JavaScript features
- **Functional programming** - Prefer pure functions where possible
- **Clear naming** - Use descriptive variable and function names
- **Comments** - Document complex logic and security considerations
- **Error handling** - Always handle errors gracefully
- **Security first** - Consider security implications of all changes

#### File Organization

- Keep files under 300 lines
- One main function/class per file
- Use proper imports/exports
- Group related functionality

#### Testing

- Add tests for new features
- Ensure all tests pass: `npm test`
- Test CLI functionality: `npm run cli analyze <test-url>`
- Test web interface manually

#### Documentation

- Update README.md for new features
- Add JSDoc comments for functions
- Update API documentation
- Include examples where helpful

## 🛠️ Development Guidelines

### Adding New Analysis Features

1. **Create module in `/analysis/`**
   ```javascript
   // analysis/newFeature.js
   export async function analyzeNewFeature(data) {
     // Implementation
   }
   ```

2. **Update main scanner**
   ```javascript
   // analysis/puppeteerScan.js or contractScanner.js
   import { analyzeNewFeature } from './newFeature.js';
   ```

3. **Add to report generation**
   ```javascript
   // utils/generateReport.js
   // Include new analysis in report structure
   ```

### Adding New UI Components

1. **Create component in `/src/frontend/`**
   ```jsx
   // src/frontend/NewComponent.tsx
   export const NewComponent: React.FC = () => {
     return <div>Component content</div>;
   };
   ```

2. **Follow design system**
   - Use Tailwind CSS classes
   - Maintain consistent spacing (8px system)
   - Follow color scheme (dark theme)
   - Include hover states and transitions

3. **Add proper TypeScript types**
   ```typescript
   interface ComponentProps {
     data: AnalysisData;
     onAction: (action: string) => void;
   }
   ```

### Adding API Endpoints

1. **Add route to `/backend/server.js`**
   ```javascript
   app.get('/api/new-endpoint', async (req, res) => {
     try {
       // Implementation
       res.json({ success: true, data });
     } catch (error) {
       res.status(500).json({ success: false, error: error.message });
     }
   });
   ```

2. **Include error handling**
3. **Add input validation**
4. **Document the endpoint**

## 🧪 Testing

### Manual Testing Checklist

- [ ] Web interface loads correctly
- [ ] URL input validation works
- [ ] Analysis progress indicators function
- [ ] Reports display properly
- [ ] Export functionality works (JSON/MD)
- [ ] CLI commands execute successfully
- [ ] Error handling displays appropriate messages

### Automated Testing

```bash
# Run all tests
npm test

# Run specific test file
npm test -- --grep "contract analysis"

# Run with coverage
npm run test:coverage
```

## 📝 Pull Request Process

1. **Ensure all tests pass**
   ```bash
   npm run lint
   npm run format
   npm test
   ```

2. **Update documentation**
   - README.md for user-facing changes
   - Code comments for complex logic
   - API documentation for new endpoints

3. **Write descriptive PR description**
   - What changes were made
   - Why they were necessary
   - How to test the changes
   - Any breaking changes

4. **Request review**
   - Assign relevant reviewers
   - Address feedback promptly
   - Keep PR focused and small when possible

## 🎯 Areas for Contribution

### High Priority
- **Additional blockchain support** (Polygon, BSC, Arbitrum)
- **Advanced static analysis** integration
- **Browser extension** development
- **Performance optimizations**
- **Security hardening**

### Medium Priority
- **UI/UX improvements**
- **Additional export formats**
- **More contract risk patterns**
- **Integration with other security tools**
- **Internationalization**

### Low Priority
- **Code refactoring**
- **Documentation improvements**
- **Example dApps for testing**
- **Additional CLI commands**

## 🚨 Security Considerations

When contributing to a security tool:

1. **Never commit sensitive data** (API keys, private keys, etc.)
2. **Validate all inputs** to prevent injection attacks
3. **Use secure defaults** for all configurations
4. **Consider attack vectors** in new features
5. **Test with malicious inputs** when possible
6. **Document security assumptions**

## 🏆 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes for significant contributions
- Hall of fame for major features
- Special recognition for security researchers

## 📞 Getting Help

- **Discord**: Join our community server
- **Discussions**: Use GitHub Discussions for questions
- **Issues**: Create an issue for bugs
- **Email**: security@is-this-dapp-safe.com for security concerns

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for helping make Web3 safer for everyone! 🛡️