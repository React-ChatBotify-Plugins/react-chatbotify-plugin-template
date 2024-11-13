import ChatBot, { Flow } from "react-chatbotify";

import RcbPlugin from "./factory/RcbPluginFactory";

const App = () => {
	// initialize example plugin
	const plugins = [RcbPlugin()];

	// example flow for testing
	const flow: Flow = {
		start: {
			message: "Hello! I'm using an example plugin that reverses all your message strings, send a message to try!",
			path: "try_again",
		},
		try_again : {
			message: "Look at how your message string is reversed! Try again!",
			path: "try_again",
		}
	}

	return (
		<ChatBot
			id="chatbot-id"
			plugins={plugins}
			flow={flow}
		></ChatBot>
	);
}

export default App;