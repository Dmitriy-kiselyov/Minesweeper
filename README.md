# Minesweeper
Well, and here goes another minesweeper widget. But this one is
way better then those on the Internet.

Better how?

### 1) Easy scaling

![Imgur](https://i.imgur.com/bHHaJzY.png)

Game uses _em_ unit for sizing, allowing fluent scaling with __pure css__.
All you need is just changing parent size with `style = "font-size = _ px"` (equal to cell size).

### 2) Clear image on every screen

![Imgur](https://i.imgur.com/tp1bhRv.png)

Game uses __svg-graphics__ so it allows stretching game field without quality loss.

### 3) Uses callbacks
Allows user to subscribe for 3 event types:
- `onGameOver(cb(time))`
- `onWin(cb(time))`
- `onReset(cb)`

![Imgur](https://i.imgur.com/ZH5s4VM.png)
(Bottom line was printed with callback).

### 4) Animation
Good design, fluent animations and control

![Imgur](https://i.imgur.com/H4DDvHb.gif)

You can play this game by this [link]( https://dmitriy-kiselyov.github.io/Minesweeper/).