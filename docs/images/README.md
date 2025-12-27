# docs/images — Image guidelines & boilerplate links

This folder is for storing screenshots and static images used in the project README and docs. Below are copy-paste-ready markdown snippets and guidance for linking images in `README.md`.

## Recommended filenames
- `frontend.png` — main UI screenshot
- `os_automation.png` — OS automation workflows screenshot
- `voice_system.png` — voice-system screenshot

## Relative path (recommended)
Use this when the images are committed to the repo:

```markdown
<p align="center">
  <img src="docs/images/frontend.png" alt="Frontend UI" width="300" />
  <img src="docs/images/os_automation.png" alt="OS Automation" width="300" />
  <img src="docs/images/voice_system.png" alt="Voice System" width="300" />
</p>
```

## Raw GitHub URL (good for external docs or when image is hosted in a branch)
Replace `<owner>`, `<repo>`, and `<branch>`:

```markdown
<img src="https://raw.githubusercontent.com/<owner>/<repo>/<branch>/docs/images/frontend.png" alt="Frontend UI" width="600" />
```

## Best practices
- Preferred formats: PNG (screenshots), JPG (photos), SVG (icons), GIF/WebP (short animations).
- Keep GIFs short (<5s) and small (<= 5–10 MB) for good GitHub rendering.
- Use meaningful filenames and keep dimensions consistent.

## Example usage in the main `README.md`

```markdown
### Screenshots
<p align="center">
  <img src="docs/images/frontend.png" alt="Frontend UI" width="280" />
  <img src="docs/images/os_automation.png" alt="OS Automation" width="280" />
  <img src="docs/images/voice_system.png" alt="Voice System" width="280" />
</p>
```

Place actual image files into this folder (commit them) and the snippets above will render on GitHub automatically.