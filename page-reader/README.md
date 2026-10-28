# Page Reader

Scan a page from a learning book, hear it read aloud, and get highlights.

- **Scan**: take a photo or choose an image. Text recognition (Tesseract.js) runs in the browser, so the photo is never uploaded.
- **Read aloud**: play, pause, skip sentences, change speed and voice. The sentence being read is shaded and the current word is lit up.
- **Highlights**: sentences that look like definitions or key points are marked green automatically. Turn on the Highlighter to mark your own (yellow). The Highlights list can be read aloud, copied or shared.
- **Key terms**: words the page repeats; tap one to show every place it appears.
- **My pages**: the last 30 scanned pages are kept on the device.

## Run it

```
node server.js
```

Then open `http://localhost:8080/page-reader/`. On a phone, use your computer's IP address. Installing it as an app and using it offline need HTTPS (or localhost).

An internet connection is needed the first time you scan, to download the text recognizer.
