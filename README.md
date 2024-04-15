# Asteroids
My version of the classic [1979 Asteroids game](https://en.wikipedia.org/wiki/Asteroids_(video_game)) 

## Playable Game
https://github.com/bartek-swiderski92/asteroids-game

## Controlls
`↑` Main thruster \
`→` Right thruster \
`←` Left Thruster \
`Space` Shot \
`Esc` Pause \
`G` Grid (graphic effect) \
`R` Respawn shield (graphic effect) \

## Changelog

### 1.1 Technical improvements 
- Replaced active elements arrays with js maps for better performence and stuck node fix
- Changed stacking context of UI and in game elements
- NaN in the fps counter fix
- Asteroid respawn logic
- Safe respawn circle available under the `R` button
- optionsl controlls description in pause menu

### 1.0 Base version of the game
- Game customisation avialable trough the option object (ship and asteroid size, thruster powers, weapon reload speed and power, starting asteroids, colours shapes and much more)
- True weightlessness 
- Graphic guide available when on the `G` key - coordinages grid, colision lines, colision circles
- Sound effects & sound track
- Explosions on destroyed asteroids
- FPS counter
- Dynamic HealthBar
- Leveling up - each game level adds one extra asteroid, increases max health points and recovers portion of it
- On screen score and current level
- Pause state
- Game over state

