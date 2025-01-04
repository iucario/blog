---
title: FFMPEG cheatsheet
description: FFMPEG cheatsheet
pubDatetime: 2024-12-22T00:00:00Z
modDatetime: 2024-12-22T00:00:00Z
tags:
  - tool
  - cmd
---

Commands I often use.

- Crop video spatially. w, h, Left-up position\
    `ffmepg -i input.mp4 -vf "crop=400:500:0:0:" out.mp4`
- Select 1 frame out of every 10 frames\
    `ffmpeg -i input.mov -vf "select=not(mod(n\,10))" -vsync vfr -q:v 2 img_%03d.jpg`
- Extract the sound from a video and save it as MP3:\
    `ffmpeg -i video.mp4 -vn sound.mp3`
- MP3 to WAV 48000hz and mono\
    `ffmepg -i audio.mp3 -ab 48000 -ac 1 output.wav`
- Convert frames from a video or GIF into individual numbered images:\
    `ffmpeg -i video.mpg|video.gif frame_%d.png`
- Combine numbered images (frame_1.jpg, frame_2.jpg, etc) into a video or GIF:\
    `ffmpeg -i frame_%d.jpg -f image2 video.mpg|video.gif`
- Quickly extract a single frame from a video at time mm:ss and save it as a 128x128 resolution image:\
    `ffmpeg -ss mm:ss -i video.mp4 -frames 1 -s 128x128 -f image2 image.png`
- Trim a video from a given start time mm:ss to an end time mm2:ss2 (omit the -to flag to trim till the end):\
    `ffmpeg -ss mm:ss -to mm2:ss2 -i video.mp4 -codec copy output.mp4`
- Concat\
    Create a text file containing files to concat.

    ```bash
    # this is a comment
    file '/path/to/file1.wav'
    file '/path/to/file2.wav'
    file '/path/to/file3.wav'
    ```

    `ffmpeg -f concat -safe 0 -i mylist.txt output.wav`\
    One line command. Use absolute path.\
    `ffmpeg -f concat -safe 0 -i <(for f in ./*.wav; do echo "file '$PWD/$f'"; done) -c copy output.wav`\
    See: <https://trac.ffmpeg.org/wiki/Concatenate>
- Scale\
    `ffmpeg -i input.jpg -vf scale=320:-1 output_320.png`
- FPS\
    `ffmpeg -i <input> -filter:v fps=30 <output>`
- bitrate\
    `ffmpeg -i input -c:v libx264 -b:v 2M -maxrate 2M -bufsize 1M output.mp4`
- Subtitle with transparent background\
   `ffmpeg -i input.mp4 -vf subtitles=sub.vtt:force_style="'FontSize=20,OutlineColour=&H80000000,BorderStyle=3,FontName=PT mono,Bold=1'" out.mp4`
- Speed up video 2 times\
   `ffmpeg -i input.mp4 -filter:v "setpts=0.5*PTS" output.mp4`
