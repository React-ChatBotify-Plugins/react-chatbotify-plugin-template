/**
 * Specifies the configurations for this example plugin.
 */
export type PluginConfig = {
    autoConfig?: boolean; // defaults to true, helps user to enable the required events
    promptColor?: {
        [key: string]: string;
    };
}