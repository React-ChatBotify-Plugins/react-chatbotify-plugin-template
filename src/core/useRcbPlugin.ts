import { useEffect } from "react";

import { RcbPreInjectMessageEvent, useBotId } from "react-chatbotify";
import { PluginConfig } from "../types/PluginConfig";

/**
 * Plugin hook that handles all the core logic.
 *
 * @param pluginConfig configurations for the plugin
 */
const useRcbPlugin = (pluginConfig?: PluginConfig) => {
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

export default useRcbPlugin;