# Asteroids
My version of the classic [1979 Asteroids game](https://en.wikipedia.org/wiki/Asteroids_(video_game)) 

## Playable Game
https://bartek-swiderski92.github.io/asteroids-game/

## Controls
`↑` Main thruster \
`→` Right thruster \
`←` Left Thruster \
`Space` Shot \
`Esc` Pause \
`G` Grid (graphic effect) \
`R` Respawn shield (graphic effect) \

## Changelog

### 1.1 Technical improvements 
- Replaced active elements arrays with JS maps for better performance and stuck node fix
- Changed stacking context of UI and in game elements
- NaN in the fps counter fix
- Asteroid respawn logic
- Safe respawn circle available under the `R` button
- options controls description in pause menu

### 1.0 Base version of the game
- Game customisation available through the option object (ship and asteroid size, thruster powers, weapon reload speed and power, starting asteroids, colours shapes and much more)
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

