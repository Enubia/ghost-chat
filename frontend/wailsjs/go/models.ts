export namespace config {
	
	export class KickConfig {
	    default_channel: string;
	    fade: boolean;
	    fade_timeout: number;
	    user_blacklist: string[];
	
	    static createFrom(source: any = {}) {
	        return new KickConfig(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.default_channel = source["default_channel"];
	        this.fade = source["fade"];
	        this.fade_timeout = source["fade_timeout"];
	        this.user_blacklist = source["user_blacklist"];
	    }
	}
	export class YouTubeConfig {
	    channel_id: string;
	    video_url: string;
	    fade: boolean;
	    fade_timeout: number;
	    user_blacklist: string[];
	
	    static createFrom(source: any = {}) {
	        return new YouTubeConfig(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.channel_id = source["channel_id"];
	        this.video_url = source["video_url"];
	        this.fade = source["fade"];
	        this.fade_timeout = source["fade_timeout"];
	        this.user_blacklist = source["user_blacklist"];
	    }
	}
	export class TwitchConfig {
	    default_channel: string;
	    fade: boolean;
	    fade_timeout: number;
	    bots: boolean;
	    hide_commands: boolean;
	    hide_badges: boolean;
	    user_blacklist: string[];
	
	    static createFrom(source: any = {}) {
	        return new TwitchConfig(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.default_channel = source["default_channel"];
	        this.fade = source["fade"];
	        this.fade_timeout = source["fade_timeout"];
	        this.bots = source["bots"];
	        this.hide_commands = source["hide_commands"];
	        this.hide_badges = source["hide_badges"];
	        this.user_blacklist = source["user_blacklist"];
	    }
	}
	export class Theme {
	    id: string;
	    name: string;
	    font_family: string;
	    font_size: number;
	    line_height: number;
	    message_bg: string;
	    message_padding: string;
	    message_radius: number;
	    message_gap: number;
	    username_weight: number;
	    show_colon: boolean;
	    badge_size: number;
	    emote_size: number;
	    show_avatars: boolean;
	    avatar_size: number;
	    text_shadow: string;
	    text_color: string;
	
	    static createFrom(source: any = {}) {
	        return new Theme(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.font_family = source["font_family"];
	        this.font_size = source["font_size"];
	        this.line_height = source["line_height"];
	        this.message_bg = source["message_bg"];
	        this.message_padding = source["message_padding"];
	        this.message_radius = source["message_radius"];
	        this.message_gap = source["message_gap"];
	        this.username_weight = source["username_weight"];
	        this.show_colon = source["show_colon"];
	        this.badge_size = source["badge_size"];
	        this.emote_size = source["emote_size"];
	        this.show_avatars = source["show_avatars"];
	        this.avatar_size = source["avatar_size"];
	        this.text_shadow = source["text_shadow"];
	        this.text_color = source["text_color"];
	    }
	}
	export class ThemeConfig {
	    active_theme_id: string;
	    custom_themes: Theme[];
	
	    static createFrom(source: any = {}) {
	        return new ThemeConfig(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.active_theme_id = source["active_theme_id"];
	        this.custom_themes = this.convertValues(source["custom_themes"], Theme);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class VanishKeybind {
	    keybind: string;
	    activation_message: string;
	
	    static createFrom(source: any = {}) {
	        return new VanishKeybind(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.keybind = source["keybind"];
	        this.activation_message = source["activation_message"];
	    }
	}
	export class Keybinds {
	    vanish: VanishKeybind;
	
	    static createFrom(source: any = {}) {
	        return new Keybinds(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.vanish = this.convertValues(source["vanish"], VanishKeybind);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class General {
	    language: string;
	    show_timestamps: boolean;
	
	    static createFrom(source: any = {}) {
	        return new General(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.language = source["language"];
	        this.show_timestamps = source["show_timestamps"];
	    }
	}
	export class WindowState {
	    x: number;
	    y: number;
	    width: number;
	    height: number;
	    is_click_through: boolean;
	    is_transparent: boolean;
	
	    static createFrom(source: any = {}) {
	        return new WindowState(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.x = source["x"];
	        this.y = source["y"];
	        this.width = source["width"];
	        this.height = source["height"];
	        this.is_click_through = source["is_click_through"];
	        this.is_transparent = source["is_transparent"];
	    }
	}
	export class Config {
	    version: string;
	    window_state: WindowState;
	    general: General;
	    keybinds: Keybinds;
	    theme: ThemeConfig;
	    twitch: TwitchConfig;
	    youtube: YouTubeConfig;
	    kick: KickConfig;
	
	    static createFrom(source: any = {}) {
	        return new Config(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.version = source["version"];
	        this.window_state = this.convertValues(source["window_state"], WindowState);
	        this.general = this.convertValues(source["general"], General);
	        this.keybinds = this.convertValues(source["keybinds"], Keybinds);
	        this.theme = this.convertValues(source["theme"], ThemeConfig);
	        this.twitch = this.convertValues(source["twitch"], TwitchConfig);
	        this.youtube = this.convertValues(source["youtube"], YouTubeConfig);
	        this.kick = this.convertValues(source["kick"], KickConfig);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	
	
	
	
	
	
	

}

