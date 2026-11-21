/**
 * Synthesised soundtrack, built entirely by FFmpeg from the timeline:
 * a warm A major 9 pad, a soft whoosh on every pan, a low hit on frame 0 and
 * a chime when the camera lands on the closing slide. Seeded noise, so the
 * audio is identical on every render. No samples, no licences, no network.
 */
import { PAN, arrival, duration, segments, type Format } from "./timeline";

const n = (x: number) => x.toFixed(3);

/** Pad partials: A2, E3, A3, C#4, G#4, B4 (Hz, gain). */
const PAD: [number, number][] = [
  [110, 0.13],
  [164.81, 0.09],
  [220, 0.07],
  [277.18, 0.055],
  [415.3, 0.03],
  [493.88, 0.025],
];

export const padExpr = (detune: number, d: number): string => {
  const env = `min(1,t/2.4)*min(1,(${n(d)}-t)/1.6)`;
  const trem = `(0.82+0.18*sin(2*PI*0.21*t))`;
  const tones = PAD.map(([f, g]) => `${g}*sin(2*PI*${n(f + detune)}*t)`).join("+");
  return `${env}*${trem}*(${tones})`;
};

/** Volume envelope: a sin^2 swell over each pan. */
export const whooshEnvelope = (f: Format): string =>
  segments(f)
    .filter((s) => s.kind === "pan")
    .map(
      (s) =>
        `between(t,${n(s.start - 0.1)},${n(s.end)})*pow(sin(PI*(t-${n(s.start - 0.1)})/${n(PAN + 0.1)}),2)`,
    )
    .join("+");

export const chimeAt = (f: Format): number => arrival(f, 6) - 0.05;

export const chimeExpr = (s: number): string =>
  `gte(t,${n(s)})*exp(-2.6*(t-${n(s)}))*(0.16*sin(2*PI*880*t)+0.08*sin(2*PI*1318.51*t)+0.05*sin(2*PI*1760*t))`;

export const hitExpr = "0.55*exp(-5*t)*sin(2*PI*55*t)";

/** ffmpeg arguments that write the raw (un-normalised) stereo mix to `out`. */
export const rawMixArgs = (f: Format, out: string): string[] => {
  const d = duration(f);
  return [
    "-y",
    "-f",
    "lavfi",
    "-i",
    `aevalsrc='${padExpr(0, d)}|${padExpr(0.35, d)}':s=48000:d=${n(d)}`,
    "-f",
    "lavfi",
    "-i",
    `anoisesrc=d=${n(d)}:c=pink:r=48000:a=0.6:seed=2026`,
    "-f",
    "lavfi",
    "-i",
    `aevalsrc='${chimeExpr(chimeAt(f))}+${hitExpr}':s=48000:d=${n(d)}`,
    "-filter_complex",
    [
      `[1:a]volume=eval=frame:volume='0.55*(${whooshEnvelope(f)})',highpass=f=250,lowpass=f=2600,aformat=channel_layouts=stereo[wh]`,
      `[2:a]aformat=channel_layouts=stereo[ch]`,
      `[0:a]lowpass=f=1800[pad]`,
      `[pad][wh][ch]amix=inputs=3:normalize=0,aecho=0.8:0.55:70|140:0.22|0.12,atrim=0:${n(d)}[a]`,
    ].join(";"),
    "-map",
    "[a]",
    "-c:a",
    "pcm_s16le",
    out,
  ];
};

/** Pull the loudnorm JSON block out of ffmpeg's stderr. */
export const parseLoudnorm = (stderr: string): Record<string, string> => {
  const m = /\{[^{}]*"input_i"[^{}]*\}/.exec(stderr);
  if (!m) throw new Error("loudnorm summary not found in ffmpeg output");
  return JSON.parse(m[0]);
};

export const LUFS = -14;
export const TRUE_PEAK = -1.5;

export const loudnormFilter = (measured?: Record<string, string>): string => {
  const base = `loudnorm=I=${LUFS}:TP=${TRUE_PEAK}:LRA=11`;
  if (!measured) return `${base}:print_format=json`;
  return `${base}:measured_I=${measured.input_i}:measured_TP=${measured.input_tp}:measured_LRA=${measured.input_lra}:measured_thresh=${measured.input_thresh}:offset=${measured.target_offset}:linear=true:print_format=json`;
};
