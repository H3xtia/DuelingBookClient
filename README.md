# DuelingBookClient

Welcome to the DuelingBookClient project! This project is a custom client for the DuelingBook website, built with **Electron** for desktop. It allows users to interact with DuelingBook more easily by incorporating custom themes.

## Prerequisites

Before getting started, you'll need the following tools installed:

- **Node.js** (v16 or higher): [Download Node.js](https://nodejs.org/)
- **Git**: [Download Git](https://git-scm.com/)

## Getting Started

Follow the steps below to get the project running locally on your machine.

### 1. Clone the Repository

Open your terminal or command prompt and run the following command to clone this repository:

```bash
git clone https://github.com/H3xtia/DuelingBookClient.git
```

### 2. Install Dependencies
This project uses npm (Node Package Manager) to handle dependencies. To install the required packages, run:

```bash
npm install
```
This will install all the necessary dependencies, including Electron.

### 3. Build the Project (For Distribution)
If you want to package as .exe for example, follow these steps to build it for your platform:

Install Electron Packager: Electron Packager is a tool that allows you to package the app into executable files for different platforms. Run the following command to install it:

```bash
npm install electron-packager --save-dev
```

Build for Your Platform: After installing Electron Packager, you can build the app for your current platform (Windows, Mac, or Linux). To build the app, run one of the following commands:

For Windows:

```bash
npm run package-win
```

For macOS:

```bash
npm run package-mac
```

For Linux:

```bash
npm run package-linux
```

These commands will create a packaged version of the app in the ./dist folder.

### 4. Running the Project
Once the dependencies are installed and the project is open in VS Code, you can run the Electron app.

Open the terminal in VS Code (or use the integrated terminal).
Run the following command to start the app:
bash
Copy code
npm start
This will launch the application, and you should see the DuelingBookClient window pop up. It will load the DuelingBook website and allow you to interact with it.

### 5. Modifying Themes
To change or add custom themes:

Navigate to the themes/ folder in the project directory.
Create a new folder in there and name it as the name of the theme.
Create style.css file in it and give it a custom code. This is what will be used.
Right-click on the app window to access the context menu and switch between themes.
