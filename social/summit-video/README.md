# Nigeria 2.0 X video

An X (Twitter) video made from the seamless carousel panorama (`../summit-carousel`). A camera moves across the 7560x1350 scene. Text reveals as each slide arrives, the gold thread draws itself in, the stats count up, and the gold bars rise on the closing slide.

```bash
npm run video:render                          # about 9 min, writes out/
npx vitest run tests/summit-video.test.ts     # gate tests (also part of npm test)
```

## Outputs (gitignored, in `out/`)

| File                                    | Use                                                                   |
| --------------------------------------- | --------------------------------------------------------------------- |
| `nigeria20-x-4x5.mp4`                   | **Main X post.** 1080x1350, fills the mobile feed. About 35 s         |
| `nigeria20-x-16x9.mp4`                  | Desktop or website embed. 1920x1080, two slides per frame. About 33 s |
| `x-4x5-poster.jpg`, `x-16x9-poster.jpg` | Thumbnail (the cover at 1.5 s)                                        |
| `*-spot1..4.png`                        | Spot frames: cover, mid-pan, stats counted, closing slide             |
| `report.json`                           | Durations, arrival times, loudness, ffprobe checks                    |

Both are H.264 yuv420p, CRF 18, 30 fps, AAC 48 kHz 192k, with faststart. Audio is normalised to -14 LUFS with a -1.5 dBTP ceiling. They fit X's limits (2:20 max, 1920x1200 max).

## How it works

| Piece    | File                                     | Notes                                                                                                                                   |
| -------- | ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Timeline | `timeline.ts`                            | Pure function `stateAt(frame, format)`. No wall clock, no randomness                                                                    |
| Frames   | `video.spec.ts`                          | Playwright loads the carousel HTML (X copy), applies each state, takes a screenshot and pipes the PNG into FFmpeg                       |
| Sound    | `audio.ts`                               | FFmpeg-synthesised A major 9 pad, a seeded pink-noise whoosh per pan, a low hit at 0 s, a chime on the closing slide. Two-pass loudnorm |
| Copy     | `../summit-carousel/content.ts` `forX()` | Same facts as the carousel. "Swipe" is dropped, and Save/Share become Bookmark/Repost                                                   |

## Framing rule

The carousel keeps all text 60px inside each slide, and the camera only rests where every slide in view is either whole or shows at most 60px. So text is never cut by the frame edge.

- 4:5: one slide per stop, at 1x.
- 16:9: two slides per stop plus 60px of each neighbour (scale 1920/2280), cropping 12px from the top and the rest from the skyline.

`tests/summit-video.test.ts` enforces this, along with monotonic panning, full reveal before the camera leaves a slide, the thread completing with its arrowhead, count-up landing on the real figures, a usable frame 0 and X's size and length limits. The render runs the carousel layout rules on the X copy before it draws any frame, then checks each MP4 with motion-studio's `verify_media.sh`.

## Editing

- Timing: `HOLDS_4X5` and the `x-16x9` stops in `timeline.ts`.
- Copy: `../summit-carousel/content.ts` (it flows into both the carousel and the video).
- Re-render, then look at `out/*-spot*.png` before posting.
