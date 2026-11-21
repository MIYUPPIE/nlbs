/**
 * Renders the Nigeria 2.0 X video from the carousel panorama.
 *
 *   npm run video:render
 *
 * For each format (4:5 1080x1350, 16:9 1920x1080) it:
 *   1. builds the carousel HTML with X copy (Bookmark / Repost, no "Swipe")
 *   2. runs the carousel layout rules on that variant
 *   3. drives every frame from timeline.stateAt() and screenshots it
 *   4. pipes PNG frames into FFmpeg (H.264, yuv420p, CRF 18, faststart)
 *   5. muxes the synthesised soundtrack, loudness-normalised to -14 LUFS
 *   6. verifies the file with motion-studio's verify_media.sh and saves spot frames
 *
 * Output (gitignored) in social/summit-video/out/.
 */
import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { expect, test, type Page } from "@playwright/test";
import { checkLayout } from "../summit-carousel/checks";
import { forX } from "../summit-carousel/content";
import { buildHtml } from "../summit-carousel/html";
import { PANORAMA_W, SLIDE_H } from "../summit-carousel/layout";
import { LUFS, loudnormFilter, parseLoudnorm, rawMixArgs } from "./audio";
import {
  FORMATS,
  FPS,
  arrival,
  blockProgress,
  countText,
  duration,
  frameCount,
  stateAt,
  type Format,
} from "./timeline";

const HERE = __dirname;
const ROOT = join(HERE, "..", "..");
const CAROUSEL = join(HERE, "..", "summit-carousel");
const OUT = join(HERE, "out");
const VERIFY = join(homedir(), ".claude/skills/motion-studio/scripts/verify_media.sh");
const fileUrl = (p: string) => pathToFileURL(p).href;

