import { useEffect } from "react";

import { useBotId, RcbPreInjectMessageEvent } from "react-chatbotify";
import { PluginConfig } from "../types/PluginConfig";
import { DefaultPluginConfig } from "../constants/DefaultPluginConfig";

// example plugin that reverses all messages sent by the user if it is a string
const RcbPlugin = ({
	pluginConfig = DefaultPluginConfig
}: {
	pluginConfig?: PluginConfig
} = {}) => {
	const useRcbPlugin = () => {
		// uses hook to get bot id
		const { getBotId } = useBotId();

		// provides plugin logic
		useEffect(() => {
			// handles message sent
			const handlePreInjectMessage = (event: RcbPreInjectMessageEvent) => {
				// checks bot id to prevent conflicts with multiple chatbots
				if (getBotId() !== event.detail.botId) {
					return;
				}

				// checks if message is from user
				if (event.data.message.sender.toUpperCase() !== "USER") {
					return;
				}

				// checks if message content is a string (it may be a JSX element)
				const message = event.data.message;
				if (typeof message.content !== "string") {
					return;
				}

				// reverses the message string if it is
				message.content = message.content.split("").reverse().join("");
			};

			// relies on rcb-pre-inject-message event to intercept and modify messages
			window.addEventListener("rcb-pre-inject-message", handlePreInjectMessage);
			return () => {
				window.removeEventListener("rcb-pre-inject-message", handlePreInjectMessage);
			};
		}, [getBotId]);

		// name is a required field, recommended to match the npm package name to be unique
		const pluginMetaData = {name: "rcb-example-plugin", settings: {}};

		// if auto config is true, then automatically enable the require events (or other settings as required)
		if (pluginConfig?.autoConfig) {
			pluginMetaData.settings = {
				event: {
					rcbPreInjectMessage: true
				}
			}
		}

		// returns plugin metadata to be consumed by the core library
		return pluginMetaData;
	};

	return useRcbPlugin;
};

export default RcbPlugin;