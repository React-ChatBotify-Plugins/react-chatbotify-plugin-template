import fs from "fs";
import readline from "readline";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const setupCompletedFlag = path.join(__dirname, ".setup_completed");
const setupScriptPath = path.join(__dirname, "setup.js");

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

// prompts user for cleanup after setup
const promptForCleanup = () => {
	rl.question("\nWould you like to delete this setup script and the completion flag? (yes/no): ", (answer) => {
		if (answer.toLowerCase() === "yes") {
			// Delete setup.js and .setup_completed file
			fs.unlinkSync(setupScriptPath);
			fs.unlinkSync(setupCompletedFlag);
			console.log("\x1b[32m%s\x1b[0m", "Setup script and completion flag deleted.");
		} else {
			console.log("Setup script and completion flag retained.");
		}
		rl.close(); // Close readline here to avoid duplicate close calls
	});
}

// starts the setup process
const startSetup = () => {
	// validates package names according to npm package name rules
	const packageNamePattern = /^(?:(?:@(?:[a-z0-9-*~][a-z0-9-*._~]*)?\/[a-z0-9-._~])|[a-z0-9-~])[a-z0-9-._~]*$/;

	// displays header for setup
	console.log("\x1b[36m%s\x1b[0m", "========================================");
	console.log("\x1b[36m%s\x1b[0m", " React ChatBotify Plugin Template Setup");
	console.log("\x1b[36m%s\x1b[0m", "========================================\n");
	console.log("This setup will configure your plugin\"s name, description, export name and carry out initial installations.\n");

	// questions to prompt during setup
	const questions = [
		{
			question: "\x1b[33m[Prompt] Plugin name (must match npm package naming rules): \x1b[0m",
			key: "name",
			validate: (input) => packageNamePattern.test(input) ? true : "Invalid package name. Please try again.",
		},
		{ question: "\x1b[33m[Prompt] Plugin description: \x1b[0m", key: "description" },
		{ question: "\x1b[33m[Prompt] Export name (default export of your plugin): \x1b[0m", key: "exportName" },
	];

	let answers = {};

	const askQuestion = (index) => {
		if (index < questions.length) {
			rl.question(questions[index].question, (answer) => {
				const { validate } = questions[index];
				const validationResult = validate ? validate(answer) : true;
				
				if (validationResult !== true) {
					console.log(`\x1b[31m${validationResult}\x1b[0m`); // Display error message in red
					askQuestion(index); // Repeat the question
				} else {
					answers[questions[index].key] = answer;
					askQuestion(index + 1); // Move to the next question
				}
			});
		} else {
			updateFiles();
		}
	};

	const updateFiles = () => {
		// updates package.json
		const packageJsonPath = path.join(__dirname, "package.json");
		const packageData = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
		packageData.name = answers.name;
		packageData.description = answers.description;
		fs.writeFileSync(packageJsonPath, JSON.stringify(packageData, null, 2));

		// updates index.tsx
		const indexPath = path.join(__dirname, "src", "index.tsx");
		let indexContent = fs.readFileSync(indexPath, "utf8");
		indexContent = indexContent.replace(/import\s+(\w+)\s+from\s+(".+");/, `import ${answers.exportName} from $2;`);
		indexContent = indexContent.replace(/export default .+;/, `export default ${answers.exportName};`);
		fs.writeFileSync(indexPath, indexContent);

		// updates vite.config.js
		const viteConfigPath = path.join(__dirname, "vite.config.js");
		let viteConfigContent = fs.readFileSync(viteConfigPath, "utf8");
		viteConfigContent = viteConfigContent.replace(/name:\s*["'][^"']*["']/, `name: "${answers.name}"`);
		fs.writeFileSync(viteConfigPath, viteConfigContent);

		// removes package-lock.json
		const packageLockPath = path.join(__dirname, "package-lock.json");
		if (fs.existsSync(packageLockPath)) {
			fs.unlinkSync(packageLockPath);
			console.log("Preparing fresh installation...");
		}

		// runs npm install to install dependencies
		try {
			console.log("Installing packages...");
			execSync("npm install", { stdio: "inherit" });
		} catch (error) {
			console.error("Error running npm install:", error);
		}

		// marks setup as completed by creating the .setup_completed file
		fs.writeFileSync(setupCompletedFlag, "Setup completed");

		// print setup complete message with further instructions
		console.log("\x1b[32m%s\x1b[0m", "[Info] Setup Complete!");
		console.log("\nNext steps:");
		console.log("1. Run the following command to start the development server:");
		console.log("   \x1b[33m%s\x1b[0m", "npm run start");
		console.log("2. Visit the application in your browser at:");
		console.log("   \x1b[34m%s\x1b[0m", "http://localhost:5173");

		// prompts the user to delete the setup script and .setup_completed file
		promptForCleanup();
	};

	askQuestion(0);
}

// checks and warns if setup was already completed
if (fs.existsSync(setupCompletedFlag)) {
	console.log("\x1b[33m%s\x1b[0m", "Warning: Setup has already been completed once. Running it again may cause issues.");
	
	rl.question("Do you want to proceed with the setup? (yes/no): ", (answer) => {
		if (answer.toLowerCase() !== "yes") {
			console.log("Setup aborted.");
			rl.close();
			process.exit(0);
		} else {
			console.log("Proceeding with setup...\n");
			startSetup();
		}
	});
} else {
	startSetup();
}
