# Ghost Chat

Desktop chat overlay for streamers — one always-on-top window rendering live chat from multiple platforms.

## Language

**Platform**:
A chat source Ghost Chat can connect to: Twitch, YouTube, or Kick. Identified everywhere by a lowercase string constant defined once in Go.
_Avoid_: service, provider, source

**Chat Client**:
The per-platform adapter that maintains a live connection to a platform's chat and hands Chat Messages to the app. All Chat Clients satisfy one interface: `Connect(input string) error`, `Disconnect()`. Connect while connected disconnects first, then reconnects.
_Avoid_: connector, integration

**Chat Message**:
The platform-neutral message model that crosses from Go to the frontend as the `chat:message` event. Parsers in each Chat Client map raw platform payloads into it.
_Avoid_: chat event, payload

**Message Fragment**:
A segment of a Chat Message's content — plain text or an emote image. Fragments are the only content encoding that crosses to the frontend; an emote fragment always carries its image URL. Offset-based emote positions (Twitch IRC) are converted to fragments inside the Twitch Chat Client, indexed by Unicode code points.
_Avoid_: run, token, emote offsets

**Message Filter**:
The pure module deciding which Chat Messages display and how they fade: `shouldDisplay`, `fadePolicy`, `classifyEvent`. Filtering happens at intake — a rejected Chat Message is dropped permanently, and config changes are not retroactive.
_Avoid_: display logic, message handler
