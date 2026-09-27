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
A segment of a Chat Message's content, of one Fragment Kind: plain text, an emote image, or a GIF. Fragments are the only content encoding that crosses to the frontend; emote and GIF fragments always carry their image URL and keep their source text as the fallback shown when the image is hidden. Fragment Kinds are lowercase string constants defined once in Go (`chat.FragmentText`, `chat.FragmentEmote`, `chat.FragmentGif`).
_Avoid_: run, token, emote offsets

**Entity**:
A positioned span of a Chat Message's text that becomes a non-text Message Fragment — an emote or a GIF — carrying its Fragment Kind and image URL. Offset-based positions (the Twitch IRC `emotes` and `gifs` tags, plus third-party emote word matches) are parsed into Entities and converted to fragments inside the Twitch Chat Client, indexed by Unicode code points. Where Entities overlap, the earliest start wins; on a tie, GIFs win.
_Avoid_: emote offsets, placement

**GIF**:
An inline animated image a Twitch viewer attaches to a message, delivered in the PRIVMSG `gifs` tag as `start-end|gifID|gifURL` entries. Its placeholder text is covered by the GIF's position, so hiding GIFs shows that text instead. Only PRIVMSG carries GIFs; Twitch event messages (USERNOTICE) never render them.
_Avoid_: animated emote, sticker

**Message Filter**:
The pure module deciding which Chat Messages display and how they fade: `shouldDisplay`, `fadePolicy`, `classifyEvent`. Filtering happens at intake — a rejected Chat Message is dropped permanently, and config changes are not retroactive.
_Avoid_: display logic, message handler
