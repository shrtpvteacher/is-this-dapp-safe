# Is This Web3 dApp Safe? 🛡️

A professional-grade, open-source Web3 security analysis tool that analyzes dApp frontend behavior, smart contract interactions, and potential security risks.

![Security Scanner](https://images.pexels.com/photos/60504/security-protection-anti-virus-software-60504.jpeg?auto=compress&cs=tinysrgb&w=800)

## 🚀 Features

- **Frontend Analysis**: Deep inspection of UI interactions, wallet connections, and user flows
- **Smart Contract Security**: Bytecode analysis, function detection, and risk assessment  
- **Mock Wallet Environment**: Safe testing without connecting real wallets
- **Comprehensive Reports**: Detailed analysis with JSON and Markdown export
- **CLI & Web Interface**: Use via command line or modern web interface
- **Open Source**: MIT licensed and community-driven

## 🏃‍♂️ Quick Start

### Web Interface

```bash
# Install dependencies
npm install

# Start the application
npm run dev

# Open http://localhost:5173 in your browser
```

### CLI Usage

```bash
# Analyze a dApp
npm run cli analyze https://example-dapp.com

# View previous scans
npm run cli list

# Help
npm run cli --help
```

## 📋 Requirements

- Node.js 18+
- npm or yarn
- Chrome/Chromium (for Puppeteer)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/web3-security/is-this-dapp-safe.git
   cd is-this-dapp-safe
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Optional: Add API keys**
   ```bash
   cp .env.example .env
   # Edit .env with your Etherscan API key for enhanced contract analysis
   ```

4. **Start development**
   ```bash
   npm run dev
   ```

## 🏗️ Architecture

```
├── frontend/           # React UI components
├── backend/           # Express.js API server
├── analysis/          # Core analysis modules
│   ├── puppeteerScan.js    # Frontend behavior analysis
│   ├── contractScanner.js  # Smart contract analysis
│   └── signatureInspector.js # Transaction analysis
├── cli/               # Command-line interface
├── hardhat/           # Smart contract testing environment
└── utils/             # Helper functions and utilities
```

## 🔍 How It Works

1. **Safe Environment**: Launches a sandboxed browser with mock wallet
2. **Frontend Analysis**: Records all user interactions and wallet requests
3. **Contract Discovery**: Extracts smart contract addresses from the dApp
4. **Bytecode Analysis**: Fetches and analyzes contract code for risks
5. **Risk Assessment**: Generates comprehensive security report
6. **Export Options**: Save results as JSON or Markdown

## 📊 Report Sections

### Frontend Behavior
- Interactive elements and their actions
- Wallet connection requests
- Signature prompts and transaction details
- External script dependencies
- API calls and data collection

### Smart Contract Analysis
- Contract addresses and verification status
- Function signatures and capabilities
- Dangerous opcodes and patterns
- Proxy contract detection
- Ownership and upgrade mechanisms

### Risk Summary
- Overall security score (0-100)
- Risk level: Safe, Warning, or Danger
- Specific issues and recommendations
- Verification status and trust indicators

## 🛠️ Development

### Running Tests
```bash
# Run Hardhat tests
npm run hardhat:compile
npm run hardhat:test

# Start local blockchain
npm run hardhat:node
```

### Building for Production
```bash
npm run build
```

### Code Quality
```bash
# Format code
npm run format

# Lint code
npm run lint
```

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Ensure code quality: `npm run lint && npm run format`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## 📜 API Documentation

### Analyze Endpoint
```bash
POST /api/analyze
Content-Type: application/json

{
  "url": "https://example-dapp.com"
}
```

### Get Report
```bash
GET /api/reports/{scanId}
```

### List Scans
```bash
GET /api/scans
```

## 🚨 Security Considerations

- This tool analyzes dApps in a controlled environment
- Always verify results independently
- Never connect real wallets to untrusted dApps
- Use additional security tools for comprehensive analysis

## 🌟 Use Cases

- **Due Diligence**: Before interacting with new dApps
- **Security Research**: Understanding dApp attack vectors
- **Education**: Learning about Web3 security patterns
- **Development**: Testing your own dApp security
- **Community**: Sharing security analysis with others

## 📈 Roadmap

- [ ] Advanced static analysis integration
- [ ] Support for additional blockchains
- [ ] Machine learning risk scoring
- [ ] Browser extension
- [ ] Integration with popular security tools
- [ ] Community risk database

## 🔗 Links

- [Website](https://is-this-dapp-safe.com)
- [Documentation](https://docs.is-this-dapp-safe.com)
- [Issues](https://github.com/web3-security/is-this-dapp-safe/issues)
- [Discussions](https://github.com/web3-security/is-this-dapp-safe/discussions)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Puppeteer](https://pptr.dev/) for browser automation
- [Hardhat](https://hardhat.org/) for smart contract testing
- [4byte.directory](https://www.4byte.directory/) for function signatures
- [Etherscan](https://etherscan.io/) for contract verification
- The Web3 security community for inspiration and feedback

---

**⚠️ Disclaimer**: This tool is for educational and research purposes. Always conduct independent security analysis before interacting with Web3 applications. The authors are not responsible for any losses incurred.