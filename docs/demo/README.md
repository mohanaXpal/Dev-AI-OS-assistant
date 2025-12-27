# docs/demo — Animated demo guidelines & boilerplate link

Use this folder for animated demos (GIF/WebP) or short clips that show features in action.

## Recommended filename
- `dev-os-demo.gif`

## Example Markdown
```markdown
![Live demo](docs/demo/dev-os-demo.gif)
```

## Tips
- Keep GIF duration short (<5 seconds) and optimize size (tools: gifsicle, ezgif, ffmpeg -> webp).
- Prefer `webp` for smaller size if supported by your target environment.
- Commit the GIF under `docs/demo/` so it renders on GitHub.