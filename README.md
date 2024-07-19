![image](https://github.com/user-attachments/assets/5548a6fd-aea2-45cb-baf7-34a4e841cfda)


# Asteroids
<img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" />&nbsp;&nbsp;
<img src="https://img.shields.io/badge/OOP-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" />&nbsp;&nbsp;
<img src="https://img.shields.io/badge/SVG-ffb13b?style=for-the-badge&logo=svg&logoColor=black" />&nbsp;&nbsp;    
Custom version of the classic [1979 Asteroids game](https://en.wikipedia.org/wiki/Asteroids_(video_game)) 

The project is heavly focused on object oriented programming and maintaining its state in a game loop triggered on `requestAnimationFrame` method. Each element is fully rendered in SVG and manipulated by transformations, most elements are drawn as `path` svg elements, grouped by the `g` tags. Detailed list of the features is listed below in the change log

## Playable Game

https://bartek-swiderski92.github.io/asteroids-game/

## Controls
`↑` Main thruster \
`→` Right thruster \
`←` Left Thruster \
`Space` Shot \
`Esc` Pause \
`G` Grid (graphic effect) \
`R` Respawn shield (graphic effect) 

## Changelog

### 1.1 Technical improvements 
- Replaced active elements arrays with JS maps for better performance and stuck node fix
- Changed stacking context of UI and in game elements
- NaN in the fps counter fix
- Asteroid respawn logic
- Safe respawn circle available under the `R` button
- options controls description in pause menu

### 1.0 Base version of the game
- Game customisation available through the option object (ship and asteroid size, thruster powers, weapon reload speed, weapon power, initial count of asteroidsasteroids, colours, shapes and much more)
- True weightlessness 
- Graphic guide available when on the `G` key - coordinates grid, collision lines, collision circles
- Sound effects & sound track
- Explosions on destroyed asteroids
- FPS counter
- Dynamic Health Bar
- Levelling up - each game level adds one extra asteroid, increases max health points and recovers portion of it
- On screen score and current level
- Pause state
- Game over state

## Gallery

New Game: <br>

![image](https://github.com/user-attachments/assets/2c58d4ba-ff20-456b-87b1-96610f541d8f)

Thruster: <br>

![image](https://github.com/user-attachments/assets/632c92b5-7721-48cb-b4a4-0dfc3733b7a0)

Coordinates grid, collision lines and collision circles: <br>
![image](https://github.com/user-attachments/assets/7858ba48-f6a0-472c-90c9-896615d5a470)

Pause state: <br>
![image](https://github.com/user-attachments/assets/9ad388f6-0144-4c01-8a1d-3e7db5c09e77)

Gameplay: <br>
![image](https://github.com/user-attachments/assets/983479c9-8f21-4e24-b3c4-0ac80aace080)

GameOver state: <br>
![image](https://github.com/user-attachments/assets/b3459dca-ce46-4118-bcf9-1ee100f7a518)