const run = (cmd: string, args: string[]) => {
  const r = spawnSync(cmd, args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  if (r.status !== 0) throw new Error(`${cmd} failed (${r.status}):\n${r.stderr?.slice(-3000)}`);
  return r;
};

/** Installs window.__apply(state) and returns how many reveal blocks each slide has. */
const installRig = async (page: Page, f: Format): Promise<number[]> =>
  page.evaluate(
    ({ w, h, scale }) => {
      document.documentElement.style.cssText = `width:${w}px;height:${h}px;overflow:hidden`;
      document.body.style.cssText = `width:${w}px;height:${h}px;overflow:hidden`;
      const pano = document.getElementById("pano")!;
      pano.style.transformOrigin = "0 0";
      pano.style.willChange = "transform";

      const sections = Array.from(document.querySelectorAll<HTMLElement>("section[data-slide]"));
      const blocks = sections.map((s) => Array.from(s.children) as HTMLElement[]);

      const threadSvg = document.querySelector<SVGSVGElement>("svg.thread")!;
      const paths = Array.from(threadSvg.querySelectorAll("path")) as SVGPathElement[];
      const main = threadSvg.querySelector<SVGPathElement>("#threadPath")!;
      const marker = main.getAttribute("marker-end") ?? "";
      const len = paths.map((p) => p.getTotalLength());
      const bbox = main.getBBox();
      paths.forEach((p, i) => (p.style.strokeDasharray = `${len[i]} ${len[i]}`));
      const nodes = Array.from(threadSvg.querySelectorAll("circle")) as SVGCircleElement[];

      const stats = Array.from(document.querySelectorAll<HTMLElement>(".stat-value"));
      stats.forEach((s) => (s.dataset.final = s.textContent ?? ""));
      const ring = document.querySelector<SVGSVGElement>("svg.ring")!;
      const bars = document.querySelector<SVGSVGElement>("svg.bars")!;
      bars.style.transformOrigin = "50% 100%";

      const fade = document.createElement("div");
      fade.style.cssText = `position:fixed;inset:0;background:#071a33;opacity:0;pointer-events:none;z-index:99`;
      document.body.appendChild(fade);

      type S = {
        cameraX: number;
        cameraY: number;
        blocks: number[][];
        threadX: number;
        statTexts: string[];
        bars: number;
        orbit: number;
        fadeOut: number;
      };
      (window as unknown as { __apply: (s: S) => void }).__apply = (s: S) => {
        pano.style.transform = `scale(${scale}) translate(${-s.cameraX}px, ${-s.cameraY}px)`;
        blocks.forEach((bs, i) =>
          bs.forEach((el, b) => {
            const p = s.blocks[i][b] ?? 1;
            el.style.opacity = String(p);
            el.style.transform = `translateY(${(1 - p) * 28}px)`;
          }),
        );
        const frac = Math.min(1, Math.max(0, (s.threadX - bbox.x) / bbox.width));
        paths.forEach((p, i) => (p.style.strokeDashoffset = String(len[i] * (1 - frac))));
        if (frac >= 0.995) main.setAttribute("marker-end", marker);
        else main.removeAttribute("marker-end");
        nodes.forEach((c) => {
          const x = Number(c.getAttribute("cx"));
          c.style.opacity = String(Math.min(1, Math.max(0, (s.threadX - x) / 60)));
        });
        stats.forEach((el, i) => (el.textContent = s.statTexts[i]));
        ring.style.transform = `rotate(${s.orbit}deg)`;
        bars.style.transform = `scaleY(${s.bars})`;
        fade.style.opacity = String(s.fadeOut);
      };
      return blocks.map((b) => b.length);
    },
    { w: f.width, h: f.height, scale: f.scale },
  );

/** Soundtrack for one format: raw mix, then two-pass loudnorm to -14 LUFS / -1.5 dBTP. */
const buildAudio = (f: Format) => {
  const raw = join(OUT, `${f.id}.audio.raw.wav`);
  const audio = join(OUT, `${f.id}.audio.wav`);
  run("ffmpeg", rawMixArgs(f, raw));
  const measured = parseLoudnorm(
    run("ffmpeg", ["-i", raw, "-af", loudnormFilter(), "-f", "null", "-"]).stderr,
  );
  run("ffmpeg", [
    "-y",
    "-loglevel",
    "error",
    "-i",
    raw,
    "-af",
    loudnormFilter(measured),
    "-ar",
    "48000",
    audio,
  ]);
  const check = parseLoudnorm(
    run("ffmpeg", ["-i", audio, "-af", loudnormFilter(), "-f", "null", "-"]).stderr,
  );
  return { audio, lufs: Number(check.input_i), truePeak: Number(check.input_tp) };
};

const renderFormat = async (page: Page, f: Format, htmlPath: string, audio: string) => {
  await page.setViewportSize({ width: PANORAMA_W, height: SLIDE_H });
  await page.goto(fileUrl(htmlPath));
  const layout = await checkLayout(page);
  expect(layout.errors, `layout rules on the X variant (${f.id})`).toEqual([]);

  await page.setViewportSize({ width: f.width, height: f.height });
  const blockCounts = await installRig(page, f);
  const finals = await page.$$eval(".stat-value", (els) =>
    els.map((e) => (e as HTMLElement).dataset.final ?? ""),
  );

  const silent = join(OUT, `${f.id}.silent.mp4`);
  const enc = spawn(
    "ffmpeg",
    [
      "-y",
      "-loglevel",
      "error",
      "-f",
      "image2pipe",
      "-c:v",
      "png",
      "-framerate",
      String(FPS),
      "-i",
      "-",
      "-c:v",
      "libx264",
      "-preset",
      "slow",
      "-crf",
      "18",
      "-pix_fmt",
      "yuv420p",
      "-r",
      String(FPS),
      "-movflags",
      "+faststart",
      silent,
    ],
    { stdio: ["pipe", "inherit", "pipe"] },
  );
  let encErr = "";
  enc.stderr.on("data", (d) => (encErr += d));
  const done = new Promise<number>((res) => enc.on("close", (c) => res(c ?? 1)));

  for (let frame = 0; frame < frameCount(f); frame++) {
    const s = stateAt(frame, f);
    await page.evaluate((st) => (window as unknown as { __apply: (x: unknown) => void }).__apply(st), {
      cameraX: s.cameraX,
      cameraY: s.cameraY,
      blocks: blockCounts.map((count, i) =>
        Array.from({ length: count }, (_, b) => blockProgress(f, s.t, i, b)),
      ),
      threadX: s.threadX,
      statTexts: finals.map((v) => countText(v, s.count)),
      bars: s.bars,
      orbit: s.orbit,
      fadeOut: s.fadeOut,
    });
    const png = await page.screenshot({ type: "png" });
    if (!enc.stdin.write(png)) await new Promise((r) => enc.stdin.once("drain", r));
  }
  enc.stdin.end();
  const code = await done;
  if (code !== 0) throw new Error(`ffmpeg encode failed: ${encErr}`);

  const final = join(OUT, `nigeria20-${f.id}.mp4`);
  run("ffmpeg", [
    "-y",
    "-loglevel",
    "error",
    "-i",
    silent,
    "-i",
    audio,
    "-map",
    "0:v",
    "-map",
    "1:a",
    "-c:v",
    "copy",
    "-c:a",
    "aac",
    "-b:a",
    "192k",
    "-ar",
    "48000",
    "-shortest",
    "-movflags",
    "+faststart",
    final,
  ]);
  return { final, blockCounts };
};

test("render the Nigeria 2.0 X video", async ({ page }) => {
  test.setTimeout(30 * 60_000);
  mkdirSync(OUT, { recursive: true });

  const html = buildHtml(
    forX(),
    (p) => fileUrl(join(ROOT, "public", p)),
    (file) => fileUrl(join(CAROUSEL, "fonts", file)),
  );
  const htmlPath = join(OUT, "x-panorama.html");
  writeFileSync(htmlPath, html);

  const report: Record<string, unknown> = { renderedAt: new Date().toISOString(), fps: FPS, outputs: [] };

  for (const f of Object.values(FORMATS)) {
    const { audio, lufs, truePeak } = buildAudio(f);
    expect(Math.abs(lufs - LUFS), `${f.id} integrated loudness ${lufs} LUFS`).toBeLessThan(1);
    const { final, blockCounts } = await renderFormat(page, f, htmlPath, audio);
    const v = spawnSync(
      "bash",
      [
        VERIFY,
        final,
        "--width",
        String(f.width),
        "--height",
        String(f.height),
        "--fps",
        String(FPS),
        "--duration",
        duration(f).toFixed(2),
        "--tolerance",
        "0.1",
        "--audio",
        "--faststart",
      ],
      { encoding: "utf8" },
    );
    expect(existsSync(VERIFY), "motion-studio verify_media.sh present").toBe(true);
    expect(v.status, v.stdout + v.stderr).toBe(0);

    // Spot frames: cover, mid-pan, stats counted, closing slide.
    const spots = [0.6, arrival(f, 1) - 0.45, arrival(f, 2) + 2.6, arrival(f, 6) + 2.5];
    spots.forEach((t, i) =>
      run("ffmpeg", [
        "-y",
        "-loglevel",
        "error",
        "-ss",
        t.toFixed(2),
        "-i",
        final,
        "-frames:v",
        "1",
        join(OUT, `${f.id}-spot${i + 1}.png`),
      ]),
    );
    run("ffmpeg", [
      "-y",
      "-loglevel",
      "error",
      "-ss",
      "1.5",
      "-i",
      final,
      "-frames:v",
      "1",
      "-q:v",
      "2",
      join(OUT, `${f.id}-poster.jpg`),
    ]);
    (report.outputs as unknown[]).push({
      format: f.id,
      file: final,
      duration: duration(f),
      frames: frameCount(f),
      arrivals: Array.from({ length: 7 }, (_, i) => Number(arrival(f, i).toFixed(2))),
      audio: { integratedLufs: lufs, truePeak, target: LUFS },
      verify: v.stdout.trim().split("\n"),
      blockCounts,
    });
  }

  writeFileSync(join(OUT, "report.json"), JSON.stringify(report, null, 2));
});
