# Audio Audit — Missing Files

    All files live in `public/audio/`. Target format: MP3, ~128kbps, 2–4 MB for ambience loops, <1 MB for SFX.

    ## Missing Ambience (looping)

    | Filename | Sound Registry Label | Notes |
    |---|---|---|
    | `ambience-battle.mp3` | Distant Battle | Distant crowd/clash, ideally 60–90s seamless loop |
    | `ambience-cave.mp3` | Cave Drips | Dripping water echo, low rumble |
    | `ambience-ocean.mp3` | Ocean Waves | Coastal waves, search "ocean waves loop seamless" |
    | `ambience-ship.mp3` | Ship Deck | Wood creak, rigging, water — search "ship deck ambience" |
    | `ambience-storm.mp3` | Storm | Rain + rolling thunder, search "storm rain loop" |

    ## Missing SFX (one-shot)

    | Filename | Sound Registry Label | Notes |
    |---|---|---|
    | `sfx-arrow.mp3` | Arrow Fire | Bowstring + whoosh |
    | `sfx-ghost.mp3` | Ghost Moan | Ethereal moan/wail — try OpenGameArt packs |
    | `sfx-magic.mp3` | Magic Spell | Sparkle/whoosh — try OpenGameArt "fantasy sfx CC0" |
    | `sfx-sword-clash.mp3` | Sword Clash | Metal on metal impact |

    ## Recommended Sources

    - **Freesound.org** — filter by License: CC0. Best for ambience field recordings.
      - Search tips: "seamless loop" + subject, e.g. "ocean waves seamless loop"
    - **OpenGameArt.org** — search "fantasy sound effects CC0". Often whole packs covering ghost/magic/sword in one download.
    - **Pixabay (audio)** — all CC0 by default, good for storm/ocean/ship.

    ## Conversion

    If source files are WAV, convert to MP3 before dropping in:
    `ffmpeg -i input.wav -b:a 128k output.mp3`

    ---
    On your other points: good to know the GM Screen scaffolding exists intentionally — worth keeping the 'gm-screen' file type as-is then. And yes on the shortcut help menu, a ? button in the toolbar
    that opens a small dialog listing keyboard shortcuts would be clean and consistent across all tools that have them.
